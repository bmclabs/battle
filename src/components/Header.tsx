'use client';

import React from 'react';
import Image from 'next/image';
import WalletConnect from './WalletConnect';

interface User {
  id: string;
  wallet_address: string;
  username: string;
  avatar_url: string;
  created_at: string;
  updated_at: string;
}

interface HeaderProps {
  connected: boolean;
  walletAddress: string;
  balance: number;
  connecting: boolean;
  user?: User | null;
  onConnect: () => Promise<void>;
  onDisconnect: () => void;
}

const Header: React.FC<HeaderProps> = ({
  connected,
  walletAddress,
  balance,
  connecting,
  user,
  onConnect,
  onDisconnect
}) => {
  return (
    <header className="w-full p-4 border-b border-primary bg-black/80">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center h-16 relative">
          {/* Logo container with fixed size */}
          <div className="w-64 h-16 relative">
            <Image
              src="/logo/bmc-logo.gif"
              alt="Battle Memecoin Club"
              width={160}
              height={60}
              className="object-contain"
            />
          </div>
        </div>
        
        <WalletConnect
          connected={connected}
          walletAddress={walletAddress}
          balance={balance}
          connecting={connecting}
          user={user}
          onConnect={onConnect}
          onDisconnect={onDisconnect}
        />
      </div>
    </header>
  );
};

export default Header; 