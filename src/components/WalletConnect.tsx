'use client';

import React from 'react';
import Button from './ui/Button';
import { formatWalletAddress, formatSolAmount } from '../utils';
import { useWalletAuth } from '@/lib/context/WalletContext';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';

const WalletConnect: React.FC = () => {
  const { connected, walletAddress, balance, connecting, user, signIn, signOut } = useWalletAuth();
  const { setVisible } = useWalletModal();

  const handleConnect = async () => {
    if (!connected) {
      setVisible(true);
    } else if (!user) {
      await signIn();
    }
  };

  return (
    <div className="flex items-center space-x-4">
      {connected ? (
        <>
          <div className="flex gap-2 bg-black/70 px-4 py-2 border border-primary rounded retro-container">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <span className="text-white text-[10px]">
                {user?.username ? `${user.username} | ` : ''}{formatWalletAddress(walletAddress || '')} |
              </span>
            </div>
            <div className="text-secondary text-[10px]">
             {formatSolAmount(balance)} <span className="text-primary">SOL</span>
            </div>
          </div>
          <Button 
            variant="danger" 
            size="sm" 
            onClick={signOut}
          >
            DISCONNECT
          </Button>
        </>
      ) : (
        <Button
          variant="primary"
          size="sm"
          onClick={handleConnect}
          disabled={connecting}
          isLoading={connecting}
        >
          CONNECT WALLET
        </Button>
      )}
    </div>
  );
};

export default WalletConnect; 