import { useState, useEffect } from 'react';
import { getMatchActiveBets, placeBet, getUserCurrentBet } from '../services/bet';
import { placeBetOnChain } from '../services/anchor';
import { subscribeToNewBets } from '../services/socket';
import { useWallet } from './useWallet';
import { Bet, BetSignature, MatchBettingSummary } from '../types';
import { WalletContextState } from '@solana/wallet-adapter-react';

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

export const useBetting = (matchId: string) => {
  const [matchBets, setMatchBets] = useState<MatchBettingSummary | null>(null);
  const [userBets, setUserBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [placingBet, setPlacingBet] = useState<boolean>(false);
  const { user } = useWallet();

  // Load active bets for the match
  useEffect(() => {
    if (!matchId || matchId === '') {
      console.warn('No valid matchId provided for betting');
      setLoading(false);
      return;
    }

    const loadBets = async () => {
      try {
        setLoading(true);
        
        // Get match betting data
        const matchBetsData = await getMatchActiveBets(matchId);
        setMatchBets(matchBetsData);
        
        // If user is authenticated, load their bets
        if (user?.id) {
          try {
            const userBetsData = await getUserCurrentBet(user.id, matchId);
            setUserBets(mapUserBetsToBets(userBetsData));
          } catch (userBetError) {
            console.error('Failed to load user bets:', userBetError);
            // Don't set main error, just log it
          }
        }
        
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load bets';
        setError(errorMessage);
        console.error('Betting data error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadBets();
  }, [matchId, user?.id, user?.wallet_address]);

  // Place a bet - new flow: on-chain transaction first, then save to backend
  const submitBet = async (
    walletAddress: string, 
    amount: number, 
    fighterName: string,
    wallet: WalletContextState,
    matchAccountPubkey: string
  ): Promise<Bet> => {
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