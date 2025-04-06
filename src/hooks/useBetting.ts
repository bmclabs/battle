import { useState, useEffect } from 'react';
import { getMatchActiveBets, placeBet, getUserCurrentBet } from '../services/bet';
import { placeBetOnChain } from '../services/anchor';
import { Bet, BetSignature, MatchBettingSummary, GameMode } from '../types';
import { useWalletAuth } from '@/lib/context/WalletContext';
import { useWallet } from '@solana/wallet-adapter-react';
import { getAuthToken, isAuthenticated } from '@/lib/services/auth';

// Map UserBet to Bet type
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

  // Place a bet - new flow: on-chain transaction first, then save to backend
  const submitBet = async (
    walletAddress: string, 
    amount: number, 
    fighterName: string,
    matchAccountPubkey: string
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
      
      // Step 1: Place bet on-chain using Anchor program
      console.log(`Placing bet on-chain for fighter ${fighterName} with amount ${amount} SOL`);
      const transactionSignature = await placeBetOnChain(
        wallet,
        matchId,
        matchAccountPubkey,
        fighterName,
        amount
      );
      
      if (!transactionSignature) {
        throw new Error('Failed to place bet on-chain');
      }
      
      console.log(`On-chain transaction completed: ${transactionSignature}`);
      
      // Step 2: Save bet to backend
      console.log('Saving bet to backend...');
      const betData = await placeBet(
        user.id,
        walletAddress,
        matchId,
        fighterName,
        amount,
        transactionSignature
      );
      
      console.log('Bet saved successfully:', betData);
      
      // Convert to Bet type and add to local state
      const newBet: Bet = {
        id: betData.betId,
        matchId: betData.matchId,
        walletAddress,
        amount: betData.amount,
        fighterId: betData.fighterName,
        fighterName: betData.fighterName,
        timestamp: 0, // Use consistent default value
        status: betData.status,
        transactionSignature: betData.transactionSignature,
        claimed: false
      };
      
      // Update user bets state
      setUserBets(prevBets => [...prevBets, newBet]);
      
      return newBet;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to place bet';
      setError(errorMessage);
      console.error('Bet submission error:', err);
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