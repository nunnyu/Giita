import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="bg-dark-900 shadow-lg border-b border-dark-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-dark-50 font-woods">
              {/* <img src={logo} alt="Logo" className="h-10 w-10" /> LOGO HERE */}
            </Link>
          </div>
          <div className="flex items-center" style={{ gap: '3rem' }}>
            <Link
              to="/"
              className={`px-12 py-6 text-sm font-medium font-woods transition-all duration-200 ${
                location.pathname === '/'
                  ? 'bg-dark-800 text-dark-50 border border-dark-purple-900'
                  : 'text-dark-200 hover:bg-dark-800 hover:text-dark-50 hover:border-dark-purple-200 border border-transparent'
              }`}
              style={{ borderRadius: '0.5rem' }}
            >
              Home
            </Link>
            <Link
              to="/find-song"
              className={`px-12 py-6 text-sm font-medium font-woods transition-all duration-200 ${
                location.pathname === '/find-song'
                  ? 'bg-dark-800 text-dark-50 border border-dark-purple-300'
                  : 'text-dark-200 hover:bg-dark-800 hover:text-dark-50 hover:border-dark-purple-200 border border-transparent'
              }`}
              style={{ borderRadius: '0.75rem' }}
            >
              Find Song
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;