// API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3080';

export interface BettingHistoryItem {
  id: string;
  matchId: string;
  fighter1Name: string;
  fighter2Name: string;
  fighterName: string;
  amount: number;
  status: string;
  transactionSignature: string;
  claimed: boolean;
  winner: string;
  matchStatus: string;
  betTime: string;
  isWinningBet: boolean;
  prizeShare: number;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BettingHistoryResponse {
  success: boolean;
  data: BettingHistoryItem[];
  pagination: Pagination;
}

export interface UserStats {
  totalBets: number;
  wonBets: number;
  lostBets: number;
  totalEarnings: number;
  winRate: number;
  detailedStats: {
    totalAllBets: number;
    totalCompletedBets: number;
    wonCompletedBets: number;
    lostCompletedBets: number;
    pendingBets: number;
    cancelledBets: number;
    totalEarningsCompleted: number;
    totalBetAmount: number;
    avgPrize: number;
    biggestWin: number;
    matchesParticipated: number;
    completedWinRate: number;
  };
  weeklyStats: {
    week: string;
    wins: number;
    losses: number;
    earnings: number;
    winRate: number;
  }[];
}

export interface UserStatsResponse {
  success: boolean;
  data: UserStats;
}

/**
 * Get betting history for a wallet address
 * @param walletAddress Wallet address to get history for
 * @param page Page number
 * @param limit Number of items per page
 * @returns Betting history data with pagination
 */
export const getUserBettingHistory = async (
  walletAddress: string,
  page: number = 1,
  limit: number = 4
): Promise<BettingHistoryResponse> => {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    throw new Error('Authentication required');
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/v1/profile/${walletAddress}/betting-history?page=${page}&limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      // Check if it's an auth error
      if (response.status === 401) {
        console.error('Authentication failed when fetching betting history');
        localStorage.removeItem('auth_token'); // Clear invalid token
        throw new Error('Your session has expired. Please sign in again.');
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to fetch betting history: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching betting history:', error);
    throw error;
  }
};

/**
 * Get detailed user statistics
 * @param walletAddress The wallet address to get statistics for
 * @returns User statistics data
 */
export const getUserStats = async (walletAddress: string): Promise<UserStatsResponse> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/v1/profile/stats?walletAddress=${walletAddress}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('User not found');
      }
      
      if (response.status === 400) {
        throw new Error('Wallet address is required');
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to fetch user stats: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching user stats:', error);
    throw error;
  }
}; 