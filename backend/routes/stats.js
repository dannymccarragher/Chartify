import express from "express";
import { getStats, getUserProfile, getUserTopRange } from "../controllers/statsController.js";
const router = express.Router();

router.get("/stats", getStats);
router.get("/user/top/:range", getUserTopRange);
router.get("/user/:userId", getUserProfile);

export default router;
