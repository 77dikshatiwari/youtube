import { Router } from "express"
import { verifyJWT } from "../middlewares/authMiddleware.js"
import { createTweet, getUserTweet, updateTweet, deleteTweet } from "../controllers/tweetController.js"

const router = Router()

router.use(verifyJWT)

router.post("/create-tweet", createTweet)

router.get("/user-tweets/:userId", getUserTweet)

router.patch("/update-tweet/:tweetId", updateTweet)

router.delete("/delete-tweet/:tweetId", deleteTweet)

export default router