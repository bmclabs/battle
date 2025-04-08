'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

export const MobileBlocker: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Only show on client-side to prevent hydration errors
  if (!isClient) return null;
  
  // If not mobile, don't render anything
  if (!isMobile) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center px-6 text-center">
      <div className="max-w-md">
        <div className="flex justify-center mb-8">
          <Image
            src="/logo/bmc-logo.gif"
            alt="Battle Memecoin Club"
            width={200}
            height={80}
            className="object-contain"
          />
        </div>
        
        <div className="bg-[#14F195]/10 p-6 rounded-lg border border-[#14F195]/30">
          <h1 className="font-pixel text-xl text-[#14F195] mb-6">Desktop Only</h1>
          
          <p className="text-white mb-4">
            Battle Memecoin Club is currently optimized for desktop experience only.
          </p>
          
          <p className="text-white mb-4">
            Please access our platform from a desktop or laptop with a screen size of at least 1024px width for the best experience.
          </p>
          
          <div className="mt-8 flex items-center justify-center">
            <span className="text-[#14F195] font-pixel text-xs">BETA v0.1.0</span>
          </div>
        </div>
        
        <div className="mt-6 flex justify-center space-x-8">
          <a 
            href="https://x.com/battlememecoin" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-[#14F195] text-sm"
          >
            Twitter
          </a>
          <a 
            href="https://discord.gg/Knnvu9zf5x" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-[#14F195] text-sm"
          >
            Discord
          </a>
          <a 
            href="https://whitepaper.battlememecoin.club" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-[#14F195] text-sm"
          >
            Docs
          </a>
        </div>
      </div>
    </div>
  );
};

export default MobileBlocker; 