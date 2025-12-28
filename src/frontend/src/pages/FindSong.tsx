import React, { useState, useEffect } from "react";
import SearchBar from "../components/SearchBar";
import spotifySearch, { getProfiles, addSongToProfile, getProfileSongs, type Profile, type ProfileSongWithDetails } from "../api";
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
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null);
  const [profileSongs, setProfileSongs] = useState<ProfileSongWithDetails[]>([]);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);
  const [isLoadingProfileSongs, setIsLoadingProfileSongs] = useState(false);
  
  // Adding songs
  const [isAddingSong, setIsAddingSong] = useState(false);
  const [addSongError, setAddSongError] = useState<string | null>(null);

  // Load profiles on mount
  useEffect(() => {
    const loadProfiles = async () => {
      setIsLoadingProfiles(true);
      try {
        const profileList = await getProfiles();
        setProfiles(profileList);
        // Auto-select first profile if available and none selected
        if (profileList.length > 0) {
          setSelectedProfileId((prev) => prev || profileList[0].id);
        }
      } catch (err) {
        console.error("Error fetching profiles:", err);
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

    setIsAddingSong(true);
    setAddSongError(null);

    try {
      await addSongToProfile(track, selectedProfileId);
      // Refresh profile songs after adding
      await loadProfileSongs(selectedProfileId);
    } catch (err) {
      console.error("Error adding song to profile:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to add song to profile";
      setAddSongError(errorMessage);
    } finally {
      setIsAddingSong(false);
    }
  };

  const handleProfileChange = (profileId: number) => {
    setSelectedProfileId(profileId);
  };

  return (
    <div className="w-full h-full flex gap-4 p-4 py-10">
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
              const albumImage = result.album?.images?.[1]?.url || result.album?.images?.[0]?.url;
              return (
                <div key={result.id} className="flex items-center gap-3 mb-3 p-2 hover:bg-dark-800/35 rounded transition-colors">
                  {/* Album Image */}
                  {albumImage ? (
                    <img
                      src={albumImage}
                      alt={result.album?.name || result.name}
                      className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-dark-700 flex-shrink-0 flex items-center justify-center">
                      <span className="text-dark-400 text-xs">🎵</span>
                    </div>
                  )}
                  {/* Button */}
                  <button
                    onClick={() => handleAddSongClick(result)}
                    className="text-sm bg-black bg-opacity-15 hover:bg-opacity-30 px-2 py-1 rounded transition-colors flex-shrink-0"
                    disabled={isAddingSong || !selectedProfileId}
                    title={!selectedProfileId ? "Select a profile first" : "Add to profile"}
                  >
                    +
                  </button>
                  {/* Song Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">
                      {result.name}
                    </h3>
                    <p className="text-dark-300 text-xs truncate">{result.artists[0]?.name}</p>
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
          <label className="block text-white text-sm font-medium mb-2 text-center">Select Profile</label>
          {isLoadingProfiles ? (
            <div className="flex items-center">
              <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin opacity-50"></div>
            </div>
          ) : profiles.length === 0 ? (
            <div className="text-dark-300 text-sm text-center">No profiles available.</div>
          ) : (
            <select
              value={selectedProfileId || ""}
              onChange={(e) => handleProfileChange(Number(e.target.value))}
              className="w-full bg-dark-800 text-white px-4 py-2 rounded border border-dark-700 focus:outline-none focus:border-dark-600"
            >
              {profiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.name || `Profile #${profile.id}`}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Profile Songs List */}
        <div className="flex-1 overflow-y-auto">
          {isLoadingProfileSongs ? (
            <div className="flex justify-center items-center h-32">
              <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin opacity-50"></div>
            </div>
          ) : !selectedProfileId ? (
            <div className="text-dark-300 text-center py-8">Select a profile to view songs</div>
          ) : profileSongs.length === 0 ? (
            <div className="text-dark-300 text-center py-8">No songs in this profile yet</div>
          ) : (
            <div className="space-y-2">
              {profileSongs.map((profileSong) => {
                const song = profileSong.song;
                return (
                  <div
                    key={profileSong.id}
                    className="bg-dark-800 p-4 rounded border border-dark-700 hover:bg-dark-700 transition-colors flex items-start gap-3"
                  >
                    {/* Album Image Placeholder */}
                    <div className="w-16 h-16 rounded-full bg-dark-700 flex-shrink-0 flex items-center justify-center">
                      <span className="text-dark-400 text-xl">🎵</span>
                    </div>
                    {/* Song Info */}
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
                        <p className="text-dark-300 text-xs mt-2 italic">{profileSong.notes}</p>
                      )}
                    </div>
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
