'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { LAMPORTS_PER_SOL, Connection } from '@solana/web3.js';
import { getChallenge, verifySignature, getCurrentUser, logout, signMessage } from '../services/auth';
import { getBestRpcUrl } from '@/utils/network';

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
          // Use the best available RPC endpoint (prioritizing Helius for mainnet)
          const endpoint = getBestRpcUrl();
          
          // Create a connection to the Solana cluster
          const connection = new Connection(endpoint, 'confirmed');
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
      const storedToken = localStorage.getItem('auth_token');
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
        localStorage.removeItem('auth_token');
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
        localStorage.setItem('auth_token', authToken);
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
        localStorage.removeItem('auth_token');
      }
    }
  };

  // Send transaction function to process bet
  const sendTransaction = async (
    amount: number, 
    betSignature?: string,
    instructions?: {
      programId: string;
      treasuryWallet: string;
    }
  ): Promise<string> => {
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
      
      if (!betSignature || !instructions) {
        throw new Error('Bet signature and instructions are required');
      }
      
      console.log('Creating transaction for bet with signature:', betSignature);
      
      // In a real implementation:
      // 1. Create a transaction using the solana/web3.js library
      // 2. Add instructions to transfer funds using the provided programId and treasuryWallet
      // 3. Sign the transaction with the user's wallet
      // 4. Send the transaction to the Solana network
      // 5. Get the transaction signature for verification
      
      // Example pseudo-code for real implementation:
      /*
      const connection = new Connection(getBestRpcUrl(), 'confirmed');
      
      // Create a transaction
      const transaction = new Transaction();
      
      // Create the treasury wallet public key
      const treasuryWalletPublicKey = new PublicKey(instructions.treasuryWallet);
      
      // Add the instruction to transfer SOL
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: treasuryWalletPublicKey,
          lamports: amount * LAMPORTS_PER_SOL,
        })
      );
      
      // Add custom instruction data with bet details
      // This would include the bet signature and other details
      const programId = new PublicKey(instructions.programId);
      const dataBuffer = Buffer.from(JSON.stringify({
        betSignature,
        amount,
        timestamp: Date.now()
      }));
      
      transaction.add(
        new TransactionInstruction({
          keys: [
            { pubkey: publicKey, isSigner: true, isWritable: true },
            { pubkey: treasuryWalletPublicKey, isSigner: false, isWritable: true },
          ],
          programId,
          data: dataBuffer
        })
      );
      
      // Sign and send the transaction
      const txSignature = await sendTransaction(transaction, connection);
      
      // Wait for confirmation
      await connection.confirmTransaction(txSignature, 'confirmed');
      */
      
      // This is a mock implementation for development
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate a mock transaction signature - in production this would be a real blockchain transaction ID
      const txSignature = 'tx_' + Math.random().toString(36).substring(2, 15);
      
      // Update balance
      setBalance(prevBalance => prevBalance - amount);
      
      console.log('Transaction completed with signature:', txSignature);
      
      return txSignature;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transaction failed');
      console.error('Transaction error:', err);
      throw err;
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
    sendTransaction,
    wallet
  };
}; 