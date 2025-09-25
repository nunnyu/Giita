import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="bg-dark-900 shadow-lg border-b border-dark-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-dark-50 font-woods">
              {/* <img src={logo} alt="Logo" className="h-10 w-10" /> LOGO HERE */}
            </Link>
          </div>
          <div className="flex items-center space-x-12">
            <Link
              to="/"
              className={`px-12 py-6 rounded-lg text-sm font-medium font-woods transition-all duration-100 ${
                location.pathname === '/'
                  ? 'bg-dark-800 text-dark-50 border border-warm-beige-600'
                  : 'text-dark-200 hover:bg-dark-800 hover:text-dark-50 hover:border-warm-beige-400 border border-transparent'
              }`}
            >
              Home
            </Link>
            <Link
              to="/find-song"
              className={`px-12 py-6 rounded-xl text-sm font-medium font-woods transition-all duration-100 ${
                location.pathname === '/find-song'
                  ? 'bg-dark-800 text-dark-50 border border-warm-beige-600'
                  : 'text-dark-200 hover:bg-dark-800 hover:text-dark-50 hover:border-warm-beige-400 border border-transparent'
              }`}
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