import express from "express";
import { spotifyCallback, registerPushToken, login, me, logout } from "../controllers/authController.js";

const router = express.Router();

// Spotify redirects here after OAuth completes
router.get("/callback", spotifyCallback);

// Called when the user clicks the "Login with Spotify" button in the app
router.get("/login", login);

// Called when the user clicks the "Logout" button in the app
router.post("/logout", logout);

// Save Expo push token for notifications
router.post("/push-token", registerPushToken);

// Get user data
router.get("/me", me);

export default router;