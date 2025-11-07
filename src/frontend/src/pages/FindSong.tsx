import React, { useState } from 'react';
import SearchBar from '../components/SearchBar';
import spotifySearch from '../api';
import type { SpotifySearchResults } from '../types';

const FindSong: React.FC = () => {
    const [searchResults, setSearchResults] = useState<SpotifySearchResults>({ tracks: { items: [] } });

  const handleSearch = async (query: string) => {
    const results = await spotifySearch(query);
    console.log('Searching for:', query);

    setSearchResults(results);
  };
  
  // TODO: fix this so that the search results are displayed correctly (and debugging)
  return (
    <div className="text-center py-8">
      <SearchBar 
        placeholder="Enter song name or artist..."
        onSearch={handleSearch}
        className="mb-6"
      />
      <div className="text-white">
        {searchResults?.tracks?.items?.map((result) => {
          console.log("Rendering track:", result);
          return (
            <div key={result.id}>
              <h2>{result?.name}</h2>
              <p>{result?.artists.map((artist) => artist.name).join(', ')}</p>
              <p>{result?.album.name}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FindSong;