import React, { useState, useEffect } from "react";
import SearchBar from "../components/SearchBar";
import CustomSelect from "../components/CustomSelect";
import spotifySearch, {
  getProfiles,
  addSongToProfile,
  getProfileSongs,
  removeSongFromProfile,
  updateProfileName,
  type Profile,
  type ProfileSongWithDetails,
} from "../api";
import type { SpotifySearchResults, SpotifyTrack } from "../types";

const FindSong: React.FC = () => {
  const [searchResults, setSearchResults] = useState<SpotifySearchResults>({
    tracks: { items: [] },
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Profile selection
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(
    null
  );
  const [profileSongs, setProfileSongs] = useState<ProfileSongWithDetails[]>(
    []
  );
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);
  const [isLoadingProfileSongs, setIsLoadingProfileSongs] = useState(false);

  // Adding songs
  const [isAddingSong, setIsAddingSong] = useState(false);
  const [addSongError, setAddSongError] = useState<string | null>(null);
  const [removingSongId, setRemovingSongId] = useState<number | null>(null);
  
  // Renaming profile
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameInput, setRenameInput] = useState("");
  const [showRenameInput, setShowRenameInput] = useState(false);

  // Load profiles on mount
  useEffect(() => {
    const loadProfiles = async () => {
      console.log("loadProfiles called");
      setIsLoadingProfiles(true);
      try {
        console.log("Calling getProfiles()...");
        const profileList = await getProfiles();
        console.log("getProfiles returned:", profileList);
        setProfiles(profileList);
        // Auto-select first profile if available and none selected
        if (profileList.length > 0) {
          setSelectedProfileId((prev) => prev || profileList[0].id);
        }
      } catch (err) {
        console.error("Error fetching profiles:", err);
        // Set error state so user can see what went wrong
        setError(
          err instanceof Error ? err.message : "Failed to load profiles"
        );
      } finally {
        setIsLoadingProfiles(false);
      }
    };
    loadProfiles();
  }, []);

  // Load profile songs when profile is selected
  useEffect(() => {
    if (selectedProfileId) {
      loadProfileSongs(selectedProfileId);
    } else {
      setProfileSongs([]);
    }
  }, [selectedProfileId]);

  const loadProfileSongs = async (profileId: number) => {
    setIsLoadingProfileSongs(true);
    try {
      const songs = await getProfileSongs(profileId);
      setProfileSongs(songs);
    } catch (err) {
      console.error("Error fetching profile songs:", err);
    } finally {
      setIsLoadingProfileSongs(false);
    }
  };

  const handleSearch = async (query: string) => {
    console.log("Searching for:", query);
    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const results = await spotifySearch(query);
      setSearchResults(results);
    } catch (err) {
      console.error("Search error:", err);
      setError("Failed search...");
      setSearchResults({ tracks: { items: [] } });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSongClick = async (track: SpotifyTrack) => {
    if (!selectedProfileId) {
      setAddSongError("Please select a profile first");
      return;
    }

    // Check if profile already has 8 songs (maximum limit)
    if (profileSongs.length >= 8) {
      setAddSongError("8 songs maximum");
      return;
    }

    console.log("Adding song - track object:", track);
    console.log("Adding song - track.id:", track.id);
    console.log("Adding song - profileId:", selectedProfileId);

    if (!track.id) {
      console.error("Track is missing id property!", track);
      setAddSongError("Track is missing ID");
      return;
    }

    setIsAddingSong(true);
    setAddSongError(null);

    try {
      await addSongToProfile(track, selectedProfileId);
      // Refresh profile songs after adding
      await loadProfileSongs(selectedProfileId);
    } catch (err) {
      console.error("Error adding song to profile:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to add song to profile";
      setAddSongError(errorMessage);
    } finally {
      setIsAddingSong(false);
    }
  };

  const handleProfileChange = (profileId: number) => {
    setSelectedProfileId(profileId);
  };

  const handleRenameClick = () => {
    const currentProfile = profiles.find((p) => p.id === selectedProfileId);
    if (currentProfile) {
      setRenameInput(currentProfile.name || "");
      setShowRenameInput(true);
    }
  };

  const handleRenameSubmit = async () => {
    if (!selectedProfileId || !renameInput.trim()) return;

    setIsRenaming(true);
    try {
      const updatedProfile = await updateProfileName(selectedProfileId, renameInput.trim());
      // Update the profiles list
      setProfiles((prev) =>
        prev.map((p) => (p.id === updatedProfile.id ? updatedProfile : p))
      );
      setShowRenameInput(false);
      setRenameInput("");
    } catch (err) {
      console.error("Error renaming profile:", err);
      setAddSongError(
        err instanceof Error ? err.message : "Failed to rename profile"
      );
    } finally {
      setIsRenaming(false);
    }
  };

  const handleRenameCancel = () => {
    setShowRenameInput(false);
    setRenameInput("");
  };

  const handleRemoveSong = async (profileSongId: number) => {
    if (!selectedProfileId) return;

    setRemovingSongId(profileSongId);
    try {
      await removeSongFromProfile(selectedProfileId, profileSongId);
      await loadProfileSongs(selectedProfileId);
    } catch (err) {
      console.error("Error removing song:", err);
    } finally {
      setRemovingSongId(null);
    }
  };

  return (
    <div className="w-full h-full flex gap-4 p-10 py-10">
      {/* Left Column - Search */}
      <div className="flex flex-col w-80 flex-shrink-0">
        <div className="mb-4">
          <SearchBar
            placeholder="Enter song name or artist..."
            onSearch={handleSearch}
          />
          {/* Status Messages and Loading */}
          <div className="h-6 flex items-center justify-center mt-4">
            {isLoading && (
              <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin opacity-50"></div>
            )}
            {error && <div className="text-red-500 text-sm">{error}</div>}
            {hasSearched &&
              !isLoading &&
              !error &&
              searchResults?.tracks?.items?.length === 0 && (
                <div className="text-dark-300 text-sm">No results found.</div>
              )}
          </div>
        </div>

        {/* Search Results */}
        <div className="text-white max-h-[calc(100vh-200px)] overflow-y-auto">
          {searchResults?.tracks?.items?.length > 0 &&
            searchResults.tracks.items.map((result) => {
              const albumImage =
                result.album?.images?.[1]?.url ||
                result.album?.images?.[0]?.url;
              return (
                <div
                  key={result.id}
                  className="flex items-center gap-3 mb-3 p-2 hover:bg-dark-800/35 rounded transition-colors"
                >
                  {/* Album Image */}
                  {albumImage ? (
                    <img
                      src={albumImage}
                      alt={result.album?.name || result.name}
                      className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-dark-700 flex-shrink-0 flex items-center justify-center"></div>
                  )}
                  {/* Button */}
                  <button
                    onClick={() => handleAddSongClick(result)}
                    className="text-sm bg-black bg-opacity-15 hover:bg-opacity-30 px-2 py-1 rounded transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isAddingSong || !selectedProfileId || profileSongs.length >= 8}
                    title={
                      !selectedProfileId
                        ? "Select a profile first"
                        : profileSongs.length >= 8
                        ? "8 songs maximum"
                        : "Add to profile"
                    }
                  >
                    +
                  </button>
                  {/* Song Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">
                      {result.name}
                    </h3>
                    <p className="text-dark-300 text-xs truncate">
                      {result.artists[0]?.name}
                    </p>
                  </div>
                </div>
              );
            })}
        </div>
        {addSongError && (
          <div className="mt-2 text-red-500 text-sm">{addSongError}</div>
        )}
      </div>

      {/* Right Column - Profile Songs */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Profile Selector */}
        <div className="mb-4">
          <label className="block text-white text-sm font-medium mb-2 text-center">
            Select Profile
          </label>
          {isLoadingProfiles ? (
            <div className="flex items-center">
              <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin opacity-50"></div>
            </div>
          ) : profiles.length === 0 ? (
            <div className="text-dark-300 text-sm text-center">
              No profiles available.
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <CustomSelect
                  value={selectedProfileId}
                  onChange={handleProfileChange}
                  options={profiles.map((profile) => ({
                    value: profile.id,
                    label: profile.name || `Profile #${profile.id}`,
                  }))}
                />
              </div>
              {selectedProfileId && !showRenameInput && (
                <button
                  onClick={handleRenameClick}
                  className="px-3 py-1 bg-dark-800 bg-opacity-20 hover:bg-opacity-30 text-white text-sm font-medium rounded border border-dark-700 transition-colors"
                  title="Rename profile"
                >
                  Rename
                </button>
              )}
              {showRenameInput && (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="text"
                    value={renameInput}
                    onChange={(e) => setRenameInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleRenameSubmit();
                      } else if (e.key === 'Escape') {
                        handleRenameCancel();
                      }
                    }}
                    className="flex-1 px-3 py-1 bg-dark-800 bg-opacity-20 text-white text-sm rounded border border-dark-700 focus:outline-none focus:border-dark-600"
                    placeholder="Profile name"
                    autoFocus
                  />
                  <button
                    onClick={handleRenameSubmit}
                    disabled={isRenaming || !renameInput.trim()}
                    className="px-2 py-1 bg-dark-700 hover:bg-dark-600 text-white text-xs rounded border border-dark-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    ✓
                  </button>
                  <button
                    onClick={handleRenameCancel}
                    disabled={isRenaming}
                    className="px-2 py-1 bg-dark-700 hover:bg-dark-600 text-white text-xs rounded border border-dark-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Profile Songs List */}
        <div className="flex-1 overflow-y-auto">
          {isLoadingProfileSongs ? (
            <div className="flex justify-center items-center h-32">
              <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin opacity-50"></div>
            </div>
          ) : !selectedProfileId ? (
            <div className="text-dark-300 text-center py-8">
              Select a profile to view songs
            </div>
          ) : profileSongs.length === 0 ? (
            <div className="text-dark-400 text-center py-8">
              No songs in this profile yet
            </div>
          ) : (
            <div className="space-y-2">
              {profileSongs.map((profileSong) => {
                const song = profileSong.song;
                const albumImage = song.album_image_url;
                return (
                  <div
                    key={profileSong.id}
                    className="bg-dark-800 bg-opacity-20 p-4 rounded border border-dark-700 hover:bg-dark-700 hover:bg-opacity-40 transition-colors flex items-start gap-3"
                  >
                    {albumImage ? (
                      <img
                        src={albumImage}
                        alt={song.album || song.name || "Album"}
                        className="w-16 h-16 rounded object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded bg-dark-700 flex-shrink-0 flex items-center justify-center">
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold mb-1">
                        {song.name || "Unknown Song"}
                      </h3>
                      <p className="text-dark-300 text-sm mb-1">
                        {song.artist || "Unknown Artist"}
                      </p>
                      {song.album && (
                        <p className="text-dark-400 text-xs">{song.album}</p>
                      )}
                      {profileSong.notes && (
                        <p className="text-dark-300 text-xs mt-2 italic">
                          {profileSong.notes}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveSong(profileSong.id)}
                      disabled={removingSongId === profileSong.id}
                      className="text-white text-xl font-light w-8 h-8 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-sm border border-dark-600 transition-colors flex-shrink-0 hover:bg-black/30 disabled:opacity-50"
                      title="Remove from profile"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FindSong;
