import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweetModel.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/userModel.js";

const createTweet = asyncHandler(async (req, res) => {
  const { tweet } = req.body;
  const { userId } = req.user;
  if (!tweet) {
    throw new ApiError(400, "Please provide a tweet");
  }
  if (!userId) {
    throw new ApiError(400, "Please provide a userId");
  }
  const newTweet = await Tweet.create({
    tweet,
    owner: userId?._id,
  });
  if (!newTweet) {
    throw new ApiError(500, "An error occurred while trying to create a tweet");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, { newTweet }, "Tweet created successfully"));
});

const getUserTweet = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "For Tweets Invalid user id");
  }
  const getTweets = await User.findById(userId);
  if (!getTweets) {
    throw new ApiError(404, "No tweets found");
  }
  if (getTweets?._id.toString() !== req.user.userId) {
    throw new ApiError(403, "You are not authorized to view this tweets");
  }

  const userTweets = await Tweet.aggregate([
    {
      $match: {
        owner: mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $unwind: "$user",
    },
    {
      $project: {
        "user.password": 0,
        "user.email": 0,
        "user.__v": 0,
        content: 1,
      },
    },
  ]);
  if (!userTweets) {
    throw new ApiError(404, "No tweets found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, { userTweets }, "Tweets found"));
});

const updateTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const { tweet } = req.body;
  if (!tweetId) {
    throw new ApiError(400, "Please provide a tweet id");
  }
  if (!tweet) {
    throw new ApiError(400, "Please provide a tweet");
  }
  const findTweet = await Tweet.findById(tweetId);
  if (!findTweet) {
    throw new ApiError(404, "Tweet not found");
  }
  if (findTweet.owner.toString() !== req.user.userId) {
    throw new ApiError(403, "You are not authorized to update this tweet");
  }
  try {
    const updatedTweet = await Tweet.findByIdAndUpdate(
      tweetId,
      { $set: { content: tweet } },
      { new: true }
    );
    if (!updatedTweet) {
      throw new ApiError(
        500,
        "An error occurred while trying to update a tweet"
      );
    }
    return res
      .status(200)
      .json(
        new ApiResponse(200, { updatedTweet }, "Tweet updated successfully")
      );
  } catch (error) {
    throw new ApiError(500, "An error occurred while trying to update a tweet");
  }
});

const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  if (!tweetId) {
    throw new ApiError(400, "Please provide a tweet id");
  }
  const findTweet = await Tweet.findById(tweetId);
  if (!findTweet) {
    throw new ApiError(404, "Tweet not found");
  }
  if (findTweet.owner.toString() !== req.user.userId) {
    throw new ApiError(403, "You are not authorized to delete this tweet");
  }
  try {
    const deletedTweet = await Tweet.findByIdAndDelete(
      { _id: tweetId },
      { new: true }
    );
    if (!deletedTweet) {
      throw new ApiError(
        500,
        "An error occurred while trying to delete a tweet"
      );
    }
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Tweet deleted successfully"));
  } catch (error) {
    throw new ApiError(
      401,
      error?.message || "Tweet cannot be deleted at this time"
    );
  }
});

export { createTweet, getUserTweet, updateTweet, deleteTweet };
