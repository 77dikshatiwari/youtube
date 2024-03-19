import mongoose, {isValidObjectId} from "mongoose"
import {Subscription} from "../models/subscriptionModel.js"
import {Video} from "../models/videoModel.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {ApiError} from "../utils/ApiError.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {User} from "../models/userModel.js"

const subscribeToAChannel = asyncHandler(async(req, res)=>{
    const {channelId} = req.params
    const {userId} = req.user
    if(!isValidObjectId(channelId)){
        throw new ApiError(400, "Invalid channel id")
    }
    if(!userId){
        throw new ApiError(400, "Please provide a userId")
    }
    const getChannel = await User.findById(channelId)
    
    if(!getChannel){
        throw new ApiError(404, "Channel not found")
    }
    
    const checkSubscription = await Subscription.findOne(
        {channel: channelId, subscriber: userId?._id})
    
        if(checkSubscription){
        throw new ApiError(400, "You are already subscribed to this channel")
    }


    const newSubscription = new Subscription.findById({
        channel: channelId,
        subscriber: userId
    })
    const subscribed = await newSubscription.create(
        {
            channel: channelId,
            subscriber: userId
        }
        )
        if(!subscribed){
            throw new ApiError(500, "An error occurred while trying to subscribe to this channel")
        }
    await User.findByIdAndUpdate(channelId, {
        $push: {
            subscribers: userId
        }
    }, {new: true})

    await User.findByIdAndUpdate(userId, {
        $push: {
            subscribeTo: channelId
        }
    }, {new: true})
    return res
    .status(200)
    .json(new ApiResponse(
        200, 
        {subscribed}, 
        "You have successfully subscribed to this channel"))        
})

const unsubscribeFromAChannel = asyncHandler(async(req, res)=>{
    const {channelId} = req.params
    const {userId} = req.user
    if(!isValidObjectId(channelId)){
        throw new ApiError(400, "Invalid channel id")
    }
    if(!userId){
        throw new ApiError(400, "Please provide a userId")
    }
    const getChannel = await User.findById(channelId)
    if(!getChannel){
        throw new ApiError(404, "Channel not found")
    }
    const checkSubscription = await Subscription.findOneAndDelete(
        {channel: channelId, 
        subscriber: userId?._id
        })
    if(!checkSubscription){
        throw new ApiError(400, "You are not subscribed to this channel")
    }
    await User.findByIdAndUpdate(
        channelId, 
        {
        $pull: {
            subscribers: userId
        }
    }, {new: true}
    )
    await User.findByIdAndUpdate(
        userId, 
        {
        $pull: {
            subscribeTo: channelId
        }
    }, {new: true}
    )
    return res.status(200).json(new ApiResponse(
        200, 
        checkSubscription, 
        "You have successfully unsubscribed from this channel"))
})

const getChannelSubscriber = asyncHandler(async(req, res)=>{
    const {channelId} = req.params
    if(!isValidObjectId(channelId)){
        throw new ApiError(400, "Invalid channel id")
    }
    const getChannel = await User.findById(channelId)
    if(!getChannel){
        throw new ApiError(404, "Channel not found")
    }
    const getSubscribers = await User.find({
        subscribeTo: channelId
    })
    if(!getSubscribers){
        throw new ApiError(404, "No subscribers found")
    }
    const user = await Subscription.aggregate([
        {
            $match: {
                channel: mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $group: {
                _id: "$channel",
                subscribers: {
                    $push: "$subscriber"
                }
            }
        }
    
    ])
    return res.status(200).json(new ApiResponse(
        200, 
        {subscribers: user}, 
        "Subscribers found"))
})

const getSubscribedChannels = asyncHandler(async(req, res)=>{
const {channelId} = req.params

if(!isValidObjectId(channelId)){
    throw new ApiError(400, "Invalid channel id")
}
const registeredUser = await User.findById(channelId)
if(!registeredUser){
    throw new ApiError(404, "User not found")
}
const user = await Subscription.aggregate([
    {
        $match: {
            subscriber: mongoose.Types.ObjectId(channelId)
        }
    },
    {
        $group: {
            _id: "$subscriber",
            subscribedTo: {
                $push: "$channel"
            }
        }
    },
    {
        $project:{
            _id: 0,
            subscribedTo: 1
        }
    },

])
return res.status(200).json(new ApiResponse(
    200, 
    {subscribedTo: user}, 
    "Subscribed channels found"))
})


export {
    subscribeToAChannel, unsubscribeFromAChannel, getChannelSubscriber, getSubscribedChannels}