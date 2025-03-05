import { useState, useEffect } from 'react';
import { fetchBets, placeBet } from '../services/api';
import { subscribeToNewBets } from '../services/socket';
import { Bet } from '../types';

export const useBetting = () => {
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [placingBet, setPlacingBet] = useState<boolean>(false);

  useEffect(() => {
    const loadBets = async () => {
      try {
        setLoading(true);
        const betsData = await fetchBets();
        setBets(betsData);
        setError(null);
      } catch (err) {
        setError('Failed to load bets');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadBets();

    // Subscribe to new bets
    subscribeToNewBets((newBet) => {
      setBets((prevBets) => [...prevBets, newBet]);
    });

    return () => {
      // Cleanup would happen here if needed
    };
  }, []);

  const submitBet = async (walletAddress: string, amount: number, fighterId: string) => {
    try {
      setPlacingBet(true);
      setError(null);
      const newBet = await placeBet(walletAddress, amount, fighterId);
      setBets((prevBets) => [...prevBets, newBet]);
      return newBet;
    } catch (err) {
      setError('Failed to place bet');
      console.error(err);
      throw err;
    } finally {
      setPlacingBet(false);
    }
  };

  // Calculate total bets for each fighter
  const getTotalBets = (fighterId: string) => {
    return bets
      .filter((bet) => bet.fighterId === fighterId)
      .reduce((total, bet) => total + bet.amount, 0);
  };

  // Get bets for a specific fighter
  const getBetsForFighter = (fighterId: string) => {
    return bets.filter((bet) => bet.fighterId === fighterId);
  };

  return {
    bets,
    loading,
    error,
    placingBet,
    submitBet,
    getTotalBets,
    getBetsForFighter
  };
}; 