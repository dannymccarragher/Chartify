import axios from "axios";

const basicAuth = () =>
  "Basic " +
  Buffer.from(
    process.env.SPOTIFY_CLIENT_ID + ":" + process.env.SPOTIFY_CLIENT_SECRET
  ).toString("base64");

export async function refreshAccessToken(refresh_token) {
  const tokenRes = await axios.post(
    "https://accounts.spotify.com/api/token",
    new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token,
    }),
    {
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        Authorization: basicAuth(),
      },
    }
  );

  return tokenRes.data.access_token;
}

// Client credentials token — for public data (tracks, artists) with no user scopes needed
export async function getClientToken() {
  const tokenRes = await axios.post(
    "https://accounts.spotify.com/api/token",
    new URLSearchParams({ grant_type: "client_credentials" }),
    {
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        Authorization: basicAuth(),
      },
    }
  );

  return tokenRes.data.access_token;
}