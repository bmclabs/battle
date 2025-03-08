import React from 'react';
import Image from 'next/image';
import WalletConnect from './WalletConnect';

interface HeaderProps {
  connected: boolean;
  walletAddress: string;
  balance: number;
  connecting: boolean;
  onConnect: () => Promise<void>;
  onDisconnect: () => void;
}

const Header: React.FC<HeaderProps> = ({
  connected,
  walletAddress,
  balance,
  connecting,
  onConnect,
  onDisconnect
}) => {
  return (
    <header className="w-full p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center h-16 relative">
          {/* Logo container with fixed size */}
          <div className="w-64 h-16 relative">
            <Image
              src="/logo/bmc-logo.gif"
              alt="Battle Memecoin Club Logo"
              width={180}
              height={60}
              className="object-contain"
              priority
            />
          </div>
        </div>
        
        <WalletConnect
          connected={connected}
          walletAddress={walletAddress}
          balance={balance}
          connecting={connecting}
          onConnect={onConnect}
          onDisconnect={onDisconnect}
        />
      </div>
    </header>
  );
};

export default Header; 