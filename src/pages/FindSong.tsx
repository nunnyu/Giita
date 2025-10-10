import React, { useState } from 'react';
import SearchBar from '../components/SearchBar';

const FindSong: React.FC = () => {
  const [searchResults, setSearchResults] = useState<string[]>([]);

  const handleSearch = (query: string) => {
    console.log('Searching for:', query);
    // TODO: Implement actual search functionality
    // For now, just log the query
  };

  return (
    <div className="text-center py-8">

      <SearchBar 
        placeholder="Enter song name or artist..."
        onSearch={handleSearch}
        className="mb-6"
      />
      
      {searchResults.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-dark-50 font-woods mb-4">Search Results</h2>
          {/* Search results will be displayed here */}
        </div>
      )}
    </div>
  );
};

export default FindSong;