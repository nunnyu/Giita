import axios from "axios"

const SPOTIFY_CLIENT_ID = process.env.CLIENT_ID!
const SPOTIFY_CLIENT_SECRET = process.env.CLIENT_SECRET!

/**
 * Get a Spotify access token
 */
export async function getSpotifyToken(): Promise<string> {
  const tokenUrl = "https://accounts.spotify.com/api/token"
  const authHeader = Buffer.from(
    `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
  ).toString("base64")

  const params = new URLSearchParams()
  params.append("grant_type", "client_credentials")

  try {
    const response = await axios.post(tokenUrl, params, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${authHeader}`,
      },
    })

    return response.data.access_token
  } catch (err) {
    console.error("Error fetching Spotify token:", err)
    throw err
  }
}