import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/videoModel.js";
import { User } from "../models/userModel.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

  if (!userId) {
    throw new ApiError(400, "Please provide a userId");
  }
  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
  };
  const pipeline = [];
  await User.findById(userId);
  if (userId) {
    pipeline.push({
      $match: {
        owner: mongoose.Types.ObjectId(userId),
      },
    });
  }
  if (query) {
    pipeline.push({
      $match: {
        title: {
          $regex: query,
          $options: options,
          isPublished: false,
        },
      },
    });
  }
  let createField = {};
  if (sortBy && sortType) {
    createField[sortBy] = sortType;
    pipeline.push({
      $sort: createField,
    });
  } else {
    pipeline.push({
      $sort: {
        createdAt: -1,
      },
    });
  }
  pipeline.push({
    $skip: (options.page - 1) * options.limit,
  });
  pipeline.push({
    $limit: options.limit,
  });
  const allVideos = await Video.aggregate(pipeline);
  if (!allVideos) {
    throw new ApiError(404, "No videos found");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { allVideos },
        `Total ${allVideos.length} videos found successfully`
      )
    );
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { userId } = req.user;
  const { title, description, isPublished } = req.body;
  if (!userId) {
    throw new ApiError(400, "Please provide a userId");
  }
  if (!title || !description) {
    throw new ApiError(400, "Please provide a title and description");
  }
  const videoUrl = req.files?.video[0]?.path;
  const thumbnailUrl = req.files?.thumbnail[0]?.path;

  if (!videoUrl) {
    throw new ApiError(400, "Please provide a video");
  }
  if (!thumbnailUrl) {
    throw new ApiError(400, "Please provide a thumbnail");
  }

  const uploadVideo = await uploadOnCloudinary(videoUrl, "video");
  const uploadThumbnail = await uploadOnCloudinary(thumbnailUrl, "image");

  const newVideo = await Video.create({
    title,
    description,
    isPublished: isPublished || false,
    videoUrl: uploadVideo?.url,
    thumbnail: uploadThumbnail?.url,
    owner: userId?._id,
    views: 0,
    duration: uploadVideo.duration,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, { newVideo }, "Video published successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, "Please provide a video id");
  }
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }
  const userVideo = await Video.findById(videoId);
  if (!userVideo) {
    throw new ApiError(404, "Video not found");
  }
  if (userVideo.isPublished === false) {
    throw new ApiError(400, "Video not published");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { userVideo }, "Video found successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description, isPublished } = req.body;
  // check if await is required
  const { thumbnail } = req.files?.path;
  if (!videoId) {
    throw new ApiError(400, "Please provide a video id");
  }
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }
  if (!title || !description) {
    throw new ApiError(400, "Please provide a title and description");
  }
  if (!thumbnail) {
    throw new ApiError(400, "Please provide a thumbnail");
  }
  const myvideo = await Video.findById(videoId);
  if (!myvideo) {
    throw new ApiError(404, "Video not found");
  }
  const updatedThumbnail = await uploadOnCloudinary(thumbnail, "image");
  await deleteOnCloudinary(myvideo.thumbnail);

  const updateVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        title: title,
        description: description,
        isPublished: isPublished,
        thumbnail: updatedThumbnail?.url,
      },
    },
    {
      new: true,
    }
  );
  if (!updateVideo) {
    throw new ApiError(404, "Video not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, { updateVideo }, "Video updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, "Please provide a video id");
  }
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }
  const myvideo = await Video.findById(videoId);
  if (!myvideo) {
    throw new ApiError(404, "Video not found");
  }
  await deleteOnCloudinary(myvideo.videoUrl);
  await deleteOnCloudinary(myvideo.thumbnail);
  const deleteVideo = await Video.findByIdAndDelete(videoId);
  if (!deleteVideo) {
    throw new ApiError(404, "Video not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, { deleteVideo }, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, "Please provide a video id");
  }
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }
  const videoExists = await Video.findById(videoId);
  if (!videoExists) {
    throw new ApiError(404, "Video not found");
  }
  if (videoExists.isPublished === false) {
    throw new ApiError(400, "Video not published");
  }
  if (videoExists.owner.toString() !== req.user.userId) {
    throw new ApiError(403, "You are not authorized to update this video");
  }
  const togglePublish = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        isPublished: !videoExists.isPublished,
      },
    },
    {
      new: true,
    }
  );
  if (!togglePublish) {
    throw new ApiError(404, "Video not found");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { togglePublish },
        "Video publish status updated successfully"
      )
    );
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
