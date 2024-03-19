import { Router } from "express"
import { verifyJWT } from "../middlewares/authMiddleware.js"
import { toggleVideoLike, toggleCommentLike, toggleTweetLike, getLikedVideos } from "../controllers/likeController.js"

const router = Router()

router.use(verifyJWT)

router.post("/video-like", toggleVideoLike )

router.post("/comment-like", toggleCommentLike)

router.post("/tweet-like", toggleTweetLike)

router.get("/liked-videos", getLikedVideos)

export default router