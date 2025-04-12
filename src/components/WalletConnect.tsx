'use client';

import React, { useState } from 'react';
import Button from './ui/Button';
import { formatWalletAddress } from '../utils';
import { useWalletAuth } from '@/lib/context/WalletContext';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import ProfileModal from './profile/ProfileModal';
import SolAmount from '@/components/ui/SolAmount';

const WalletConnect: React.FC = () => {
  const { connected, walletAddress, balance, connecting, user, signIn, signOut } = useWalletAuth();
  const { setVisible } = useWalletModal();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const handleConnect = async () => {
    if (!connected) {
      setVisible(true);
    } else if (!user) {
      await signIn();
    }
  };

  const handleWalletAddressClick = () => {
    setIsProfileModalOpen(true);
  };

  return (
    <div className="flex items-center space-x-4">
      {connected ? (
        <>
          <div className="flex gap-2 bg-black/70 px-4 py-2 border border-[#14F195] rounded retro-container cursor-pointer hover:bg-green-500" onClick={handleWalletAddressClick}>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-[#14F195] rounded-full animate-pulse"></div>
              <span 
                className="text-white text-[10px]"
              >
                {user?.username ? `${user.username}` : formatWalletAddress(walletAddress || '')} |
              </span>
            </div>
            <div className="text-secondary text-[10px]">
             {/* Display wallet balance if connected */}
             {connected && (
               <div className="mr-3 hidden md:block">
                 <SolAmount amount={balance} className="text-white" iconSize={20} />
               </div>
             )}
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

      {connected && walletAddress && (
        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          walletAddress={walletAddress}
          username={user?.username}
          balance={balance}
          isOwnProfile={true}
        />
      )}
    </div>
  );
};

export default WalletConnect; 