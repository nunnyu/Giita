import express, { Request, Response } from "express";
import cors from "cors";
import { search, getTrack } from "./api/spotify";
import supabase, { setCurrentUserUuid } from "./db";

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// TODO: Replace with proper authentication middleware that extracts user from JWT token
function getCurrentUserId(req: Request): string | null {
  const queryUserId = req.query.user_uuid || req.query.user_id;
  if (queryUserId && typeof queryUserId === "string") {
    return queryUserId;
  }

  const headerUserId = req.headers["x-user-uuid"] || req.headers["x-user-id"];
  if (headerUserId && typeof headerUserId === "string") {
    return headerUserId;
  }

  const adminUserId = process.env.ADMIN_USER_ID;
  if (adminUserId && typeof adminUserId === "string") {
    return adminUserId;
  }

  return null;
}

/**
 * Helper function to handle database operations
 * @param operation - The database operation to perform
 * @param errorContext - The context of the error
 * @returns The result of the database operation
 */
async function handleDbOperation<T>(
  operation: () => Promise<{
    data: T | null;
    error: { message: string; code?: string } | null;
  }>,
  errorContext: string
): Promise<{ data: T | null; error: string | null }> {
  if (!supabase) {
    return { data: null, error: "Supabase client not initialized" };
  }

  try {
    const result = await operation();
    if (result.error) {
      console.error(`${errorContext}:`, result.error);
      return { data: null, error: result.error.message };
    }
    return { data: result.data, error: null };
  } catch (err: unknown) {
    console.error(`${errorContext}:`, err);
    const errorMessage =
      err instanceof Error ? err.message : "Something went wrong";
    return { data: null, error: errorMessage };
  }
}

// Helper function to send error responses
function sendError(res: Response, status: number, message: string) {
  res.status(status).json({ error: message });
}

// Helper function to send success responses
function sendSuccess<T>(res: Response, data: T, status: number = 200) {
  res.status(status).json({ success: true, data });
}

app.get("/api/search", async (req, res) => {
  const query = req.query.q as string;
  if (!query) {
    return sendError(res, 400, "Missing query parameter");
  }

  try {
    const results = await search(query);
    res.json(results);
  } catch (err) {
    sendError(res, 500, "Something went wrong");
  }
});

app.get("/api/test-db", async (req, res) => {
  const { data, error } = await handleDbOperation(async () => {
    const result = await supabase.from("song").select("*").limit(5);
    return result;
  }, "Test DB error");

  if (error) {
    return sendError(res, 500, error);
  }
  sendSuccess(res, data);
});

// Get all profiles for current user
app.get("/api/profiles", async (req, res) => {
  const userId = getCurrentUserId(req);

  if (!userId) {
    return sendError(
      res,
      400,
      "User UUID is required. Set ADMIN_USER_ID environment variable or provide user_uuid in query/header."
    );
  }

  const { data, error } = await handleDbOperation(async () => {
    const result = await supabase
      .from("profile")
      .select("id, name, user_uuid")
      .eq("user_uuid", userId)
      .order("created_at", { ascending: false });
    return result;
  }, "Get profiles error");

  if (error) {
    return sendError(res, 500, error);
  }
  sendSuccess(res, data || []);
});

// Get songs for a profile
app.get("/api/profiles/:profileId/songs", async (req, res) => {
  const profileId = parseInt(req.params.profileId);
  const userId = getCurrentUserId(req);

  if (isNaN(profileId)) {
    return sendError(res, 400, "Invalid profile ID");
  }

  if (!userId) {
    return sendError(
      res,
      400,
      "User UUID is required. Set ADMIN_USER_ID environment variable or provide user_uuid in query/header."
    );
  }

  // Verify that the profile belongs to the current user
  const { data: profile } = await supabase
    .from("profile")
    .select("id")
    .eq("id", profileId)
    .eq("user_uuid", userId)
    .single();

  if (!profile) {
    return sendError(res, 403, "Profile not found or access denied");
  }

  const { data, error } = await handleDbOperation(async () => {
    const result = await supabase
      .from("profile_song")
      .select(
        `
          id,
          notes,
          resources,
          created_at,
          song:song_id (
            id,
            spotify_track_id,
            name,
            artist,
            album,
            created_at
          )
        `
      )
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false });
    return result;
  }, "Get profile songs error");

  if (error) {
    return sendError(res, 500, error);
  }

  // Fetch album images from Spotify for each song using spotify_track_id
  if (data && Array.isArray(data)) {
    const songsWithImages = await Promise.all(
      data.map(async (profileSong: any) => {
        if (profileSong.song?.spotify_track_id) {
          try {
            const track = await getTrack(profileSong.song.spotify_track_id);
            const albumImageUrl = track.album?.images?.[1]?.url || track.album?.images?.[0]?.url || null;
            return {
              ...profileSong,
              song: {
                ...profileSong.song,
                album_image_url: albumImageUrl,
              },
            };
          } catch (err) {
            console.error(`Failed to fetch track ${profileSong.song.spotify_track_id}:`, err);
            return {
              ...profileSong,
              song: {
                ...profileSong.song,
                album_image_url: null,
              },
            };
          }
        }
        return {
          ...profileSong,
          song: {
            ...profileSong.song,
            album_image_url: null,
          },
        };
      })
    );
    return sendSuccess(res, songsWithImages);
  }

  sendSuccess(res, data || []);
});

