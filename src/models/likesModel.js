import mongoose from "mongoose";

const likesSchema = new mongoose.Schema(
    {
        // if video is liked
        video: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video",
            required: true
        },
        likedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        // if tweet is liked
        tweet: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tweet",
            required: true
        },
        // if comment is liked
        comment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment",
            required: true
        }
    }, 
    {timestamps: true}
)

export const Likes = mongoose.model("Likes", likesSchema)