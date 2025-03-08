import React from 'react';
import { formatWalletAddress, formatSolAmount } from '../utils';

interface WalletConnectProps {
  connected: boolean;
  walletAddress: string;
  balance: number;
  connecting: boolean;
  onConnect: () => Promise<void>;
  onDisconnect: () => void;
}

const WalletConnect: React.FC<WalletConnectProps> = ({
  connected,
  walletAddress,
  balance,
  connecting,
  onConnect,
  onDisconnect
}) => {
  return (
    <div className="flex items-center space-x-4">
      {connected ? (
        <>
          <div className="flex gap-2 bg-black/70 px-4 py-2 border-2 border-primary rounded-full pixel-border">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-white text-xs">
                {formatWalletAddress(walletAddress)} |
              </span>
            </div>
            <div className="text-[#FEC200] text-xs">
             {formatSolAmount(balance)} <span className="text-[#9945FF]">SOL</span>
            </div>
          </div>
          <button
            onClick={onDisconnect}
            className="pixel-button bg-red-600 hover:bg-red-700 text-xs"
          >
            DISCONNECT
          </button>
        </>
      ) : (
        <button
          onClick={onConnect}
          disabled={connecting}
          className="pixel-button text-xs disabled:opacity-50 pixel-pulse"
        >
          {connecting ? 'CONNECTING...' : 'CONNECT WALLET'}
        </button>
      )}
    </div>
  );
};

export default WalletConnect; 