// Add song to profile
app.post("/api/add-song-to-profile", async (req, res) => {
  console.log("headers:", req.headers);
  console.log("body:", req.body);

  const { track, profileId } = req.body.data;
  const userId = getCurrentUserId(req);

  if (!userId) {
    return sendError(
      res,
      400,
      "User UUID is required. Set ADMIN_USER_ID environment variable or provide user_uuid in query/header."
    );
  }

  const isTrackValid =
    track && typeof track === "object" && Object.keys(track).length > 0;
  const isProfileIdValid =
    profileId !== null &&
    profileId !== undefined &&
    typeof profileId === "number";

  if (!isTrackValid) {
    return sendError(res, 400, "Invalid track: " + track);
  }

  if (!isProfileIdValid) {
    return sendError(res, 400, "Invalid profileId: " + profileId);
  }

  // Check for id in multiple possible locations
  const trackId =
    track.id || (track as any).spotify_track_id || (track as any).track_id;

  if (!trackId || (typeof trackId === "string" && trackId.trim() === "")) {
    return sendError(res, 400, "Track must have an id");
  }

  // Use the found id
  const trackWithId = { ...track, id: trackId };

  // Verify that the profile belongs to the current user
  const { data: profile, error: profileError } = await supabase
    .from("profile")
    .select("id, user_uuid")
    .eq("id", profileId)
    .eq("user_uuid", userId)
    .single();

  if (profileError || !profile) {
    return sendError(res, 403, "Profile not found or access denied");
  }

  // Check if song exists, if not create it
  let { data: existingSong, error: songError } = await supabase
    .from("song")
    .select("id")
    .eq("spotify_track_id", trackWithId.id)
    .single();

  let songId: number;

  if (songError && songError.code === "PGRST116") {
    // Song doesn't exist, create it
    const { data: newSong, error: createError } = await supabase
      .from("song")
      .insert({
        spotify_track_id: trackWithId.id,
        name: trackWithId.name || null,
        artist: trackWithId.artists?.[0]?.name || null,
        album: trackWithId.album?.name || null,
      })
      .select("id")
      .single();

    if (createError) {
      console.error("Create song error:", createError);
      return sendError(
        res,
        500,
        `Failed to create song: ${createError.message}`
      );
    }
    if (!newSong) {
      return sendError(res, 500, "Failed to create song: No data returned");
    }
    songId = newSong.id;
  } else if (songError) {
    console.error("Check song error:", songError);
    return sendError(res, 500, `Failed to check song: ${songError.message}`);
  } else if (!existingSong) {
    return sendError(res, 500, "Failed to retrieve song");
  } else {
    songId = existingSong.id;
  }

  // Check if profile_song already exists
  const { data: existingProfileSong } = await supabase
    .from("profile_song")
    .select("id")
    .eq("profile_id", profileId)
    .eq("song_id", songId)
    .single();

  if (existingProfileSong) {
    return sendError(res, 400, "Song already exists in this profile");
  }

  // Check if profile already has 8 songs (maximum limit)
  const { data: existingSongs, error: countError } = await supabase
    .from("profile_song")
    .select("id")
    .eq("profile_id", profileId);

  if (countError) {
    console.error("Error counting profile songs:", countError);
    return sendError(res, 500, `Failed to check profile songs: ${countError.message}`);
  }

  const songCount = existingSongs?.length ?? 0;
  if (songCount >= 8) {
    return sendError(res, 400, "8 songs maximum");
  }

  // Create profile_song entry
  const { data: profileSong, error: profileSongError } = await supabase
    .from("profile_song")
    .insert({
      profile_id: profileId,
      song_id: songId,
      notes: "", // Required field, default to empty string
      resources: null, // Optional field
    })
    .select("id")
    .single();

  if (profileSongError) {
    console.error("Add song to profile error:", profileSongError);
    return sendError(
      res,
      500,
      `Failed to add song to profile: ${profileSongError.message}`
    );
  }
  if (!profileSong) {
    return sendError(
      res,
      500,
      "Failed to add song to profile: No data returned"
    );
  }

  sendSuccess(res, profileSong);
});

