import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlistModel.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  if (!name || !description) {
    throw new ApiError(400, "Please provide a name and description");
  }
  const newPlaylist = await Playlist.create({
    name: name,
    description: description || "",
    user: req.user?._id,
    videos: [],
  });

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { playlist: newPlaylist },
        "Playlist created successfully"
      )
    );
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  // get userId from params
  const { userId } = req.params;
  // if not get userId from query
  if (!userId) {
    throw new ApiError(400, "Please provide a user id or userId not found");
  }
  // if user existed, find user playlist
  const userPlaylist = await Playlist.findById(userId);
  // if user playlist not found, throw an error
  if (!userPlaylist) {
    throw new ApiError(404, "User playlist not found");
  }

  const userPlaylists = await Playlist.aggregate([
    // match the user for playlists
    {
      $match: {
        owner: mongoose.Types.ObjectId(userId),
      },
    },
    {
      $project: {
        name: 1,
        description: 1,
        owner: 1,
        videos: {
          $cond: {
            if: ["owner", new mongoose.Types.ObjectId(req.user?.userId)],
            then: "$videos",
            else: {
              $filter: {
                input: "$videos",
                as: "video",
                cond: {
                  $gt: ["$video.isPublished", true],
                },
              },
            },
          },
        },
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ]);
  if (!userPlaylists) {
    throw new ApiError(404, "User playlist not found");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { playlists: userPlaylists },
        "User playlists found successfully"
      )
    );
});

const getPlalistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist id");
  }
  const getPlaylist = await Playlist.findById(playlistId);
  if (!getPlaylist) {
    throw new ApiError(404, "Playlist not found");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { playlist: getPlaylist },
        "Playlist found successfully"
      )
    );
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid playlist or video id");
  }
  const playlist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $push: {
        videos: videoId,
      },
    },
    { new: true }
  );
  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { playlist: playlist },
        "Video added to playlist successfully"
      )
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid playlist or video id");
  }
  const removeVideo = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $pull: {
        videos: videoId,
      },
    },
    { new: true }
  );
  if (!removeVideo) {
    throw new ApiError(404, "Playlist not found");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { playlist: removeVideo },
        "Video removed from playlist successfully"
      )
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist id");
  }
  const deletePlaylist = await Playlist.findByIdAndDelete(playlistId);
  if (!deletePlaylist) {
    throw new ApiError(404, "Playlist not found");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { playlist: deletePlaylist },
        "Playlist deleted successfully"
      )
    );
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist id");
  }
  const { name, description } = req.body;
  if (!name || !description) {
    throw new ApiError(400, "Please provide a name and description");
  }
  const updatePlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $set: {
        name: name,
        description: description,
      },
    },
    { new: true }
  );
  if (!updatePlaylist) {
    throw new ApiError(404, "Playlist not found");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { playlist: updatePlaylist },
        "Playlist details updated successfully"
      )
    );
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlalistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  updatePlaylist,
  deletePlaylist,
};
