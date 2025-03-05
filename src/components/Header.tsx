import React from 'react';
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
    <header className="w-full bg-black border-b-4 border-primary p-4 pixel-border">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-white text-2xl font-bold">
            <span className="text-primary">BATTLE</span>
            <span className="text-secondary">MEMECOIN</span>
            <span className="text-white">CLUB</span>
          </h1>
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