import { useState, useEffect } from 'react';
import { getMatchActiveBets, placeBet, getUserCurrentBet } from '../services/bet';
import { placeBetOnChain } from '../services/anchor';
import { Bet, MatchBettingSummary, GameMode } from '../types';
import { useWalletAuth } from '@/lib/context/WalletContext';
import { useWallet } from '@solana/wallet-adapter-react';
import { getAuthToken, isAuthenticated } from '@/lib/services/auth';
import { TransactionExpiredTimeoutError } from '@solana/web3.js';

// Type for transaction status to be passed to the UI
export type TransactionStatusUpdate = {
  status: 'processing' | 'confirmed' | 'cancelled' | 'already-bet';
  signature?: string;
};

// Map UserBet to Bet type
/* eslint-disable @typescript-eslint/no-explicit-any */
const mapUserBetsToBets = (userBets: any[]): Bet[] => {
  return userBets.map(bet => ({
    id: bet.id,
    matchId: bet.matchId,
    walletAddress: bet.walletAddress || '',
    amount: bet.amount,
    fighterId: bet.fighterName, // Use fighterName as fighterId
    fighterName: bet.fighterName,
    timestamp: bet.timestamp || 0, // Use timestamp from API or 0 as default
    status: bet.status,
    transactionSignature: bet.transactionSignature,
    claimed: bet.claimed
  }));
};

interface UseBettingProps {
  matchId: string;
  gameMode?: GameMode;
}

