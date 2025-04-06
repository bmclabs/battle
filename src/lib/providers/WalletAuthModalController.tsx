'use client';

import React, { useState, useEffect } from 'react';
import { useWalletAuth } from '@/lib/context/WalletContext';
import WalletAuthModal from '@/components/ui/WalletAuthModal';

// use flag from outside to prevent modal flicker when disconnected
let preventModalFlickerOnDisconnect = false;

export const WalletAuthModalController: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { connected, isAuthenticated, isDisconnecting } = useWalletAuth();

  // Determine when the modal should be open
  useEffect(() => {
    // If in the process of disconnecting, do not show modal
    if (preventModalFlickerOnDisconnect || isDisconnecting) {
      return;
    }

    // Show modal when wallet is connected but not authenticated
    if (connected && !isAuthenticated) {
      setIsModalOpen(true);
    } else {
      setIsModalOpen(false);
    }
  }, [connected, isAuthenticated, isDisconnecting]);

  // Prevent modal flicker by detecting transitions from connected to disconnected
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    // When the connected status changes from true to false
    if (!connected && !isModalOpen) {
      // Set flag to prevent flicker
      preventModalFlickerOnDisconnect = true;
      
      // Reset flag after 1 second
      timer = setTimeout(() => {
        preventModalFlickerOnDisconnect = false;
      }, 1000);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [connected, isModalOpen]);

  const handleCloseModal = () => {
    // Only allow closing if user is authenticated
    if (isAuthenticated) {
      setIsModalOpen(false);
    }
  };

  return (
    <WalletAuthModal 
      isOpen={isModalOpen} 
      onClose={handleCloseModal} 
    />
  );
};

export default WalletAuthModalController; 