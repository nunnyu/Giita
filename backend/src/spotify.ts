import dotenv from "dotenv"
import axios from "axios"

dotenv.config()
const SPOTIFY_CLIENT_ID = process.env.CLIENT_ID!
const SPOTIFY_CLIENT_SECRET = process.env.CLIENT_SECRET!

// Authorization token that must have been created previously. See: https://developer.spotify.com/documentation/web-api/concepts/authorization
const token = 'BQAq82T1dyXEj5MFSyVrB-0FtoZW77uB8tG2_1wCurOpLyBu0yAWdj2JNl1tv5Z5Zh-TiaU5GRZBiuOVrEesPg2ROl_9zByKAAdSjfeL9asvJGqMJcFEdJ4S1sN_6Gt5U6QCzM4IPIFQh_u7Kw1geL0uVSkXz3ppKWgLLlVYSGi2fyn7hCVUiZSjPPKyEQjE4ooCAZOzbR22iRN994gWZ7BQ6M60AlV3jUWVD1kuI8bsaRAVLBU9Rm8iw4R1Xc7Rfbn9kN-7lUZjcFdHDKgWfD6e5cs13HIE4dzgmu4WafdriIMjdhtCrwQS4_rn-W3DPceD';
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