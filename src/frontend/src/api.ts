import axios, { AxiosError } from "axios";
import type { AxiosRequestConfig } from "axios";
import type { SpotifySearchResults, SpotifyTrack } from "./types";

const API_BASE_URL = "http://localhost:5000/api";

// Helper function to handle API errors consistently
async function apiRequest<T>(
    method: 'get' | 'post',
    endpoint: string,
    data?: unknown,
    params?: Record<string, string | number>
): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`apiRequest: ${method.toUpperCase()} ${url}`, { params, data });
    try {
        const config: AxiosRequestConfig = { params };
        if (method === 'post') {
            config.data = data;
        }
        const response = await axios[method](url, config);
        console.log(`apiRequest: Response from ${url}`, response.data);
        return response.data;
    } catch (error) {
        const axiosError = error as AxiosError<{ error?: string }>;
        const errorMessage = axiosError.response?.data?.error || axiosError.message || "An error occurred";
        console.error(`API ${method.toUpperCase()} ${endpoint} error:`, errorMessage);
        throw new Error(errorMessage);
    }
}

/**
 * Get the search results from the spotify API from backend server
 * @param query - The query to search for
 * @returns The search results
 */
export default async function spotifySearch(query: string): Promise<SpotifySearchResults> {
    const data = await apiRequest<SpotifySearchResults>('get', '/search', undefined, { q: query });
    console.log("Raw API response:", data);
    console.log("Response structure:", {
        isArray: Array.isArray(data),
        hasTracks: !!data.tracks,
        hasItems: !!data.tracks?.items,
    });
    return data;
}

export interface Profile {
    id: number;
    name: string | null;
    user_id: number;
}

/**
 * Get all available profiles
 * @returns The list of profiles
 * TODO: fix ROW LEVEL SECURITY; this is not working as expected.
 */
export async function getProfiles(): Promise<Profile[]> {
    console.log("getProfiles: Making request to", `${API_BASE_URL}/profiles`);
    const response = await apiRequest<{ success: boolean; data: Profile[] }>('get', '/profiles');
    console.log("getProfiles: Response received", response);
    return response.data || [];
}

export interface ProfileSong {
    id: number;
}

export interface ProfileSongWithDetails {
    id: number;
    notes: string;
    resources: unknown;
    created_at: string;
    song: {
        id: number;
        spotify_track_id: string;
        name: string | null;
        artist: string | null;
        album: string | null;
        created_at: string;
    };
}

/**
 * Get songs for a profile
 * @param profileId - The ID of the profile
 * @returns The list of songs in the profile
 */
export async function getProfileSongs(profileId: number): Promise<ProfileSongWithDetails[]> {
    const response = await apiRequest<{ success: boolean; data: ProfileSongWithDetails[] }>('get', `/profiles/${profileId}/songs`);
    return response.data || [];
}

/**
 * Add a song to a profile
 * @param track - The Spotify track object
 * @param profileId - The ID of the profile to add the song to
 * @returns The created profile_song entry
 */
export async function addSongToProfile(track: SpotifyTrack, profileId: number): Promise<ProfileSong> {
    console.log("addSongToProfile called with:", { track, profileId });
    const response = await apiRequest<{ success: boolean; data: ProfileSong }>('post', '/add-song-to-profile', {
        track,
        profileId,
    });
    return response.data;
}