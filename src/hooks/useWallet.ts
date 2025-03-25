'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { LAMPORTS_PER_SOL, Connection, clusterApiUrl } from '@solana/web3.js';
import { getChallenge, verifySignature, getCurrentUser, logout, signMessage } from '../services/auth';

interface User {
  id: string;
  wallet_address: string;
  username: string;
  avatar_url: string;
  created_at: string;
  updated_at: string;
}

export const useWallet = () => {
  const wallet = useSolanaWallet();
  const { publicKey, connected, connecting, disconnect: disconnectWallet } = wallet;
  const { setVisible } = useWalletModal();
  
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [balance, setBalance] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  
  // State for sign message modal
  const [showSignModal, setShowSignModal] = useState<boolean>(false);
  const [challenge, setChallenge] = useState<string>('');

  // Start authentication process
  const startAuthentication = useCallback(async () => {
    try {
      if (!connected || !publicKey) {
        throw new Error('Wallet not connected');
      }
      
      setIsAuthenticating(true);
      const walletAddressStr = publicKey.toString();
      
      // Get challenge from server
      const { challenge: challengeStr } = await getChallenge(walletAddressStr);
      
      // Set challenge and show sign modal
      setChallenge(challengeStr);
      setShowSignModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start authentication');
      console.error(err);
    } finally {
      setIsAuthenticating(false);
    }
  }, [connected, publicKey]);

  // Update wallet address when connected
  useEffect(() => {
    if (connected && publicKey) {
      setWalletAddress(publicKey.toString());
      
      // If wallet is connected but not authenticated, start authentication process
      if (!token && !showSignModal && !isAuthenticating) {
        startAuthentication();
      }
    } else {
      setWalletAddress('');
      setShowSignModal(false);
      setChallenge('');
    }
  }, [connected, publicKey, token, showSignModal, isAuthenticating, startAuthentication]);

  // Fetch balance when connected
  useEffect(() => {
    const fetchBalance = async () => {
      if (connected && publicKey) {
        try {
          // Get network from environment variables
          const networkEnv = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet';
          
          // Create a connection to the Solana cluster
          const connection = new Connection(clusterApiUrl(networkEnv as 'devnet' | 'testnet' | 'mainnet-beta'), 'confirmed');
          const balance = await connection.getBalance(publicKey);
          setBalance(balance / LAMPORTS_PER_SOL);
        } catch (err) {
          console.error('Failed to fetch balance:', err);
          setBalance(0);
        }
      } else {
        setBalance(0);
      }
    };

    fetchBalance();
  }, [connected, publicKey]);

  // Check for existing token in localStorage on mount
  useEffect(() => {
    // Only run on the client side
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('authToken');
      if (storedToken) {
        setToken(storedToken);
        fetchUser(storedToken);
      }
    }
  }, []);

  // Fetch user data with token
  const fetchUser = async (authToken: string) => {
    try {
      const { user } = await getCurrentUser(authToken);
      setUser(user);
    } catch (err) {
      console.error('Failed to fetch user:', err);
      setToken(null);
      setUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
      }
    }
  };

  // Verify signature
  const verifyWalletSignature = async () => {
    try {
      if (!connected || !publicKey || !challenge) {
        throw new Error('Cannot verify: wallet not connected or challenge missing');
      }
      
      setIsAuthenticating(true);
      const walletAddressStr = publicKey.toString();
      
      // Sign the challenge message
      const signature = await signMessage(wallet, challenge);
      
      // Verify signature with server
      const { token: authToken, user: userData } = await verifySignature(
        walletAddressStr,
        signature,
        challenge
      );
      
      // Save token and user data
      setToken(authToken);
      setUser(userData);
      if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', authToken);
      }
      
      // Close sign modal
      setShowSignModal(false);
      setChallenge('');
      
      return { address: walletAddressStr, balance };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify signature');
      console.error(err);
      throw err;
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Connect wallet
  const connect = async () => {
    try {
      setError(null);
      
      // Open wallet modal if not connected
      if (!connected) {
        setVisible(true);
        return;
      }
      
      // If already connected but not authenticated, start authentication
      if (!token) {
        await startAuthentication();
      }
      
      return { address: walletAddress, balance };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
      console.error(err);
      throw err;
    }
  };

  // Disconnect wallet and logout
  const disconnect = async () => {
    try {
      if (token) {
        await logout(token);
      }
    } catch (err) {
      console.error('Error during logout:', err);
    } finally {
      disconnectWallet();
      setToken(null);
      setUser(null);
      setShowSignModal(false);
      setChallenge('');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
      }
    }
  };

  // Send transaction function (simplified)
  const sendTransaction = async (amount: number): Promise<boolean> => {
    try {
      if (!connected || !publicKey) {
        throw new Error('Wallet not connected');
      }
      
      if (!token) {
        throw new Error('Wallet not authenticated');
      }
      
      if (amount > balance) {
        throw new Error('Insufficient balance');
      }
      
      // In a real implementation, you would use the wallet adapter to send a transaction
      // This is just a mock implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update balance
      setBalance(prevBalance => prevBalance - amount);
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transaction failed');
      console.error(err);
      return false;
    }
  };

  return {
    connected,
    walletAddress,
    balance,
    connecting: connecting || isAuthenticating,
    error,
    user,
    token,
    showSignModal,
    challenge,
    connect,
    disconnect,
    verifyWalletSignature,
    sendTransaction
  };
}; 