// Remove song from profile
app.delete("/api/profiles/:profileId/songs/:profileSongId", async (req, res) => {
  const profileId = parseInt(req.params.profileId);
  const profileSongId = parseInt(req.params.profileSongId);
  const userId = getCurrentUserId(req);

  if (isNaN(profileId) || isNaN(profileSongId)) {
    return sendError(res, 400, "Invalid profile ID or song ID");
  }

  if (!userId) {
    return sendError(
      res,
      400,
      "User UUID is required. Set ADMIN_USER_ID environment variable or provide user_uuid in query/header."
    );
  }

  // Verify that the profile belongs to the current user
  const { data: profile } = await supabase
    .from("profile")
    .select("id")
    .eq("id", profileId)
    .eq("user_uuid", userId)
    .single();

  if (!profile) {
    return sendError(res, 403, "Profile not found or access denied");
  }

  // Verify that the profile_song belongs to this profile
  const { data: profileSong } = await supabase
    .from("profile_song")
    .select("id, profile_id")
    .eq("id", profileSongId)
    .eq("profile_id", profileId)
    .single();

  if (!profileSong) {
    return sendError(res, 404, "Song not found in this profile");
  }

  // Delete the profile_song entry
  const { error: deleteError } = await supabase
    .from("profile_song")
    .delete()
    .eq("id", profileSongId);

  if (deleteError) {
    console.error("Delete song error:", deleteError);
    return sendError(res, 500, `Failed to remove song: ${deleteError.message}`);
  }

  sendSuccess(res, { deleted: true });
});

// Update profile song (notes and resources)
app.put("/api/profiles/:profileId/songs/:profileSongId", async (req, res) => {
  const profileId = parseInt(req.params.profileId);
  const profileSongId = parseInt(req.params.profileSongId);
  const userId = getCurrentUserId(req);

  if (isNaN(profileId) || isNaN(profileSongId)) {
    return sendError(res, 400, "Invalid profile ID or song ID");
  }

  if (!userId) {
    return sendError(
      res,
      400,
      "User UUID is required. Set ADMIN_USER_ID environment variable or provide user_uuid in query/header."
    );
  }

  const { notes, resources } = req.body.data || {};

  // Verify that the profile belongs to the current user
  const { data: profile } = await supabase
    .from("profile")
    .select("id")
    .eq("id", profileId)
    .eq("user_uuid", userId)
    .single();

  if (!profile) {
    return sendError(res, 403, "Profile not found or access denied");
  }

  // Verify that the profile_song belongs to this profile
  const { data: existingProfileSong } = await supabase
    .from("profile_song")
    .select("id, profile_id")
    .eq("id", profileSongId)
    .eq("profile_id", profileId)
    .single();

  if (!existingProfileSong) {
    return sendError(res, 404, "Song not found in this profile");
  }

  // Set the session variable for the current user UUID
  await setCurrentUserUuid(userId);

  // Update the profile_song entry
  const updateData: { notes?: string; resources?: unknown } = {};
  if (notes !== undefined) {
    updateData.notes = notes;
  }
  if (resources !== undefined) {
    updateData.resources = resources;
  }

  const { error: updateError } = await supabase
    .from("profile_song")
    .update(updateData)
    .eq("id", profileSongId);

  if (updateError) {
    console.error("Update profile song error:", updateError);
    return sendError(res, 500, `Failed to update profile song: ${updateError.message}`);
  }

  // Fetch the updated profile_song with song details
  const { data: updatedProfileSong, error: fetchError } = await supabase
    .from("profile_song")
    .select(
      `
        id,
        notes,
        resources,
        created_at,
        song:song_id (
          id,
          spotify_track_id,
          name,
          artist,
          album,
          created_at
        )
      `
    )
    .eq("id", profileSongId)
    .single();

  if (fetchError || !updatedProfileSong) {
    console.error("Fetch updated profile song error:", fetchError);
    return sendError(res, 500, "Failed to fetch updated profile song");
  }

  // Fetch album image from Spotify
  const profileSongWithImage: any = { ...updatedProfileSong };
  if (profileSongWithImage.song && Array.isArray(profileSongWithImage.song) && profileSongWithImage.song.length > 0) {
    const songData = profileSongWithImage.song[0];
    if (songData?.spotify_track_id) {
      try {
        const track = await getTrack(songData.spotify_track_id);
        const albumImageUrl = track.album?.images?.[1]?.url || track.album?.images?.[0]?.url || null;
        profileSongWithImage.song = {
          ...songData,
          album_image_url: albumImageUrl,
        };
      } catch (err) {
        console.error(`Failed to fetch track ${songData.spotify_track_id}:`, err);
        profileSongWithImage.song = {
          ...songData,
          album_image_url: null,
        };
      }
    } else {
      profileSongWithImage.song = {
        ...songData,
        album_image_url: null,
      };
    }
  }

  sendSuccess(res, profileSongWithImage);
});

app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});
