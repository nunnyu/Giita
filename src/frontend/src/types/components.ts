// Component prop types
export interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
}

// Common UI types
export type ButtonVariant = 'primary' | 'secondary' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

// Form types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number';
  required?: boolean;
  placeholder?: string;
}

// Spotify track type
export interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { 
    name: string;
    images?: { url: string; height?: number; width?: number }[];
  };
}

// Spotify search results type
export interface SpotifySearchResults {
  tracks: {
    items: SpotifyTrack[];
  };
}