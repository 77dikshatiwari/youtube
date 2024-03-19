import { Router } from "express"
import { verifyJWT } from "../middlewares/authMiddleware.js"
import { addComment, getComments, updateComment, deleteComment, getVideoComments  } from "../controllers/commentController.js"

const router = Router()

router.use(verifyJWT)

router.post("/add-comment", addComment)

router.get("/get-comments", getComments)

router.patch("/update-comment/:commentId", updateComment)

router.delete("/delete-comment/:commentId", deleteComment)

router.get("/video-comments/:videoId", getVideoComments)


export default router