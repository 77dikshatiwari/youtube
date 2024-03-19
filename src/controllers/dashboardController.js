import mongoose from "mongoose";
import { Video } from "../models/videoModel.js";
import { Subscription } from "../models/subscriptionModel.js";
import { Like } from "../models/likeModel.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStatus = asyncHandler(async (req, res) => {
  const { userId } = req.user;
  const obj = {};
  const videodetails = await User.aggregate([
    {
      $match: {
        _id: mongoose.Types.ObjectId(userId?._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "_id",
        foreignField: "owner",
        as: "videos",
      },
    },
    {
      $addFields: {
        videos: {
          // check the use of this slice
          $slice: ["$videos", 1],
        },
      },
    },
    {
      $unwind: "$videos",
    },
    {
      $group: {
        _id: "$_id",
        totalVideos: {
          $sum: 1,
        },
        totalViews: {
          $sum: "$videos.views",
        },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "totalSubscribers",
      },
    },
    {
      $addFields: {
        totalSubscribers: {
          $first: "$totalSubscribers",
        },
      },
    },
    {
      $project: {
        _id: 0,
        totalVideos: 1,
        totalViews: 1,
        totalSubscribers: {
          $size: "$totalSubscribers.subscribers",
        },
      },
    },
  ]);
  if (!videodetails) {
    obj["videodetails"] = 0;
    throw new ApiError(404, "No video details found");
  }
  const likedetailsOfVideos = await Video.aggregate([
    {
      $match: {
        owner: mongoose.Types.ObjectId(userId?._id),
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
      },
    },
    {
      $addFields: {
        likes: {
          $size: "$likes",
        },
      },
    },
    {
      $unwind: "$likes",
    },
    {
      $group: {
        _id: "$owner",
        totalLikes: {
          $sum: "$likes",
        },
      },
    },
    {
      $count: "totalLikes",
    },
    {
      $project: {
        _id: 0,
        totalLikes: 1,
      },
    },
  ]);
  if (!likedetailsOfVideos) {
    obj["likedetailsOfVideos"] = 0;
    throw new ApiError(404, "No likedetails found");
  }

  const likeDetailsOfComments = await Comment.aggregate([
    {
      $match: {
        owner: mongoose.Types.ObjectId(userId?._id),
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "comment",
        as: "totalCommentLikes",
      },
    },
    {
      $addFields: {
        likes: {
          $size: "$totalCommentLikes",
        },
      },
    },
    {
      $unwind: "$totalCommentLikes",
    },
    {
      $group: {
        _id: "$owner",
        totalLikes: {
          $sum: "$totalCommentLikes",
        },
      },
    },
    {
      $count: "totalCommentLikes",
    },
    {
      $project: {
        _id: 0,
        totalCommentLikes: 1,
      },
    },
  ]);
  if (!likeDetailsOfComments) {
    obj["likeDetailsOfComments"] = 0;
    throw new ApiError(404, "No likedetails found");
  }

  const likeDetailsOfTweets = await Tweet.aggregate([
    {
      $match: {
        owner: mongoose.Types.ObjectId(userId?._id),
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "tweet",
        as: "totalTweetLikes",
      },
    },
    {
      $addFields: {
        likes: {
          $size: "$totalTweetLikes",
        },
      },
    },
    {
      $unwind: "$totalTweetLikes",
    },
    {
      $group: {
        _id: "$owner",
        totalLikes: {
          $sum: "$totalTweetLikes",
        },
      },
    },
    {
      $count: "totalTweetLikes",
    },
    {
      $project: {
        _id: 0,
        totalTweetLikes: 1,
      },
    },
  ]);
  if (!likeDetailsOfTweets) {
    obj["likeDetailsOfTweets"] = 0;
    throw new ApiError(404, "No likedetails found");
  }

  (obj["videodetails"] = videodetails),
    (obj["likedetailsOfVideos"] = likedetailsOfVideos),
    (obj["likeDetailsOfComments"] = likeDetailsOfComments),
    (obj["likeDetailsOfTweets"] = likeDetailsOfTweets);

  return res
    .status(200)
    .json(new ApiResponse(200, obj, "Channel status found"));
});

const getChannelVideos = asyncHandler(async (req, res) => {
  const userId = req.user;
  const videos = await Video.find({
    owner: userId?._id,
  });

  if (!videos) {
    throw new ApiError(404, "No videos found");
  }
  if (videos.length === 0) {
    throw new ApiError(404, "No videos found");
  }
  return res.status(200).json(new ApiResponse(200, { videos }, "Videos found"));
});

export { getChannelStatus, getChannelVideos };
