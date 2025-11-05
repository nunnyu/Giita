import dotenv from "dotenv"
import axios from "axios"

dotenv.config()
const SPOTIFY_CLIENT_ID = process.env.CLIENT_ID!
const SPOTIFY_CLIENT_SECRET = process.env.CLIENT_SECRET!

// Authorization token that must have been created previously. See: https://developer.spotify.com/documentation/web-api/concepts/authorization
const token = await getSpotifyToken();
async function fetchWebApi(endpoint: string, method: string, body?: any) {
  const res = await fetch(`https://api.spotify.com/${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    method,
    ...(body && { body: JSON.stringify(body) })
  });
  return await res.json();
}

/**
 * Get a Spotify access token.
 * @returns the Spotify access token.
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

/**
 * Search for a track by name.
 * @param query The query to search for.
 * @returns The tracks found.
 */
export async function searchTrack(query: string): Promise<any[]> {
  const response = await fetchWebApi(`v1/search?q=${query}&type=track`, 'GET')
  return response.tracks.items
}