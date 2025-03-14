'use client';

import { WalletContextState } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';

// Use the browser's TextEncoder if available
const textEncoder = typeof TextEncoder !== 'undefined' ? new TextEncoder() : null;

// API base URL from environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Interface for the challenge response
interface ChallengeResponse {
  challenge: string;
  expiresAt: number;
}

// Interface for the verify response
interface VerifyResponse {
  token: string;
  user: {
    id: string;
    wallet_address: string;
    username: string;
    avatar_url: string;
    created_at: string;
    updated_at: string;
  };
}

// Interface for the user response
interface UserResponse {
  user: {
    id: string;
    wallet_address: string;
    username: string;
    avatar_url: string;
    created_at: string;
    updated_at: string;
  };
}

// Get a challenge for the wallet address
export const getChallenge = async (walletAddress: string): Promise<ChallengeResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/challenge`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ walletAddress }),
  });

  if (!response.ok) {
    throw new Error('Failed to get challenge');
  }

  return response.json();
};

// Verify the signature
export const verifySignature = async (
  walletAddress: string,
  signature: string,
  challenge: string
): Promise<VerifyResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ walletAddress, signature, challenge }),
  });

  if (!response.ok) {
    throw new Error('Failed to verify signature');
  }

  return response.json();
};

// Get the current user
export const getCurrentUser = async (token: string): Promise<UserResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/user`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to get user');
  }

  return response.json();
};

// Logout
export const logout = async (token: string): Promise<{ success: boolean }> => {
  const response = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to logout');
  }

  return response.json();
};

// Sign message with wallet
export const signMessage = async (
  wallet: WalletContextState,
  message: string
): Promise<string> => {
  try {
    if (!wallet.publicKey) throw new Error('Wallet not connected!');
    if (!wallet.signMessage) throw new Error('Wallet does not support message signing!');
    
    if (!textEncoder) {
      throw new Error('TextEncoder is not available in this environment');
    }
    
    // Convert the message string to Uint8Array
    const messageBytes = textEncoder.encode(message);
    
    // Sign the message with the wallet
    const signature = await wallet.signMessage(messageBytes);
    
    // Convert the signature to a base64 string
    return Buffer.from(signature).toString('base64');
  } catch (error) {
    console.error('Error signing message:', error);
    throw error;
  }
}; 