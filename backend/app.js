import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import artistRoutes from "./routes/artists.js";
import showRoutes from "./routes/shows.js";
import session from "express-session";
import statsRoutes from "./routes/stats.js";
import friendRoutes from "./routes/friends.js";
import recommendationsRoutes from "./routes/recommendations.js";
const app = express();

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());
const isProd = process.env.NODE_ENV === "production";

app.set('trust proxy', 1);

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}));

// Routes
app.use("/auth", authRoutes);
app.use("/artists", artistRoutes);
app.use("/shows", showRoutes);
app.use("/stats", statsRoutes);
app.use("/friends", friendRoutes);
app.use("/", recommendationsRoutes);



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Tourly server running on port ${PORT}`));