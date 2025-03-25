'use client';

import React, { useState } from 'react';
import Image from 'next/image';

const HeroSection: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState('');

  return (
    <div className="retro-container w-full max-w-5xl mx-auto p-8 my-8">
      <h1 className="text-white text-4xl text-center mb-6">
        JOIN THE DEGEN ARMY
      </h1>
      
      <p className="text-white text-center mb-8 text-sm">
        Be part of the most exciting memecoin battle club on
        Solana! Join our community and stay updated on new
        fighters, upcoming battles, and exclusive rewards.
      </p>
      
      <div className="grid grid-cols-3 gap-6 mb-8">
        {/* Community Members */}
        <div className="flex flex-col items-center justify-center p-4 border border-primary bg-black/50">
          <p className="retro-stats text-center mb-2">16K+</p>
          <p className="text-white text-center text-xs">
            Community<br />Members
          </p>
        </div>
        
        {/* SOL Bet Volume */}
        <div className="flex flex-col items-center justify-center p-4 border border-primary bg-black/50">
          <p className="retro-stats text-center mb-2">8.5K</p>
          <p className="text-white text-center text-xs">
            SOL Bet<br />Volume
          </p>
        </div>
        
        {/* Daily Battles */}
        <div className="flex flex-col items-center justify-center p-4 border border-primary bg-black/50">
          <p className="retro-stats text-center mb-2">240+</p>
          <p className="text-white text-center text-xs">
            Daily Battles
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-4 mb-6">
        <input
          type="text"
          value={walletAddress}
          onChange={(e) => setWalletAddress(e.target.value)}
          placeholder="Enter your wallet address"
          className="retro-input flex-grow"
        />
        <button className="pixel-button px-4 py-2">
          Submit
        </button>
      </div>
      
      <div className="flex justify-start space-x-4">
        <a 
          href="https://t.me" 
          target="_blank" 
          rel="noopener noreferrer"
          className="retro-icon-btn"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
          </svg>
        </a>
        <a 
          href="https://twitter.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="retro-icon-btn"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
            <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
          </svg>
        </a>
        <a 
          href="https://discord.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="retro-icon-btn"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
            <rect x="2" y="3" width="20" height="18" rx="2" ry="2"></rect>
            <line x1="9" y1="3" x2="9" y2="21"></line>
          </svg>
        </a>
      </div>
      
      <div className="absolute right-4 bottom-4">
        <Image
          src="https://via.placeholder.com/200x200/FF69B4/FFFFFF?text=PEPE"
          alt="Mascot"
          width={120}
          height={120}
          className="pixelated"
        />
      </div>
    </div>
  );
};

export default HeroSection; 