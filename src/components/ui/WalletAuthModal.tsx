'use client';

import React from 'react';
import { useWalletAuth } from '@/lib/context/WalletContext';
import { useWallet } from '@solana/wallet-adapter-react';
import Button from './Button';
import { formatWalletAddress } from '@/utils';

interface WalletAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WalletAuthModal: React.FC<WalletAuthModalProps> = ({ 
  isOpen,
  onClose
}) => {
  const { connected, publicKey, disconnect } = useWallet();
  const { 
    isAuthenticated, 
    signIn, 
    isAuthenticating, 
    hasChallengeReady,
    challengeError,
    retryChallenge,
    isRequestingChallenge
  } = useWalletAuth();

  // Close modal as soon as user is authenticated
  React.useEffect(() => {
    // Add logging to debug authentication state
    console.log("Auth state changed:", { isAuthenticated, connected });
    
    if (isAuthenticated && connected) {
      console.log("Closing modal due to authenticated state");
      onClose();
    }
  }, [isAuthenticated, connected, onClose]);

  // Also check authentication on mount
  React.useEffect(() => {
    if (isAuthenticated) {
      console.log("Initial check: already authenticated, closing modal");
      onClose();
    }
  }, [isAuthenticated, onClose]);

  // Also close modal when authentication completes successfully
  React.useEffect(() => {
    if (!isAuthenticating && isAuthenticated) {
      console.log("Authentication completed successfully, closing modal");
      onClose();
    }
  }, [isAuthenticating, isAuthenticated, onClose]);

  if (!isOpen || !connected) {
    return null;
  }

  // If authenticated, don't render the modal contents
  if (isAuthenticated) {
    return null;
  }

  const handleActionButton = () => {
    if (challengeError) {
      retryChallenge();
    } else {
      signIn();
    }
  };

  const getActionButtonText = () => {
    if (isAuthenticating) {
      return 'Signing...';
    }
    if (isRequestingChallenge) {
      return 'Loading...';
    }
    if (challengeError) {
      return 'Retry';
    }
    return 'Verify Message';
  };

  const handleDisconnect = () => {
    // First close the modal to prevent flicker
    onClose();
    // Then disconnect the wallet
    setTimeout(() => {
      disconnect();
    }, 100);
  };

  // showing different UI based on challenge status
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={(e) => {
        // Only close if clicking the backdrop
        if (e.target === e.currentTarget) {
          console.log("Emergency modal close via backdrop click");
          onClose();
        }
      }}
    >
      <div className="bg-black/90 border-2 border-primary/70 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl shadow-primary/20 retro-container">
        <div className="text-center mb-6 relative">
          <button 
            onClick={onClose}
            className="absolute -top-2 -right-2 text-gray-400 hover:text-white"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h3 className="text-xl font-bold text-white mb-2">Wallet Authentication Required</h3>
          <p className="text-gray-300 text-sm">
            Sign the message with your wallet to verify ownership and continue.
          </p>
        </div>

        <div className="bg-black/80 rounded-lg p-4 mb-6 border border-primary/50">
          <p className="text-gray-400 text-sm mb-2">Connected Wallet</p>
          <p className="text-white font-mono text-base break-all">
            {formatWalletAddress(publicKey?.toString() || '')}
          </p>
        </div>

        {!hasChallengeReady && !challengeError && !isRequestingChallenge && !isAuthenticating && (
          <div className="mb-4 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-primary"></div>
            <span className="ml-2 text-white">Preparing authentication...</span>
          </div>
        )}

        {isAuthenticating && (
          <div className="mb-4 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-primary"></div>
            <span className="ml-2 text-white">Verifying signature...</span>
          </div>
        )}

        {isRequestingChallenge && (
          <div className="mb-4 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-primary"></div>
            <span className="ml-2 text-white">Requesting challenge...</span>
          </div>
        )}

        {challengeError && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-500/50 rounded-lg text-white text-sm">
            <p className="font-bold mb-1">Challenge Request Failed</p>
            <p>Please click &apos;Retry&apos; to request a new authentication challenge.</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Button 
            variant="danger" 
            size="md" 
            onClick={handleDisconnect}
            fullWidth
            disabled={isAuthenticating || isRequestingChallenge}
          >
            DISCONNECT
          </Button>
          <Button 
            variant="primary" 
            size="md" 
            onClick={handleActionButton}
            fullWidth
            disabled={(isAuthenticating || isRequestingChallenge) || (!challengeError && !hasChallengeReady)}
          >
            {getActionButtonText()}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WalletAuthModal; 