import dotenv from "dotenv"
dotenv.config()

import { getSpotifyToken } from "./spotify"

async function testToken() {
  try {
    const token = await getSpotifyToken()
    console.log("Spotify access token:", token)
  } catch (err) {
    console.error("Error getting token:", err)
  }
}

testToken()