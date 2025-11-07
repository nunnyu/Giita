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
    return response.data;
}