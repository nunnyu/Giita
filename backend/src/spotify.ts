import dotenv from "dotenv"
import axios from "axios"

dotenv.config()
const SPOTIFY_CLIENT_ID = process.env.CLIENT_ID!
const SPOTIFY_CLIENT_SECRET = process.env.CLIENT_SECRET!

// TODO: we need to make it so a user can login and get a token used to fetch personal stuff
// the client id will be used only for public stuff. 

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
 * Get the top tracks for the user.
 * @returns the top tracks for the user.
 */
export async function getTopTracks(): Promise<any[]> {
  // Endpoint reference : https://developer.spotify.com/documentation/web-api/reference/get-users-top-artists-and-tracks
  return (await fetchWebApi(
    'v1/me/top/tracks?time_range=long_term&limit=5', 'GET'
  )).items;
}

/**
 * Test the top tracks function.
 */
export async function testTopTracks(): Promise<void> {
  const topTracks = await getTopTracks();
  console.log(
    topTracks?.map(
      ({name, artists}: {name: string, artists: {name: string}[]}) =>
        `${name} by ${artists.map(artist => artist.name).join(', ')}`
    )
  );
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