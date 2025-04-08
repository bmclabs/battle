'use client';

import React from 'react';
import Image from 'next/image';
import WalletConnect from './WalletConnect';

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({
  className
}) => {
  return (
    <header className={`w-full p-4 border-b border-primary bg-black/80 ${className || ''}`}>
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center h-16 relative">
          <div className="w-64 h-16 relative flex items-center">
            <Image
              src="/logo/bmc-logo.gif"
              alt="Battle Memecoin Club"
              width={140}
              height={60}
              className="object-contain"
            />
            <div className="relative">
              <span className="ml-2 px-3 py-1 text-sm font-extrabold text-black bg-[#14F195] rounded-md">
                BETA
              </span>
              <span className="absolute -bottom-2 right-10 w-2 h-2 text-[8px]">v0.1.0</span>
            </div>
          </div>

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
             Documentation
          </a>
        </div>
        </div>
        
        <WalletConnect />
      </div>
    </header>
  );
};

export default Header; 