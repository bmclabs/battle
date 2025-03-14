'use client';

import React from 'react';
import { formatWalletAddress } from '../utils';

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
      <div className="bg-black border-4 border-primary p-6 rounded-lg pixel-border max-w-md w-full">
        <div className="text-center mb-6">
          <h2 className="text-xl text-white font-bold mb-2">Verify Your Wallet</h2>
          <p className="text-gray-300 text-sm mb-4">
            Please sign the message to authenticate with Battle Memecoin Club
          </p>
          <div className="bg-gray-800 p-3 rounded-md mb-4">
            <p className="text-white text-sm break-all">{challenge}</p>
          </div>
          <p className="text-gray-400 text-xs">
            Wallet: {formatWalletAddress(walletAddress)}
          </p>
        </div>
        
        <div className="flex flex-col gap-3">
          <button
            onClick={onVerify}
            disabled={isLoading}
            className="pixel-button bg-primary hover:bg-primary/80 text-sm disabled:opacity-50"
          >
            {isLoading ? 'VERIFYING...' : 'VERIFY SIGNATURE'}
          </button>
          
          <button
            onClick={onDisconnect}
            disabled={isLoading}
            className="pixel-button bg-red-600 hover:bg-red-700 text-sm disabled:opacity-50"
          >
            DISCONNECT
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignMessageModal; 