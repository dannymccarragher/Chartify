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

    const [topTracksRes, topArtistsRes] = await Promise.all([
      axios.get(
        `https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=20`,
        { headers: { Authorization: `Bearer ${userToken}` } }
      ),
      axios.get(
        `https://api.spotify.com/v1/me/top/artists?time_range=short_term&limit=10`,
        { headers: { Authorization: `Bearer ${userToken}` } }
      ),
    ]);

    const topTracks = topTracksRes.data.items;
    const topArtists = topArtistsRes.data.items;

    const trackIds = topTracks.map((t) => t.id).join(",");
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

    const artistNames = topArtists.map((a) => a.name).join(", ");
    const exclusionList = topTracks.map((t) => `${t.name} by ${t.artists[0]?.name}`).join(", ");

    const prompt = `User's taste profile (recent top tracks):
- Top artists: ${artistNames}
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
