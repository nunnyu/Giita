import dotenv from "dotenv"
dotenv.config();

console.log("\n=== After dotenv.config() ===")
console.log("CLIENT_ID:", process.env.CLIENT_ID || "UNDEFINED")
console.log("CLIENT_SECRET:", process.env.CLIENT_SECRET ? "***EXISTS***" : "UNDEFINED")

import { getSpotifyToken } from "./spotify"
import { searchTrack } from "./spotify"

async function testToken() {
  try {
    const token = await getSpotifyToken()
    console.log("Spotify access token:", token)
  } catch (err) {
    console.error("Error getting token:", err)
  }
}

async function testSearchTrack(name: string) {
  try {
    const tracks = await searchTrack(name)
    console.log("Tracks found:", tracks)
  } catch (err) {
    console.error("Error searching track:", err)
  }
}

testToken();
testSearchTrack("matsuri"); 