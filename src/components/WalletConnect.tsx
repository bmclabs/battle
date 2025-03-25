'use client';

import React from 'react';
import Button from './ui/Button';
import { formatWalletAddress, formatSolAmount } from '../utils';

interface User {
  id: string;
  wallet_address: string;
  username: string;
  avatar_url: string;
  created_at: string;
  updated_at: string;
}

interface WalletConnectProps {
  connected: boolean;
  walletAddress: string;
  balance: number;
  connecting: boolean;
  user?: User | null;
  onConnect: () => Promise<void>;
  onDisconnect: () => void;
}

const WalletConnect: React.FC<WalletConnectProps> = ({
  connected,
  walletAddress,
  balance,
  connecting,
  user,
  onConnect,
  onDisconnect
}) => {
  return (
    <div className="flex items-center space-x-4">
      {connected ? (
        <>
          <div className="flex gap-2 bg-black/70 px-4 py-2 border border-primary rounded retro-container">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <span className="text-white text-xs">
                {user?.username ? `${user.username} | ` : ''}{formatWalletAddress(walletAddress)} |
              </span>
            </div>
            <div className="text-secondary text-xs">
             {formatSolAmount(balance)} <span className="text-primary">SOL</span>
            </div>
          </div>
          <Button 
            variant="danger" 
            size="xs" 
            onClick={onDisconnect}
          >
            DISCONNECT
          </Button>
        </>
      ) : (
        <Button
          variant="primary"
          size="xs"
          onClick={onConnect}
          disabled={connecting}
          isLoading={connecting}
          className="pixel-pulse"
        >
          CONNECT WALLET
        </Button>
      )}
    </div>
  );
};

export default WalletConnect; 