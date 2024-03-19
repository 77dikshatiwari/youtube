import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/likeModel.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/videoModel.js";
import { Comment } from "../models/commentModel.js";
import { Tweet } from "../models/tweetModel.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const videoId = req.params;
  try {
    if (!isValidObjectId(videoId)) {
      throw new ApiError(400, "Invalid video id");
    }
    const getVideo = await Video.findById({ video: videoId });
    if (!(getVideo && getVideo.isPublished)) {
      throw new ApiError(404, "Video not found");
    }
    const alreadyLiked = await Like.findOne({
      video: videoId,
      user: req.user._id,
    });
    if (alreadyLiked && alreadyLiked.length > 0) {
      await Like.findByIdAndDelete(alreadyLiked._id, { new: true });
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            {},
            "Video was already liked, so Video disliked successfully"
          )
        );
    }
    const newLike = await Like.create({
      video: videoId,
      likedBy: req.user?._id,
    });
    if (!newLike) {
      throw new ApiError(500, "Not able to like the video");
    }
    return res
      .status(201)
      .json(
        new ApiResponse(201, { like: newLike }, "Video liked successfully")
      );
  } catch (error) {
    throw new ApiError(
      500,
      error.message || "Not able to like or dislike the video"
    );
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const commentId = req.params;
  try {
    if (!isValidObjectId(commentId)) {
      throw new ApiError(400, "Invalid comment id");
    }
    const getComment = await Comment.findById({ comment: commentId });
    if (!getComment) {
      throw new ApiError(404, "Comment not found");
    }
    const alreadyLikedcomment = await Like.findOne({
      comment: commentId,
      user: req.user._id,
    });
    if (alreadyLikedcomment && alreadyLikedcomment.length > 0) {
      await Like.findByIdAndDelete(alreadyLikedcomment._id, { new: true });
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            {},
            "Comment was already liked, so Comment disliked successfully"
          )
        );
    }
    const newLike = await Like.create({
      comment: commentId,
      likedBy: req.user?._id,
    });
    if (!newLike) {
      throw new ApiError(500, "Not able to like the comment");
    }
    return res
      .status(201)
      .json(
        new ApiResponse(201, { like: newLike }, "Comment liked successfully")
      );
  } catch (error) {
    throw new ApiError(
      500,
      error.message || "Not able to like or dislike the comment"
    );
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const tweetId = req.params;
  try {
    if (!tweetId) {
      throw new ApiError(400, "Invalid tweet id");
    }
    const getTweet = await Tweet.findById({ tweet: tweetId });
    if (!getTweet) {
      throw new ApiError(404, "Tweet not found");
    }
    const alreadyLikedTweet = await Like.findOne({
      tweet: tweetId,
      user: req.user._id,
    });
    if (alreadyLikedTweet && alreadyLikedTweet.length > 0) {
      await Like.findByIdAndDelete(alreadyLikedTweet._id, { new: true });
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            {},
            "Tweet was already liked, so Tweet disliked successfully"
          )
        );
    }
    const newTweetLike = await Like.create({
      tweet: tweetId,
      likedBy: req.user?._id,
    });
    if (!newTwwetLike) {
      throw new ApiError(500, "Not able to like the tweet");
    }
    return res
      .status(201)
      .json(
        new ApiResponse(201, { like: newTweetLike }, "Tweet liked successfully")
      );
  } catch (error) {
    throw new ApiError(
      500,
      error.message || "Not able to like or dislike the tweet"
    );
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  try {
    const likedVideos = await Like.aggregate([
      {
        $match: {
          likedBy: new mongoose.Types.ObjectId(req.user?._id),
          video: { $exists: true },
        },
      },
      {
        $lookup: {
          from: "videos",
          localField: "video",
          foreignField: "_id",
          as: "video",
        },
      },
      {
        $unwind: "$video",
      },
      {
        $project: {
          _id: 0,
          video: 1,
        },
      },
    ]);
    if (!likedVideos) {
      throw new ApiError(404, "No liked videos found");
    }
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { likedVideos },
          "Liked videos fetched successfully"
        )
      );
  } catch (error) {
    throw new ApiError(
      500,
      error.message || "Not able to get the liked videos"
    );
  }
});

export { toggleVideoLike, toggleCommentLike, toggleTweetLike, getLikedVideos };
