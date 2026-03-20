import express from "express"
const router = express.Router();
import { getAIRecommendations } from "../controllers/recommendationsController.js";

router.get("/recommendations", getAIRecommendations);

export default router;