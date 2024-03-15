import { Router } from "express";
import {
  changeCurrentPassword,
  getCurrentUser,
  getUserChannelProfile,
  getWatchHistory,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  updateAccountDetails,
  updateCoverImage,
  updateUserAvatar,
} from "../controllers/userController.js";
import { upload } from "../middlewares/multerMiddleware.js";
import { verifyJWT } from "../middlewares/authMiddleware.js";

const router = Router();

// router.route("/register").post(upload.fields[{}],registerUser);

router.post(
  "/register",
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);

router.post("/login", loginUser);

// secured routes
router.post("/refresh-token", refreshAccessToken);

router.post("/logout", verifyJWT, logoutUser);

router.post("/change-password", verifyJWT, changeCurrentPassword);

router.get("/current-user", verifyJWT, getCurrentUser);

router.patch("/update-details", verifyJWT, updateAccountDetails);

router.patch(
  "/update-avtar",
  verifyJWT,
  upload.single("avatar"),
  updateUserAvatar
);

router.patch(
  "/update-coverimage",
  verifyJWT,
  upload.single("coverImage"),
  updateCoverImage
);

router.get("/c/:username", verifyJWT, getUserChannelProfile);

router.get("/history", verifyJWT, getWatchHistory);

export default router;
