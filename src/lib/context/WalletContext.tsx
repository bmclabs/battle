'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback, ReactNode } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import bs58 from 'bs58';
import { 
  requestChallenge, 
  verifySignature, 
  saveAuthToken, 
  removeAuthToken,
  isAuthenticated as checkAuthentication,
  getUser
} from '../services/auth';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useToast } from '../providers/ToastProvider';
import { rpcService } from '../services/rpcService';

interface User {
  id: string;
  wallet_address: string;
  username: string;
  avatar_url: string;
  created_at: string;
  updated_at: string;
}

interface WalletAuthContextType {
  connecting: boolean;
  connected: boolean;
  walletAddress: string | null;
  isAuthenticated: boolean;
  user: User | null;
  isAuthenticating: boolean;
  authError: string | null;
  balance: number;
  signIn: () => Promise<void>;
  signOut: () => void;
  refreshUser: () => Promise<void>;
  hasChallengeReady: boolean;
  challengeError: boolean;
  retryChallenge: () => Promise<void>;
  isRequestingChallenge: boolean;
  isDisconnecting: boolean;
}

// Create default context values
const defaultContextValues: WalletAuthContextType = {
  connecting: false,
  connected: false,
  walletAddress: null,
  isAuthenticated: false,
  user: null,
  isAuthenticating: false,
  authError: null,
  balance: 0,
  signIn: async () => {},
  signOut: () => {},
  refreshUser: async () => {},
  hasChallengeReady: false,
  challengeError: false,
  retryChallenge: async () => {},
  isRequestingChallenge: false,
  isDisconnecting: false,
};

const WalletAuthContext = createContext<WalletAuthContextType>(defaultContextValues);

