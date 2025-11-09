import axios from "axios";
import type { SpotifySearchResults } from "./types";
/**
 * Get the search results from the spotify API from backend server
 * @param query - The query to search for
 * @returns The search results
 */
export default async function spotifySearch(query: string): Promise<SpotifySearchResults> {
    const response = await axios.get("http://localhost:5000/api/search", {
        params: {
            q: query,
        },
    });
    console.log("Raw API response:", response.data);
    console.log("Response structure:", {
        isArray: Array.isArray(response.data),
        hasTracks: !!response.data.tracks,
        hasItems: !!response.data.tracks?.items,
    });
    return response.data;
}