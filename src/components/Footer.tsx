import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-black/80 border-t border-primary p-4 mt-8">
      <div className="container mx-auto text-center">
        <div className="flex justify-center space-x-8 mb-2">
          <a 
            href="https://x.com/battlememecoin" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-[#14F195] text-xs"
          >
            Twitter
          </a>
          <a 
            href="https://discord.gg/Knnvu9zf5x" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-[#14F195] text-xs"
          >
            Discord
          </a>
          <a 
            href="https://whitepaper.battlememecoin.club" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-[#14F195] text-xs"
          >
            Whitepaper
          </a>
        </div>
        <p className="text-white text-[8px]">
          © {new Date().getFullYear()} Battle Memecoin Club - All rights reserved
        </p>
      </div>
    </footer>
  );
};

export default Footer; 