export const WalletAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Check if we're on the client
  const isClient = typeof window !== 'undefined';
  
  // Setup toast provider
  const { showToast } = useToast();

  const { 
    connected, 
    connecting, 
    publicKey, 
    signMessage, 
    disconnect: disconnectWallet
  } = useWallet();

  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [currentChallenge, setCurrentChallenge] = useState<string | null>(null);
  const [isRequestingChallenge, setIsRequestingChallenge] = useState(false);
  const [challengeError, setChallengeError] = useState(false);
  const [previousWalletAddress, setPreviousWalletAddress] = useState<string | null>(null);
  const [authStatus, setAuthStatus] = useState<boolean>(isClient ? checkAuthentication() : false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [balance, setBalance] = useState<number>(0);
  
  const walletAddress = useMemo(() => 
    publicKey ? publicKey.toString() : null, 
    [publicKey]
  );

  // Only check authentication on client-side
  const isAuthenticated = useMemo(() => 
    authStatus, 
    [authStatus]
  );

  const hasChallengeReady = useMemo(() => 
    !!currentChallenge, 
    [currentChallenge]
  );

  // Sign out and disconnect wallet
  const signOut = useCallback(() => {
    // Set flag to indicate we're in disconnecting process
    setIsDisconnecting(true);
    
    // Remove auth token from storage
    removeAuthToken();
    
    // Update auth status
    setAuthStatus(false);
    
    // Reset all auth-related state
    setUser(null);
    setCurrentChallenge(null);
    setAuthError(null);
    setChallengeError(false);
    
    // Then disconnect the wallet after a short delay to avoid race conditions
    setTimeout(() => {
      disconnectWallet();
      // Reset the disconnecting flag after a timeout to handle edge cases
      setTimeout(() => {
        setIsDisconnecting(false);
      }, 1000);
    }, 100);
  }, [disconnectWallet]);

  // Request challenge function that can be called for initial and retry attempts
  const fetchChallenge = useCallback(async () => {
    // Skip fetching challenge if we're in the process of disconnecting
    if (!isClient || !connected || !walletAddress || isAuthenticated || isRequestingChallenge || isDisconnecting) {
      return;
    }

    try {
      setIsRequestingChallenge(true);
      setChallengeError(false);
      setAuthError(null);
      
      const response = await requestChallenge(walletAddress);
      setCurrentChallenge(response.challenge);
    } catch (error: unknown) {
      console.error('Error requesting challenge:', error);
      setChallengeError(true);
      setAuthError(error instanceof Error ? error.message : 'Failed to request challenge');
      showToast('Failed to request authentication challenge. Please try again.', 'error');
    } finally {
      setIsRequestingChallenge(false);
    }
  }, [isClient, connected, walletAddress, isAuthenticated, isRequestingChallenge, showToast, isDisconnecting]);

  // Forward declaration of refreshUser function to use in effects
  const refreshUser = useCallback(async () => {
    if (!isClient || !isAuthenticated) return;

    try {
      const userData = await getUser();
      if (userData) {
        setUser(userData);
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
      // if token is invalid, sign out
      if (error instanceof Error && error.message.includes('401')) {
        signOut();
      }
    }
  }, [isClient, isAuthenticated, signOut]);

  // Public function to retry getting challenge
  const retryChallenge = async () => {
    // Clear previous errors and challenge before retrying
    setCurrentChallenge(null);
    await fetchChallenge();
  };

  // Handle wallet connection changes
  useEffect(() => {
    // If we're disconnecting, don't run any connect logic
    if (isDisconnecting) return;

    // If wallet connected and address changed (wallet switch)
    if (connected && walletAddress && previousWalletAddress !== walletAddress) {
      // Update the previous wallet address
      setPreviousWalletAddress(walletAddress);
      
      // Only fetch a challenge if not authenticated
      if (!isAuthenticated && !currentChallenge && !isRequestingChallenge) {
        fetchChallenge();
      }
    }
    
    // If wallet disconnected
    if (!connected && previousWalletAddress) {
      // Reset previous wallet address
      setPreviousWalletAddress(null);
    }
  }, [connected, walletAddress, isAuthenticated, currentChallenge, isRequestingChallenge, fetchChallenge, previousWalletAddress, isDisconnecting]);

  // Reset state when wallet disconnects - use separate effect to avoid race conditions
  useEffect(() => {
    if (!connected) {
      setCurrentChallenge(null);
      setAuthError(null);
      setChallengeError(false);
    }
  }, [connected]);

  // Fetch wallet balance when connected
  useEffect(() => {
    const fetchBalance = async () => {
      if (connected && publicKey) {
        try {
          // Use rpcService instead of creating a direct connection
          const balanceInLamports = await rpcService.getBalance(publicKey);
          setBalance(balanceInLamports / LAMPORTS_PER_SOL);
        } catch (err) {
          console.error('Failed to fetch balance:', err);
          setBalance(0);
        }
      } else {
        setBalance(0);
      }
    };

    fetchBalance();
    
    // Set up interval to refresh balance every 30 seconds
    const balanceInterval = setInterval(fetchBalance, 30000);
    
    return () => clearInterval(balanceInterval);
  }, [connected, publicKey]);

  // Handle initial authentication check 
  useEffect(() => {
    // This effect only runs on client-side and skips if disconnecting
    if (!isClient || isDisconnecting) return;

    const checkAuth = async () => {
      if (isAuthenticated && connected && walletAddress && !user) {
        await refreshUser();
      }
    };

    checkAuth();
  }, [connected, walletAddress, isAuthenticated, isClient, user, signOut, isDisconnecting, refreshUser]);

  // Sync authStatus with localStorage
  useEffect(() => {
    if (isClient) {
      const checkStorageAuth = () => {
        const isAuth = checkAuthentication();
        if (isAuth !== authStatus) {
          console.log("Auth status changed from storage check:", isAuth);
          setAuthStatus(isAuth);
        }
      };

      // Check on mount
      checkStorageAuth();

      // Setup storage event listener to detect changes from other tabs
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'auth_token') {
          checkStorageAuth();
        }
      };

      window.addEventListener('storage', handleStorageChange);
      return () => {
        window.removeEventListener('storage', handleStorageChange);
      };
    }
  }, [isClient, authStatus]);

  // Sign in with the connected wallet
  const signIn = async () => {
    if (!isClient || !connected || !publicKey || !signMessage) {
      setAuthError('Wallet not connected');
      return;
    }

    try {
      // if already authenticating, don't start new process
      if (isAuthenticating) {
        return;
      }
      
      setIsAuthenticating(true);
      setAuthError(null);

      // make sure challenge is available
      if (!currentChallenge) {
        throw new Error('No challenge available. Please try reconnecting your wallet.');
      }
      
      // Sign challenge with wallet
      const encodedMessage = new TextEncoder().encode(currentChallenge);
      let signatureBytes;
      try {
        signatureBytes = await signMessage(encodedMessage);
      } catch (signError) {
        // Handle user cancellation gracefully
        console.log('User cancelled signing:', signError);
        setAuthError('Signing cancelled by user. Please try again.');
        // Keep the challenge so user can try again
        setIsAuthenticating(false);
        showToast('Signing cancelled by user. Please try again to authenticate.', 'warning');
        return;
      }
      
      const signature = bs58.encode(signatureBytes);
      
      // Verify signature
      const { token, user: userData } = await verifySignature(
        publicKey.toString(),
        signature,
        currentChallenge
      );
      
      // Save token and user data
      saveAuthToken(token);
      setUser(userData);
      
      // Update auth status immediately
      setAuthStatus(true);
      
      // clear challenge after successful sign in
      setCurrentChallenge(null);
      setChallengeError(false);
      
      // Add debugging log
      console.log("Authentication successful, token saved");
      
      // Ensure isAuthenticating is set to false BEFORE showing toast
      setIsAuthenticating(false);
      
      // This will trigger the useEffect in the modal that checks for isAuthenticated
      // Wait a moment to ensure state updates have propagated
      setTimeout(() => {
        showToast('Authentication successful!', 'success');
      }, 100);
      
    } catch (error) {
      console.error('Authentication error:', error);
      setAuthError(error instanceof Error ? error.message : 'Authentication failed');
      // If error is about user rejection, we've already handled it above
      // For other errors, reset challenge to get a new one
      if (!(error instanceof Error) || 
          (!error.message.includes('User rejected') && 
           !error.message.includes('cancelled'))) {
        setCurrentChallenge(null);
        showToast('Authentication failed. Please try again.', 'error');
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  const contextValue = {
    connecting,
    connected,
    walletAddress,
    isAuthenticated,
    user,
    isAuthenticating,
    authError,
    balance,
    signIn,
    signOut,
    refreshUser,
    hasChallengeReady,
    challengeError,
    retryChallenge,
    isRequestingChallenge,
    isDisconnecting,
  };

  return (
    <WalletAuthContext.Provider value={contextValue}>
      {children}
    </WalletAuthContext.Provider>
  );
};

export const useWalletAuth = () => useContext(WalletAuthContext);

export default WalletAuthContext; 