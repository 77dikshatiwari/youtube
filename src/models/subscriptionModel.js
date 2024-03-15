import mongoose from "mongoose"

const subscriptionSchema = new mongoose.Schema({
    subscriber: {
        type: mongoose.Schema.Types.ObjectId, 
        // one who is subscribing
        ref: "User"
    },
    chanel: {
        type: mongoose.Schema.Types.ObjectId, 
        // one who is being subscribed to
        ref: "User"
    }


}, {timestamps: true})

export const Subscription = mongoose.model("Subscription", subscriptionSchema)