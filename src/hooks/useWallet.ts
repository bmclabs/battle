import { useState, useEffect } from 'react';

// This is a simplified mock wallet hook for development
// In a real implementation, you would use @solana/wallet-adapter-react
export const useWallet = () => {
  const [connected, setConnected] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [balance, setBalance] = useState<number>(0);
  const [connecting, setConnecting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Mock connect function
  const connect = async () => {
    try {
      setConnecting(true);
      setError(null);
      
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful connection
      const mockAddress = '8xJUNEBuJR5dNuEtRPMJD5iBjKRtQGP5Bz7LWGEh2eQ1';
      const mockBalance = 10.5;
      
      setWalletAddress(mockAddress);
      setBalance(mockBalance);
      setConnected(true);
      
      return { address: mockAddress, balance: mockBalance };
    } catch (err) {
      setError('Failed to connect wallet');
      console.error(err);
      throw err;
    } finally {
      setConnecting(false);
    }
  };

  // Mock disconnect function
  const disconnect = () => {
    setWalletAddress('');
    setBalance(0);
    setConnected(false);
  };

  // Mock send transaction function
  const sendTransaction = async (amount: number): Promise<boolean> => {
    try {
      if (!connected) {
        throw new Error('Wallet not connected');
      }
      
      if (amount > balance) {
        throw new Error('Insufficient balance');
      }
      
      // Simulate transaction delay
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
    connecting,
    error,
    connect,
    disconnect,
    sendTransaction
  };
}; 