import { Router } from "express"
import { verifyJWT } from "../middleware/authMiddleware.js"
import { getAllVideos, publishAVideo, getVideoById, updateVideo, deleteVideo, togglePublishStatus } from "../controllers/videoController.js"

const router = Router()

router.use(verifyJWT)

router.get("get-all-videos", getAllVideos)

router.post("publishvideo", publishAVideo)

router.get("get-video/:videoId", getVideoById)

router.patch("update-video/:videoId", updateVideo)

router.delete("delete-video/:videoId", deleteVideo)

router.post("toggle-publish-status/:videoId", togglePublishStatus)

export default router