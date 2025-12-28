import express, { Request, Response } from "express";
import cors from "cors";
import { search } from "./api/spotify";
import supabase from "./db";

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

/**
 * Helper function to handle database operations
 * @param operation - The database operation to perform
 * @param errorContext - The context of the error
 * @returns The result of the database operation
 */
async function handleDbOperation<T>(
  operation: () => Promise<{ data: T | null; error: { message: string; code?: string } | null }>,
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
    const errorMessage = err instanceof Error ? err.message : "Something went wrong";
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
  const { data, error } = await handleDbOperation(
    async () => {
      const result = await supabase.from('song').select('*').limit(5);
      return result;
    },
    "Test DB error"
  );

  if (error) {
    return sendError(res, 500, error);
  }
  sendSuccess(res, data);
});

// Get all profiles
app.get("/api/profiles", async (req, res) => {
  const { data, error } = await handleDbOperation(
    async () => {
      const result = await supabase.from('profile').select('id, name, user_id').order('created_at', { ascending: false });
      return result;
    },
    "Get profiles error"
  );

  if (error) {
    return sendError(res, 500, error);
  }
  sendSuccess(res, data || []);
});

// Get songs for a profile
app.get("/api/profiles/:profileId/songs", async (req, res) => {
  const profileId = parseInt(req.params.profileId);
  
  if (isNaN(profileId)) {
    return sendError(res, 400, "Invalid profile ID");
  }

  const { data, error } = await handleDbOperation(
    async () => {
      const result = await supabase
        .from('profile_song')
        .select(`
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
        `)
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false });
      return result;
    },
    "Get profile songs error"
  );

  if (error) {
    return sendError(res, 500, error);
  }
  sendSuccess(res, data || []);
});

// Add song to profile
app.post("/api/add-song-to-profile", async (req, res) => {
  const { track, profileId } = req.body;

  if (!track || !profileId) {
    return sendError(res, 400, "Missing track or profileId");
  }

  if (!track.id) {
    return sendError(res, 400, "Track must have an id");
  }

  // Check if song exists, if not create it
  let { data: existingSong, error: songError } = await supabase
    .from('song')
    .select('id')
    .eq('spotify_track_id', track.id)
    .single();

  let songId: number;

  if (songError && songError.code === 'PGRST116') {
    // Song doesn't exist, create it
    const { data: newSong, error: createError } = await supabase
      .from('song')
      .insert({
        spotify_track_id: track.id,
        name: track.name || null,
        artist: track.artists?.[0]?.name || null,
        album: track.album?.name || null,
      })
      .select('id')
      .single();

    if (createError) {
      console.error("Create song error:", createError);
      return sendError(res, 500, `Failed to create song: ${createError.message}`);
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
    .from('profile_song')
    .select('id')
    .eq('profile_id', profileId)
    .eq('song_id', songId)
    .single();

  if (existingProfileSong) {
    return sendError(res, 400, "Song already exists in this profile");
  }

  // Create profile_song entry
  const { data: profileSong, error: profileSongError } = await supabase
    .from('profile_song')
    .insert({
      profile_id: profileId,
      song_id: songId,
      notes: '', // Required field, default to empty string
      resources: null, // Optional field
    })
    .select('id')
    .single();

  if (profileSongError) {
    console.error("Add song to profile error:", profileSongError);
    return sendError(res, 500, `Failed to add song to profile: ${profileSongError.message}`);
  }
  if (!profileSong) {
    return sendError(res, 500, "Failed to add song to profile: No data returned");
  }

  sendSuccess(res, profileSong);
});

app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});