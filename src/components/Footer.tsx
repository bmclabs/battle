import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-black/80 border-t border-primary p-4 mt-8">
      <div className="container mx-auto text-center">
        <p className="text-white text-xs">
          © {new Date().getFullYear()} Battle Memecoin Club - All rights reserved
        </p>
        <div className="flex justify-center space-x-4 mt-2">
          <a 
            href="https://twitter.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-primary text-xs pixel-pulse"
          >
            Twitter
          </a>
          <a 
            href="https://discord.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-primary text-xs pixel-pulse"
          >
            Discord
          </a>
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-primary text-xs pixel-pulse"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 