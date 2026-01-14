import React, { useState, useEffect, useCallback } from "react";
import CustomSelect from "../components/CustomSelect";
import {
  getProfiles,
  getProfileSongs,
  updateProfileSong,
  type Profile,
  type ProfileSongWithDetails,
} from "../api";

const Practice: React.FC = () => {
  // Profile selection
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(
    null
  );
  const [profileSongs, setProfileSongs] = useState<ProfileSongWithDetails[]>(
    []
  );
  const [selectedSong, setSelectedSong] = useState<ProfileSongWithDetails | null>(
    null
  );
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);
  const [isLoadingProfileSongs, setIsLoadingProfileSongs] = useState(false);
  
  // Editable state
  const [editableNotes, setEditableNotes] = useState("");
  const [editableLinks, setEditableLinks] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved" | null>(null);
  const [newLinkName, setNewLinkName] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [previewedLinkName, setPreviewedLinkName] = useState<string | null>(null);

  const loadProfileSongs = useCallback(async (profileId: number) => {
    setIsLoadingProfileSongs(true);
    try {
      const songs = await getProfileSongs(profileId);
      setProfileSongs(songs);
      // Auto-select first song if available
      if (songs.length > 0) {
        setSelectedSong(songs[0]);
        setEditableNotes(songs[0].notes || "");
        setEditableLinks(
          (songs[0].resources && typeof songs[0].resources === 'object' && songs[0].resources !== null)
            ? (songs[0].resources as Record<string, string>)
            : {}
        );
      } else {
        setSelectedSong(null);
        setEditableNotes("");
        setEditableLinks({});
        setPreviewedLinkName(null);
      }
    } catch (err) {
      console.error("Error fetching profile songs:", err);
    } finally {
      setIsLoadingProfileSongs(false);
    }
  }, []);

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
      } finally {
        setIsLoadingProfiles(false);
      }
    };
    loadProfiles();
  }, []);

  // Load profile songs when profile is selected
  useEffect(() => {
    if (selectedProfileId) {
      setSelectedSong(null); // Reset selected song when profile changes
      setEditableNotes("");
      setEditableLinks({});
      loadProfileSongs(selectedProfileId);
    } else {
      setProfileSongs([]);
      setSelectedSong(null);
      setEditableNotes("");
      setEditableLinks({});
      setPreviewedLinkName(null);
    }
  }, [selectedProfileId, loadProfileSongs]);

  // Update editable state when song selection changes
  useEffect(() => {
    if (selectedSong) {
      setEditableNotes(selectedSong.notes || "");
      setEditableLinks(
        (selectedSong.resources && typeof selectedSong.resources === 'object' && selectedSong.resources !== null)
          ? (selectedSong.resources as Record<string, string>)
          : {}
      );
      setSaveError(null);
      setSaveStatus("saved");
      setNewLinkName("");
      setNewLinkUrl("");
      // Auto-select first link for preview if available
      const links = (selectedSong.resources && typeof selectedSong.resources === 'object' && selectedSong.resources !== null)
        ? (selectedSong.resources as Record<string, string>)
        : {};
      const linkEntries = Object.entries(links);
      setPreviewedLinkName(linkEntries.length > 0 ? linkEntries[0][0] : null);
    }
  }, [selectedSong]);

  const handleProfileChange = (profileId: number) => {
    setSelectedProfileId(profileId);
  };

  const handleSongSelect = (profileSong: ProfileSongWithDetails) => {
    setSelectedSong(profileSong);
  };

  const performSave = useCallback(async () => {
    if (!selectedSong || !selectedProfileId) return;

    setIsSaving(true);
    setSaveError(null);
    setSaveStatus("saving");

    try {
      // Preserve the current album image URL before saving
      const currentAlbumImageUrl = selectedSong?.song?.album_image_url;
      
      const updatedSong = await updateProfileSong(
        selectedProfileId,
        selectedSong.id,
        editableNotes,
        Object.keys(editableLinks).length > 0 ? editableLinks : undefined
      );

      // Preserve the album image URL from the current song if the updated one doesn't have it
      // This prevents the image from going gray while Spotify API is being fetched
      if (updatedSong.song && currentAlbumImageUrl && !updatedSong.song.album_image_url) {
        updatedSong.song.album_image_url = currentAlbumImageUrl;
      }

      // Update the selected song and the songs list
      setSelectedSong(updatedSong);
      setProfileSongs((prevSongs) =>
        prevSongs.map((song) => {
          if (song.id === updatedSong.id) {
            // Preserve album image for songs in the list too
            if (song.song?.album_image_url && !updatedSong.song?.album_image_url) {
              updatedSong.song.album_image_url = song.song.album_image_url;
            }
            return updatedSong;
          }
          return song;
        })
      );
      setSaveStatus("saved");
      setSaveError(null);
      
      // Clear saved status after 2 seconds
      setTimeout(() => {
        setSaveStatus(null);
      }, 2000);
    } catch (err) {
      console.error("Error saving profile song:", err);
      setSaveError(
        err instanceof Error ? err.message : "Failed to save changes"
      );
      setSaveStatus("unsaved");
    } finally {
      setIsSaving(false);
    }
  }, [selectedSong, selectedProfileId, editableNotes, editableLinks]);

  const handleSave = () => {
    performSave();
  };

  // Debounced auto-save: saves 1.5 seconds after user stops typing
  useEffect(() => {
    if (!selectedSong || !selectedProfileId) return;
    
    // Check if there are actual changes
    const notesChanged = editableNotes !== (selectedSong.notes || "");
    const linksChanged = JSON.stringify(editableLinks) !== JSON.stringify(
      (selectedSong.resources && typeof selectedSong.resources === 'object' && selectedSong.resources !== null)
        ? (selectedSong.resources as Record<string, string>)
        : {}
    );
    
    if (!notesChanged && !linksChanged) {
      setSaveStatus(null);
      return;
    }

    setSaveStatus("unsaved");

    // Set up debounced save
    const timeoutId = setTimeout(() => {
      performSave();
    }, 1500); // Wait 1.5 seconds after user stops typing

    // Cleanup timeout if user continues typing or component unmounts
    return () => {
      clearTimeout(timeoutId);
    };
  }, [editableNotes, editableLinks, selectedSong, selectedProfileId, performSave]);

  const handleAddLink = () => {
    if (newLinkName.trim() && newLinkUrl.trim()) {
      setEditableLinks((prev) => ({
        ...prev,
        [newLinkName.trim()]: newLinkUrl.trim(),
      }));
      setNewLinkName("");
      setNewLinkUrl("");
    }
  };

  const handleRemoveLink = (linkName: string) => {
    setEditableLinks((prev) => {
      const newLinks = { ...prev };
      delete newLinks[linkName];
      return newLinks;
    });
  };

  // Helper function to extract YouTube video ID from URL
  const getYouTubeVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  };

  // Get the currently previewed link
  const getPreviewedLink = (): { name: string; url: string } | null => {
    if (!previewedLinkName || !editableLinks[previewedLinkName]) {
      // Fallback to first link if selected link doesn't exist
      const linkEntries = Object.entries(editableLinks);
      if (linkEntries.length === 0) return null;
      return { name: linkEntries[0][0], url: linkEntries[0][1] };
    }
    return { name: previewedLinkName, url: editableLinks[previewedLinkName] };
  };

  const handleSetPreviewLink = (linkName: string) => {
    setPreviewedLinkName(linkName);
  };

  return (
    <div className="w-full flex gap-4 p-10 py-10">
      {/* Left Column - Minimal Profile & Song Selector */}
      <div className="flex flex-col w-[275px] flex-shrink-0 gap-3">
        {/* Profile Selector - Minimal */}
        <div>
          {isLoadingProfiles ? (
            <div className="flex items-center justify-center h-8">
              <div className="w-3 h-3 border-2 border-t-transparent rounded-full animate-spin opacity-50"></div>
            </div>
          ) : profiles.length === 0 ? (
            <div className="text-dark-400 text-xs text-center py-1">
              No profiles
            </div>
          ) : (
            <div className="[&_button]:py-1 [&_button]:px-3 [&_button]:text-xs [&_button]:text-sm [&_div]:text-xs">
              <CustomSelect
                value={selectedProfileId}
                onChange={handleProfileChange}
                options={profiles.map((profile) => ({
                  value: profile.id,
                  label: profile.name || `Profile #${profile.id}`,
                }))}
              />
            </div>
          )}
        </div>

        {/* Song List - Minimal & Compact */}
        <div className="flex-1 overflow-y-auto">
          {isLoadingProfileSongs ? (
            <div className="flex justify-center items-center h-16">
              <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin opacity-50"></div>
            </div>
          ) : !selectedProfileId ? (
            <div className="text-dark-400 text-xs text-center py-4">
              Select profile
            </div>
          ) : profileSongs.length === 0 ? (
            <div className="text-dark-400 text-xs text-center py-4">
              No songs
            </div>
          ) : (
            <div className="space-y-1">
              {profileSongs.map((profileSong) => {
                const song = profileSong.song;
                const isSelected = selectedSong?.id === profileSong.id;
                return (
                  <button
                    key={profileSong.id}
                    onClick={() => handleSongSelect(profileSong)}
                    className={`w-full flex items-center gap-2 p-2 rounded text-left transition-colors ${
                      isSelected
                        ? "bg-dark-700 bg-opacity-60 border border-dark-600"
                        : "bg-dark-800 bg-opacity-20 border border-dark-700 hover:bg-dark-700 hover:bg-opacity-30"
                    }`}
                  >
                    {/* Tiny album image */}
                    {song.album_image_url ? (
                      <img
                        src={song.album_image_url}
                        alt={song.album || song.name || "Album"}
                        className="w-8 h-8 rounded object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded bg-dark-700 flex-shrink-0"></div>
                    )}
                    {/* Song name only - truncated */}
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-medium truncate">
                        {song.name || "Unknown Song"}
                      </p>
                      <p className="text-dark-400 text-[10px] truncate">
                        {song.artist || "Unknown Artist"}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Column - Large Song Dashboard */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedSong ? (
          <div className="flex flex-col gap-6">
            {/* Song Header */}
            <div className="flex gap-6 relative flex-shrink-0">
              {/* Album Image - Large */}
              {selectedSong.song.album_image_url ? (
                <img
                  src={selectedSong.song.album_image_url}
                  alt={selectedSong.song.album || selectedSong.song.name || "Album"}
                  className="w-48 h-48 rounded-lg object-cover flex-shrink-0 shadow-lg"
                />
              ) : (
                <div className="w-48 h-48 rounded-lg bg-dark-700 flex-shrink-0"></div>
              )}
              {/* Song Info */}
              <div className="flex flex-col justify-end pb-2 flex-1">
                <h1 className="text-white text-4xl font-bold mb-2">
                  {selectedSong.song.name || "Unknown Song"}
                </h1>
                <h2 className="text-dark-300 text-xl mb-1">
                  {selectedSong.song.artist || "Unknown Artist"}
                </h2>
                {selectedSong.song.album && (
                  <p className="text-dark-400 text-sm">
                    {selectedSong.song.album}
                  </p>
                )}
              </div>
              {/* Save Button/Status - Top Right */}
              <div className="absolute top-0 right-0 flex items-center gap-2">
                {saveError && (
                  <span className="text-red-400 text-xs">{saveError}</span>
                )}
                {saveStatus === "saving" && (
                  <span className="text-dark-400 text-xs">Saving...</span>
                )}
                {saveStatus === "saved" && (
                  <span className="text-green-400 text-xs">Saved</span>
                )}
                {saveStatus === "unsaved" && (
                  <span className="text-yellow-400 text-xs">Unsaved changes</span>
                )}
                <button
                  onClick={handleSave}
                  disabled={isSaving || !selectedProfileId || saveStatus === "saved"}
                  className="px-4 py-2 bg-dark-800 bg-opacity-20 hover:bg-opacity-30 text-white text-sm font-medium rounded border border-dark-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Save
                </button>
              </div>
            </div>

            {/* Dashboard Sections */}
            <div className="grid grid-cols-2 gap-6">
              {/* Notes Section */}
              <div className="flex flex-col">
                <h3 className="text-white text-lg font-semibold mb-3">Notes</h3>
                <div className="flex-1 bg-dark-800 bg-opacity-20 rounded-lg border border-dark-700 p-4">
                  <textarea
                    value={editableNotes}
                    onChange={(e) => setEditableNotes(e.target.value)}
                    placeholder="Add your practice notes here..."
                    className="w-full h-full bg-transparent text-white text-sm resize-none focus:outline-none placeholder:text-dark-400"
                  />
                </div>
              </div>

              {/* Links Section */}
              <div className="flex flex-col">
                <h3 className="text-white text-lg font-semibold mb-3">Links</h3>
                <div className="flex-1 bg-dark-800 bg-opacity-20 rounded-lg border border-dark-700 p-4 flex flex-col gap-2">
                  {/* Existing Links */}
                  <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
                    {Object.entries(editableLinks).length > 0 ? (
                      Object.entries(editableLinks).map(([key, value]) => (
                        <div
                          key={key}
                          className="flex items-center gap-2 p-2 bg-dark-900 bg-opacity-30 rounded border border-dark-600"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-xs font-medium truncate">{key}</p>
                            <a
                              href={value}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 text-xs underline truncate block"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {value}
                            </a>
                          </div>
                          <button
                            onClick={() => handleSetPreviewLink(key)}
                            className={`px-2 py-1 text-xs rounded border transition-colors ${
                              previewedLinkName === key
                                ? 'bg-dark-600 border-dark-500 text-white'
                                : 'bg-dark-800 bg-opacity-20 hover:bg-opacity-30 border-dark-700 text-dark-300 hover:text-white'
                            }`}
                            title="Preview this link"
                          >
                            Preview
                          </button>
                          <button
                            onClick={() => handleRemoveLink(key)}
                            className="text-white hover:text-gray-300 text-sm font-bold px-2"
                            title="Remove link"
                          >
                            ×
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-dark-400 text-sm italic">
                        No links yet
                      </p>
                    )}
                  </div>
                  
                  {/* Add Link Form */}
                  <div className="flex flex-col gap-2 pt-2 border-t border-dark-600">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newLinkName}
                        onChange={(e) => setNewLinkName(e.target.value)}
                        placeholder="Link name"
                        className="flex-1 px-2 py-1 bg-dark-900 bg-opacity-50 text-white text-xs rounded border border-dark-600 focus:outline-none focus:border-dark-500 placeholder:text-dark-400"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddLink();
                          }
                        }}
                      />
                      <input
                        type="text"
                        value={newLinkUrl}
                        onChange={(e) => setNewLinkUrl(e.target.value)}
                        placeholder="URL"
                        className="flex-1 px-2 py-1 bg-dark-900 bg-opacity-50 text-white text-xs rounded border border-dark-600 focus:outline-none focus:border-dark-500 placeholder:text-dark-400"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddLink();
                          }
                        }}
                      />
                    </div>
                    <button
                      onClick={handleAddLink}
                      disabled={!newLinkName.trim() || !newLinkUrl.trim()}
                      className="px-3 py-1 bg-dark-700 hover:bg-dark-600 text-white text-xs rounded border border-dark-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Add Link
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Link Preview - HUGE Tab Below Everything */}
            {(() => {
              const previewedLink = getPreviewedLink();
              if (!previewedLink) return null;

              const youtubeVideoId = getYouTubeVideoId(previewedLink.url);
              
              return (
                <div className="w-full flex-1 min-h-[500px] flex flex-col bg-dark-800 bg-opacity-20 rounded-lg border border-dark-700 p-6">
                  <h3 className="text-white text-lg font-semibold mb-4 flex-shrink-0">
                    Link Preview: {previewedLink.name}
                  </h3>
                  
                  <div className="flex-1 min-h-[400px] flex items-center justify-center">
                    {youtubeVideoId ? (
                      <div className="w-full h-full">
                        {/* YouTube Embed */}
                        <div className="relative w-full h-full" style={{ paddingBottom: '56.25%', maxHeight: '800px' }}>
                          <iframe
                            src={`https://www.youtube.com/embed/${youtubeVideoId}`}
                            title={previewedLink.name}
                            className="absolute top-0 left-0 w-full h-full rounded-lg"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full min-h-[400px] bg-dark-900 bg-opacity-50 rounded-lg border border-dark-600 p-8 flex items-center justify-center">
                        <div className="text-center">
                          <p className="text-white text-lg mb-2">{previewedLink.name}</p>
                          <a
                            href={previewedLink.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 text-sm underline break-all"
                          >
                            {previewedLink.url}
                          </a>
                          <p className="text-dark-400 text-xs mt-4">
                            Preview not available for this link type
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-dark-400 text-lg">
              Select a song to view details
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Practice;
