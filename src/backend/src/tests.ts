import dotenv from "dotenv"
dotenv.config();

console.log("\n=== After dotenv.config() ===")
console.log("CLIENT_ID:", process.env.CLIENT_ID || "UNDEFINED")
console.log("CLIENT_SECRET:", process.env.CLIENT_SECRET ? "***EXISTS***" : "UNDEFINED")

import { getSpotifyToken } from "./spotify"
import { search } from "./spotify"

async function testToken() {
  try {
    const token = await getSpotifyToken()
    console.log("Spotify access token:", token)
  } catch (err) {
    console.error("Error getting token:", err)
  }
}

async function testSearch(name: string) {
  try {
    const result = await search(name)
    console.log("Tracks found:", result.tracks.items.map(track => track.name + ", " + track.artists[0].name));
  } catch (err) {
    console.error("Error searching track:", err)
  }
}

testToken();
testSearch("freedom ado"); 