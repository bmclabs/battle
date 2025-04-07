import { MatchBettingSummary, GameMode } from '../types';

// API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3080';

// Response types based on API documentation
interface PlaceBetResponse {
  success: boolean;
  betId: string;
  matchId: string;
  fighterName: string;
  amount: number;
  status: string;
  transactionSignature: string;
}

interface UserBet {
  id: string;
  matchId: string;
  fighterName: string;
  amount: number;
  status: string;
  transactionSignature: string;
  claimed: boolean;
  match: {
    fighter1: string;
    fighter2: string;
    status: string;
    winner: string;
  };
}

/**
 * Save a bet after it has been placed on-chain
 * 
 * This function is called after a successful on-chain transaction
 * to save the bet information in the backend.
 */
export const placeBet = async (
  userId: string,
  walletAddress: string,
  matchId: string,
  fighterName: string,
  amount: number,
  transactionSignature: string
): Promise<PlaceBetResponse> => {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    console.error('Cannot place bet: No authentication token found');
    throw new Error('Authentication required. Please connect your wallet and sign in to place a bet.');
  }
  
  try {
    console.log(`Saving bet with transaction signature: ${transactionSignature}`);
    
    const response = await fetch(`${API_BASE_URL}/v1/betting/place-bet`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        userId,
        walletAddress,
        matchId,
        fighterName,
        amount,
        transactionSignature
      }),
    });
    
    if (!response.ok) {
      // Check if it's an auth error
      if (response.status === 401) {
        console.error('Authentication failed when placing bet: Token expired or invalid');
        localStorage.removeItem('auth_token'); // Clear invalid token
        throw new Error('Your session has expired. Please sign in again to place a bet.');
      }
      
      const errorData = await response.json().catch(() => ({}));
      console.error('Place bet error:', errorData);
      throw new Error(errorData.error || 'Failed to save bet');
    }
    
    const data = await response.json();
    console.log('Bet saved successfully:', data);
    
    return data;
  } catch (error) {
    console.error('Error saving bet:', error);
    throw error;
  }
};

/**
 * Get current bet for a user
 */
export const getUserCurrentBet = async (userId: string, matchId: string, isConnected: boolean = false): Promise<UserBet[]> => {
  if (!userId || !matchId) {
    throw new Error('User ID and match ID are required');
  }

  if (!isConnected) {
    console.warn('User is not connected. Cannot fetch current bet.');
    return []; // Return empty array if user is not connected
  }

  const token = localStorage.getItem('auth_token');
  if (!token) {
    console.warn('No authentication token found when fetching user bet');
    return []; // Return empty array instead of throwing
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/v1/betting/users/${userId}/matches/${matchId}/current-bet`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      // Check if it's an auth error
      if (response.status === 401) {
        console.warn('Authentication token expired or invalid');
        localStorage.removeItem('auth_token'); // Clear invalid token
        return []; // Return empty array for auth errors
      }
      
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error:', errorData);
      throw new Error(errorData.message || `Failed to fetch user bets: ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching user bets:', error);
    throw error;
  }
};

/**
 * Get betting summary for a match
 */
export const getMatchActiveBets = async (matchId: string, gameMode?: GameMode): Promise<MatchBettingSummary> => {
  if (gameMode !== undefined && gameMode !== GameMode.BATTLE) {
    console.warn('Active bets can only be fetched in BATTLE mode');
    return {
      matchId: matchId,
      fighters: {},
      userBets: [],
      totalBets: 0,
      totalAmount: "0"
    };
  }
  
  const response = await fetch(`${API_BASE_URL}/v1/betting/matches/${matchId}/active-bets`);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch match bets');
  }
  
  return response.json();
};
