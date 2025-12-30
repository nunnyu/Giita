import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="bg-dark-980 shadow-lg border-b border-dark-700 m-0">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center h-20">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-xl font-bold text-dark-50">
              {/* <img src={logo} alt="Logo" className="h-10 w-10" /> LOGO HERE */}
            </Link>
            <div className="flex items-center space-x-6">
            <Link
              to="/"
              className={`px-8 py-3 rounded-lg text-sm font-medium border border-dark-700 transition-all duration-100 ${
                location.pathname === '/'
                  ? 'bg-dark-950 text-dark-50'
                  : 'text-dark-200 hover:bg-dark-970 hover:text-dark-50'
              }`}
            > 
              Home
            </Link>
            <Link
              to="/find-song"
              className={`px-8 py-3 rounded-lg text-sm font-medium border border-dark-700 transition-all duration-100 ${
                location.pathname === '/find-song'
                  ? 'bg-dark-950 text-dark-50'
                  : 'text-dark-200 hover:bg-dark-970 hover:text-dark-50'
              }`}
            >
              Find Songs
            </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;