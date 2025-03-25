'use client';

import React from 'react';
import { formatWalletAddress } from '../utils';
import Button from './ui/Button';

interface SignMessageModalProps {
  walletAddress: string;
  challenge: string;
  isLoading: boolean;
  onVerify: () => Promise<void>;
  onDisconnect: () => void;
}

const SignMessageModal: React.FC<SignMessageModalProps> = ({
  walletAddress,
  challenge,
  isLoading,
  onVerify,
  onDisconnect
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="bg-black/80 border-2 border-primary p-6 rounded-lg retro-container max-w-md w-full">
        <div className="text-center mb-6">
          <h2 className="text-xl text-white font-bold mb-2">Verify Your Wallet</h2>
          <p className="text-gray-300 text-sm mb-4">
            Please sign the message to authenticate with Battle Memecoin Club
          </p>
          <div className="bg-black/50 p-3 rounded-md mb-4 border border-primary">
            <p className="text-white text-sm break-all">{challenge}</p>
          </div>
          <p className="text-gray-400 text-xs">
            Wallet: {formatWalletAddress(walletAddress)}
          </p>
        </div>
        
        <div className="flex flex-col gap-3">
          <Button
            onClick={onVerify}
            disabled={isLoading}
            isLoading={isLoading}
            variant="primary"
            size="md"
            fullWidth
          >
            VERIFY SIGNATURE
          </Button>
          
          <Button
            onClick={onDisconnect}
            disabled={isLoading}
            variant="danger"
            size="md"
            fullWidth
          >
            DISCONNECT
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SignMessageModal; 