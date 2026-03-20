import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import artistRoutes from "./routes/artists.js";
import showRoutes from "./routes/shows.js";
import session from "express-session";
import statsRoutes from "./routes/stats.js";
import friendRoutes from "./routes/friends.js";
const app = express();

app.use(cors({
  origin: ["http://127.0.0.1:3000", "http://localhost:3000"],
  credentials: true
}));

app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, secure: false },
  maxAge: 1000 * 60 * 60 * 24 * 7 
}));

// Routes
app.use("/auth", authRoutes);
app.use("/artists", artistRoutes);
app.use("/shows", showRoutes);
app.use("/stats", statsRoutes);
app.use("/friends", friendRoutes);

// Start background jobs
// startCronJobs();


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Tourly server running on port ${PORT}`));