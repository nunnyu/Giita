import React, { useState } from "react";
import SearchBar from "../components/SearchBar";
import spotifySearch from "../api";
import type { SpotifySearchResults } from "../types";

const FindSong: React.FC = () => {
  const [searchResults, setSearchResults] = useState<SpotifySearchResults>({
    tracks: { items: [] },
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (query: string) => {
    console.log("Searching for:", query);
    setIsLoading(true);
    setError(null);
    setHasSearched(true); // one time flag to indicate a search has been made

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

  return (
    <div className="flex flex-col items-center py-3">
      {/* Search Bar */}
      <div className="text-center">
        <SearchBar
          placeholder="Enter song name or artist..."
          onSearch={handleSearch}
          className="mb-6"
        />
        {/* Status Messages */}
        <div className="h-6 flex items-center justify-center">
          {isLoading && (
            <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin opacity-50"></div>
          )}
          {error && <div className="text-red-500">{error}</div>}
          {hasSearched &&
            !isLoading &&
            !error &&
            searchResults?.tracks?.items?.length === 0 && (
              <div className="text-dark-300">No results found.</div>
            )}
        </div>
      </div>
      {/* Results - Centered below search bar */}
      <div className="text-white mt-9 min-h-[300px] max-h-[300px] max-w-[250px] overflow-y-auto text-center">
        {searchResults?.tracks?.items?.length > 0 &&
          searchResults.tracks.items.map((result) => {
            return (
              <div key={result.id} className="mb-4 p-1 rounded-lg">
                <h2 className="font-semibold">
                  {result.name.length > 25
                    ? result.name.substring(0, 25) + "..."
                    : result.name}
                </h2>
                <p className="text-dark-300">{result.artists[0].name}</p>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default FindSong;
