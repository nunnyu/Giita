import React from 'react';

interface NavbarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, onPageChange }) => {
  return (
    <nav className="bg-dark-900 shadow-lg border-b border-dark-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* <img src={logo} alt="Logo" className="h-10 w-10" /> LOGO HERE */}
          </div>
          <div className="flex items-center space-x-8">
            <button
              onClick={() => onPageChange('home')}
              className={`px-4 py-2 rounded-lg text-sm font-medium font-woods transition-all duration-200 ${
                currentPage === 'home'
                  ? 'bg-dark-800 text-dark-50 border border-dark-purple-500'
                  : 'text-dark-200 hover:bg-dark-800 hover:text-dark-50 hover:border-dark-purple-400 border border-transparent'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => onPageChange('find-song')}
              className={`px-4 py-2 rounded-lg text-sm font-medium font-woods transition-all duration-200 ${
                currentPage === 'find-song'
                  ? 'bg-dark-800 text-dark-50 border border-dark-purple-500'
                  : 'text-dark-200 hover:bg-dark-800 hover:text-dark-50 hover:border-dark-purple-400 border border-transparent'
              }`}
            >
              Find Song
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
