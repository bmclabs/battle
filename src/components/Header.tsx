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
          {/* Logo container with fixed size */}
          <div className="w-64 h-16 relative">
            <Image
              src="/logo/bmc-logo.gif"
              alt="Battle Memecoin Club"
              width={140}
              height={60}
              className="object-contain"
            />
          </div>
        </div>
        
        <WalletConnect />
      </div>
    </header>
  );
};

export default Header; 