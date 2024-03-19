import { Router } from "express"
import { verifyJWT } from "../middlewares/authMiddleware.js"
import { getChannelStatus, getChannelVideos } from "../controllers/dashboardController.js"

const router = Router()

router.use(verifyJWT)

router.get("/dashboard", getChannelStatus )

router.get("/dashboard-video", getChannelVideos)

export default router