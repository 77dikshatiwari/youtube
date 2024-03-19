import { Router } from "express"
import { verifyJWT } from "../middleware/authMiddleware.js"
import { createPlaylist, getPlalistById, getUserPlaylists, addVideoToPlaylist, removeVideoFromPlaylist, deletePlaylist, updatePlaylist   } from "../controllers/playlistController.js"

const router = Router()

router.use(verifyJWT)

router.post("/create-playlist", createPlaylist)

router.get("/user-playlists", getUserPlaylists)

router.get("/user-playlists/:userId", getPlalistById)

router.post("/add-video-to-playlist", addVideoToPlaylist)

router.post("/remove-video-from-playlist/:playlistId", removeVideoFromPlaylist)

router.delete("/delete-playlist/:playlistId", deletePlaylist)

router.patch("/update-playlist/:playlistId", updatePlaylist)

export default router