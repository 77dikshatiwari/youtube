import { Router } from "express"
import { verifyJWT } from "../middlewares/authMiddleware.js"
import { subscribeToAChannel, unsubscribeFromAChannel, getChannelSubscriber, getSubscribedChannels } from "../controllers/subscriptionController.js"

const router = Router()

router.use(verifyJWT)

router.post("/subscribe/:channelId", subscribeToAChannel)

router.post("/unsubscribe/:channelId", unsubscribeFromAChannel)

router.get("/subscribedusers/:channelId", getChannelSubscriber)

router.get("/subscribedchannel/:channelId", getSubscribedChannels)


export default router