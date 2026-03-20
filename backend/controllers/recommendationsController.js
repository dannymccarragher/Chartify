import db from "../db.js";
import axios from "axios";
import { refreshAccessToken } from "../utils/spotify.js";

import Anthropic from "@anthropic-ai/sdk";
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function getAIRecommendations(req, res) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Not authenticated" });
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

    const [topSongsRes, topArtistsRes] = await Promise.all([
      db.query(
        `SELECT track_name, artist_name, COUNT(*) as play_count
         FROM plays
         WHERE user_id = $1
         AND played_at >= date_trunc('week', NOW())
         GROUP BY track_name, artist_name
         ORDER BY play_count DESC
         LIMIT 20`,
        [req.session.userId]
      ),
      db.query(
        `SELECT artist_name, COUNT(*) as play_count
         FROM plays
         WHERE user_id = $1
         AND played_at >= date_trunc('week', NOW())
         GROUP BY artist_name
         ORDER BY play_count DESC
         LIMIT 10`,
        [req.session.userId]
      ),
    ]);

    const trackIds = topSongsRes.rows.map((s) => s.track_id).filter(Boolean).slice(0, 20).join(",");
    let audioSummary = "";

    if (trackIds) {
      const featuresRes = await axios.get(
        `https://api.spotify.com/v1/audio-features?ids=${trackIds}`,
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      const features = featuresRes.data.audio_features.filter(Boolean);
      if (features.length > 0) {
        const avg = (key) => (features.reduce((s, f) => s + f[key], 0) / features.length).toFixed(2);
        audioSummary = `energy=${avg("energy")}, valence=${avg("valence")}, danceability=${avg("danceability")}, tempo=${avg("tempo")}bpm`;
      }
    }

    const topArtists = topArtistsRes.rows.map((a) => a.artist_name).join(", ");
    const exclusionList = topSongsRes.rows.map((s) => `${s.track_name} by ${s.artist_name}`).join(", ");

    const prompt = `User's taste profile this week:
- Top artists: ${topArtists}
- Audio fingerprint: ${audioSummary || "unavailable"}

Do NOT recommend: ${exclusionList}

Recommend 8 songs they would love. Return ONLY a JSON array, no markdown:
[{ "track": "...", "artist": "...", "reason": "..." }]`;

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: "You are a music recommendation AI. Always respond with valid JSON only, no markdown or explanation.",
      messages: [{ role: "user", content: prompt }],
    });

    const raw = response.content[0].text.replace(/```json|```/g, "").trim();
    const recommendations = JSON.parse(raw);

    return res.json({ recommendations });
  } catch (err) {
    console.error("AI recommendations error:", err.message);
    return res.status(500).json({ error: "Failed to get recommendations" });
  }
}