import React from 'react';
import { Link } from 'react-router-dom';
import { TreePine } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-green-700 text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <TreePine size={32} className="text-green-300" />
          <span className="text-2xl font-bold">ForestWatch</span>
        </Link>
        
        <nav>
          <ul className="flex space-x-6">
            <li>
              <Link to="/" className="hover:text-green-300 transition-colors">
                Home
              </Link>
            </li>
            <li>
              <Link to="/dashboard" className="hover:text-green-300 transition-colors">
                Dashboard
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;