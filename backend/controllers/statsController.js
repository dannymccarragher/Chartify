import axios from "axios";
import db from "../db.js";

import { refreshAccessToken } from "../utils/spotify.js";

async function getStats(req, res) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const { rows } = await db.query(
      `SELECT
          COUNT(*) as total_songs,
          SUM(duration_ms) / 60000 as total_minutes,
          MAX(played_at) as last_played,
          (SELECT artist_name FROM plays
            WHERE user_id = $1
            AND played_at >= date_trunc('week', NOW())
            GROUP BY artist_name
            ORDER BY COUNT(*) DESC
            LIMIT 1) as top_artist
         FROM plays
         WHERE user_id = $1
         AND played_at >= date_trunc('week', NOW())`,
      [req.session.userId]
    );

    return res.json(rows[0]);
  } catch (err) {
    console.error("Stats error:", err.message);
    return res.status(500).json({ error: "Failed to fetch stats" });
  }
}

async function getUserProfile(req, res) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const targetId = req.params.userId;
  if (!targetId || typeof targetId !== "string") {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  try {
    const userRes = await db.query(
      `SELECT id, display_name, avatar_url FROM users WHERE id = $1`,
      [targetId]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({
      user: userRes.rows[0],
    });
  } catch (err) {
    console.error("getUserProfile error:", err.message);
    return res.status(500).json({ error: "Failed to fetch user profile" });
  }
}

async function getUserTopRange(req, res) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const rangeMap = {
    '4weeks': "short_term",
    '6months': "medium_term",
    '1year': "long_term",
  };
  const spotifyRange = rangeMap[req.params.range];

  if (!spotifyRange) {
    return res.status(400).json({ error: "Invalid range" });
  }

  try {
    let userToken = req.session.access_token;
    if (!userToken) {
      const userRow = await db.query(
        "SELECT refresh_token FROM users WHERE id = $1",
        [req.session.userId]
      );
      userToken = await refreshAccessToken(userRow.rows[0].refresh_token);
      req.session.access_token = userToken;
    }

    const spotifyRes = await axios.get(
      `https://api.spotify.com/v1/me/top/tracks?time_range=${spotifyRange}&limit=50`,
      { headers: { Authorization: `Bearer ${userToken}` } }
    );

    const items = spotifyRes.data.items;
    return res.json(items);
  } catch (err) {
    console.error("getUserTopRange error:", err.message);
    return res.status(500).json({ error: "Failed to fetch user top range" });
  }
}

export { getStats, getUserProfile, getUserTopRange };
