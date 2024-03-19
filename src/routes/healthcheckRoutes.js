import { Router } from "express"
import { healthCheck } from "../controllers/healthcheckController.js"

const router = Router()

router.get("/healthcheck", healthCheck)

export default router