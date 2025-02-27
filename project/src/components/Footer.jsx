import React from 'react';
import { Github, Twitter, Linkedin } from 'lucide-react';

const Footer = ({ densities }) => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">ForestWatch</h3>
            <p className="text-gray-300">
              Monitoring forest health and tree cover changes across India to promote conservation and sustainable practices.
            </p>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-4">Available Densities</h3>
            <div className="flex flex-wrap gap-2">
              {densities.map((density) => (
                <span key={density} className="bg-green-700 px-2 py-1 rounded text-sm">
                  {density}%
                </span>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-4">Connect With Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <Github size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <Linkedin size={20} />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} ForestWatch. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;