export const useBetting = ({ matchId, gameMode }: UseBettingProps) => {
  const [matchBets, setMatchBets] = useState<MatchBettingSummary | null>(null);
  const [userBets, setUserBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [placingBet, setPlacingBet] = useState<boolean>(false);
  
  const { user, isAuthenticated: userIsAuthenticated, connected } = useWalletAuth();
  const wallet = useWallet();

  // Load user's current bet when user is authenticated or page refreshes
  useEffect(() => {
    if (!matchId || matchId === '' || !user?.id) {
      // Clear bets when user ID is not available
      setUserBets([]);
      return;
    }

    const loadUserBets = async () => {
      // Make sure user is authenticated and has a token
      const hasToken = isAuthenticated();
      if (!hasToken) {
        setUserBets([]);
        return;
      }

      try {
        console.log('Loading user bets for match:', matchId);
        const userBetsData = await getUserCurrentBet(user.id, matchId, connected);
        setUserBets(mapUserBetsToBets(userBetsData));
      } catch (userBetError) {
        console.error('Failed to load user bets:', userBetError);
        
        // If error is auth-related, clear user bets
        if (userBetError instanceof Error && 
            (userBetError.message.includes('Authentication token is required') || 
             userBetError.message.includes('401'))) {
          setUserBets([]);
        }
      }
    };

    // Load user bets when user is authenticated or connects
    if (userIsAuthenticated && connected) {
      loadUserBets();
    } else {
      // Clear bets when user disconnects
      console.log('User disconnected or not authenticated, clearing user bets');
      setUserBets([]);
    }
  }, [matchId, user?.id, userIsAuthenticated, connected]);

  // Load match active bets - focus on gameMode changes (especially BATTLE)
  useEffect(() => {
    if (!matchId || matchId === '') {
      console.warn('No valid matchId provided for betting');
      return;
    }

    const loadMatchBets = async () => {
      try {
        setLoading(true);
        
        // Get match betting data
        console.log('Loading active bets for match:', matchId);
        const matchBetsData = await getMatchActiveBets(matchId, gameMode);
        setMatchBets(matchBetsData);
        
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load bets';
        setError(errorMessage);
        console.error('Betting data error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadMatchBets();
  }, [matchId, gameMode]);

  // Place a bet - improved flow to avoid WebSocket errors:
  // 1. Only submit transaction to blockchain without waiting for confirmation (avoids WebSocket polling)
  // 2. Save to backend with the transaction signature
  // 3. Backend will verify the transaction status separately
  const submitBet = async (
    walletAddress: string, 
    amount: number, 
    fighterName: string,
    matchAccountPubkey: string,
    onTransactionUpdate?: (update: TransactionStatusUpdate) => void
  ): Promise<Bet> => {
    // Check if user is authenticated and has token
    if (!userIsAuthenticated || !getAuthToken()) {
      throw new Error('You must be authenticated to place a bet');
    }
    
    if (!user?.id) {
      throw new Error('User must be authenticated to place a bet');
    }
    
    if (!matchId) {
      throw new Error('Match ID is required to place a bet');
    }
    
    if (!matchAccountPubkey) {
      throw new Error('Match account public key is required to place a bet');
    }
    
    try {
      setPlacingBet(true);
      setError(null);
      
      // Update UI with processing status
      onTransactionUpdate?.({ status: 'processing' });
      
      // Step 1: Place the bet on-chain (only sends transaction, doesn't wait for confirmation)
      let transactionSignature;
      
      try {
        console.log('Initiating on-chain transaction...');
        transactionSignature = await placeBetOnChain(
          wallet,
          matchId,
          matchAccountPubkey,
          fighterName,
          amount
        );
        console.log('Transaction sent with signature:', transactionSignature);
      } catch (onChainError: any) {
        // Handle specific blockchain-related errors
        if (onChainError.message?.includes('Transaction timed out')) {
          throw new Error(onChainError.message);
        } else if (onChainError.message?.includes('insufficient funds')) {
          throw new Error('You don\'t have enough SOL in your wallet to place this bet');
        } else if (onChainError.message?.includes('already placed a bet') || onChainError.code === 'ALREADY_BET') {
          // Notify UI about AlreadyBet error
          console.log('RPC AlreadyBet error detected in useBetting');
          onTransactionUpdate?.({ status: 'already-bet' });
          // Throw with consistent error message
          throw new Error('You have already placed a bet in this match');
        } else if (onChainError.message?.includes('cancelled by user') || onChainError.message?.includes('User rejected')) {
          // Notify that the transaction was cancelled by the user via callback
          onTransactionUpdate?.({ status: 'cancelled' });
          // Then throw explicit cancellation error to abort the flow
          throw new Error('cancelled by user');
        } else if (onChainError instanceof TransactionExpiredTimeoutError) {
          throw new Error('Transaction timed out. The Solana network may be congested. Please try again later.');
        } else {
          // For other blockchain errors, log details but show a simpler message
          console.error('Blockchain transaction error:', onChainError);
          throw new Error('Failed to complete the transaction. Please try again later.');
        }
      }
      
      if (!transactionSignature) {
        throw new Error('Failed to place bet on-chain');
      }
      
      // Step 2: Save bet to backend without waiting for blockchain confirmation
      // The backend will verify the transaction status
      console.log('Saving bet to backend...');
      let betData;
      
      try {
        betData = await placeBet(
          user.id,
          walletAddress,
          matchId,
          fighterName,
          amount,
          transactionSignature
        );
      } catch (backendError: any) {
        console.error('Backend error when saving bet:', backendError);
        
        // Check for already bet error from backend
        if (backendError.message?.includes('already has a bet') || 
            backendError.message?.includes('already placed a bet') ||
            backendError.message?.includes('AlreadyBet')) {
          onTransactionUpdate?.({ status: 'already-bet' });
          throw new Error('You have already placed a bet in this match');
        }
        
        throw new Error('Failed to record your bet. Please contact support with your transaction ID.');
      }
      
      console.log('Bet saved successfully:', betData);
      
      // Only notify UI about successful bet placement after backend confirms
      onTransactionUpdate?.({ status: 'confirmed', signature: transactionSignature });
      
      // Convert to Bet type and add to local state
      const newBet: Bet = {
        id: betData.betId,
        matchId: betData.matchId,
        walletAddress,
        amount: betData.amount,
        fighterId: betData.fighterName,
        fighterName: betData.fighterName,
        timestamp: Date.now(), 
        status: betData.status,
        transactionSignature: betData.transactionSignature,
        claimed: false
      };
      
      // Update user bets state
      setUserBets(prevBets => [...prevBets, newBet]);
      
      return newBet;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Failed to place bet:', errorMessage);
      
      // If the error is a user cancellation, don't treat as an error
      if (errorMessage.includes('cancelled by user') || errorMessage.includes('User rejected')) {
        console.log('User cancelled the transaction - not treating as error');
      } else {
        // For other errors, set the error state
        setError(errorMessage);
      }
      
      throw err;
    } finally {
      setPlacingBet(false);
    }
  };

  // Check if user has an active bet
  const hasUserActiveBet = (): boolean => {
    return userBets.some(bet => bet.matchId === matchId && bet.status === 'active');
  };

  // Get user's active bet for current match
  const getUserActiveBet = (): Bet | null => {
    return userBets.find(bet => bet.matchId === matchId && bet.status === 'active') || null;
  };

  return {
    matchBets,
    userBets,
    loading,
    error,
    placingBet,
    submitBet,
    hasUserActiveBet,
    getUserActiveBet
  };
}; 