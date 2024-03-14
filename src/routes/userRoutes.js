import { Router } from 'express'
import { loginUser, logoutUser, refreshAccessToken, registerUser } from '../controllers/userController.js'
import {upload} from '../middlewares/multerMiddleware.js'
import { verifyJWT } from '../middlewares/authMiddleware.js'

const router = Router()

// router.route("/register").post(upload.fields[{}],registerUser);

router.post('/register', upload.fields([
    {name: "avatar", maxCount: 1}, 
    {name: "coverImage", maxCount: 1}
]), registerUser)

router.post('/login', loginUser)

// secured routes
router.post("/refresh-token", refreshAccessToken)

router.post("/logout", verifyJWT, logoutUser)

export default router
