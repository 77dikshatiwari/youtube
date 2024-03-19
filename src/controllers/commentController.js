import mongoose from "mongoose"
import {Comment} from "../models/commentModel.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/videoModel.js"

const getVideoComments = asyncHandler(async(req, res)=> {

    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query
    if(!videoId){
        throw new ApiError(400, "Please provide a video id")
    }
    const getVideo = await Video.findById(videoId)
    if(!getVideo){
        throw new ApiError(404, "Video not found")
    }
    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    }
    const getcomments = await Comment.aggregate([
        {
            $match: {
                video: mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },
        {
            $addFields: {
                owner: {
                    $arrayElemAt: ["$owner", 0]
                }
            }, 
        },
        {
            $lookup:{
                from: "likes",
                localField: "_id",
                foreignField: "comment",
                as: "likedBy"
            }
        }, {
            $skip: (options.page - 1) * options.limit
        },
        {
            $limit: options.limit
        },
        {
            $unwind: "$user"
        },
        {
            $project: {
                "user.password": 0,
                "user.email": 0,
                "user.createdAt": 0,
                "user.updatedAt": 0,
                "user.__v": 0
            }
        }
    ])
    if(!(getComments || getcomments.length> 0)){
        throw new ApiError(404, "No comments found")
    }
    return res
    .status(200)
    .json(new ApiResponse(
        200, 
        {comments: getcomments},
        "comments fetched successfully"
        ))

// TODO: Add pagination to the comments
})

const addComment = asyncHandler(async(req, res)=>{
    const {videoId} = req.params
    const {comment} = req.body
    console.log(comment)
    if(!comment){
        throw new ApiError(400, "Please provide a comment")
    }
    if(!videoId){
        throw new ApiError(400, "Please provide a video id")
    }
    const getVideo = await Video.findById(videoId)
    if(!getVideo){
        throw new ApiError(404, "Video not found for comment")
    }
    const newComment =  await Comment.create({
        comment, 
        user: req.user?._id,
        video: getVideo?._id})
    res
    .status(201)
    .json(new ApiResponse(
        201, 
        {comment: newComment}, 
        "comment added successfully"))
})

const getComments = asyncHandler(async(req, res)=>{
    const comments = await Comment.find().populate("user")
    return res
    .status(200).
    json(new ApiResponse(
        200, 
        {comments}, 
        "comments fetched successfully"))
})

const updateComment = asyncHandler(async(req, res) => {
    const {comment} = req.body
    const {commentId} = req.params
    if(!comment){
        throw new ApiError(400, "Please provide a comment")
    }
    if(!commentId){
        throw new ApiError(400, "Please provide a comment id")
    }

    const getComment = await Comment.findById(commentId)
    if(!getComment){
        throw new ApiError(404, "Comment not found")
    }
    if(getComment?.user != req.user?._id){
        throw new ApiError(403, "You are not allowed to update this comment")
    }

   try {
     const updateUserComment  = await Comment.findByIdAndUpdate(
        commentId, 
         {
         $set: {
             comment: comment
         }
     }, {new: true})
      
     if(!updateUserComment){
         throw new ApiError(
            500,
             "An error occurred while updating comment")
         } 

    return res
     .status(200)
     .json(new ApiResponse(
         200, 
         {comment: updateUserComment},
         error?.message || "comment updated successfully"))
 
   } catch (error) {
    throw new ApiError(500, "An error occurred while updating comment")
   }
})

const deleteComment = asyncHandler(async(req, res) => {
    const {commentId} = req.params
    if(!commentId){
        throw new ApiError(400, "Please provide a comment id")
    }
    const getComment = await Comment.findById(commentId)
    if(!getComment){
        throw new ApiError(404, "Comment not found")
    }
    if(getComment?.user != req.user?._id){
        throw new ApiError(403, "You are not allowed to delete this comment")
    }
    
    try {
        const deleteUserComment = await Comment.findByIdAndDelete(
            commentId)
        if(!deleteUserComment){
            throw new ApiError(500, "An error occurred while deleting comment")
        }

        return res
        .status(200)
        .json(new ApiResponse(
            200, 
            {comment: deleteUserComment},
            "comment deleted successfully"))
    } catch (error) {
        throw new ApiError(500, "An error occurred while deleting comment")
    }
})

export {getVideoComments, addComment, getComments, updateComment, deleteComment}