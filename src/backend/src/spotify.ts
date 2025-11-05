import dotenv from "dotenv"
import axios from "axios"

dotenv.config()
const SPOTIFY_CLIENT_ID = process.env.CLIENT_ID!
const SPOTIFY_CLIENT_SECRET = process.env.CLIENT_SECRET!

let cachedToken: string | null = null
let tokenExpiry: number = 0

async function fetchWebApi(endpoint: string) {
  const token = await getSpotifyToken();
  const res = await axios.get(`https://api.spotify.com/${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}

/**
 * Get a Spotify access token. Caches the token until it expires.
 * @returns the Spotify access token.
 */
export async function getSpotifyToken(): Promise<string> {
  // Return cached token if it's still valid
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken
  }

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

    const newToken = response.data.access_token
    cachedToken = newToken
    // Set expiry to 50 minutes (we grab a new token before it expires at ~ 1 hour)
    tokenExpiry = Date.now() + (50 * 60 * 1000)
    
    return newToken
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
export async function search(query: string): Promise<any[]> {
  const encodedQuery = encodeURIComponent(query)
  const response = await fetchWebApi(`v1/search?q=${encodedQuery}&type=track`)
  return response.tracks.items
}