// API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3080';

export type LeaderboardType = 'earnings' | 'winRate';
export type TimeFrame = 'all' | 'month' | 'week';

export interface LeaderboardUser {
  id: string;
  wallet_address: string;
  username: string | null;
  earnings: number;
  winRate: number;
  wins: number;
  losses: number;
  position: number;
}

export interface LeaderboardResponse {
  leaderboard: LeaderboardUser[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UserPositionResponse {
  currentUser: LeaderboardUser;
  surroundingUsers: LeaderboardUser[];
  total: number;
}

/**
 * Generate dummy leaderboard data
 * @param type Type of leaderboard (earnings or winRate)
 * @param count Number of dummy users to generate
 * @returns Dummy leaderboard data
 */
export const generateDummyLeaderboard = (type: LeaderboardType, count: number = 20): LeaderboardUser[] => {
  const dummyUsers: LeaderboardUser[] = [];
  
  // List of dummy usernames
  const usernames = [
    'CryptoWhale', 'SolanaKing', 'MoonBull', 'RocketTrader', 'DiamondHands',
    'TokenMaster', 'BlockchainWizard', 'NFTCollector', 'SatoshiDreamer', 'DeFiGuru',
    'SOLHunter', 'CoinFlipPro', 'CryptoPunk', 'Web3Explorer', 'RaydiumFarmer',
    'ApeTrader', 'ShibaLover', 'StakedSOL', 'BattleMaster', 'DotComHodler',
    'TokenPump', 'MoonShot', 'LaunchPad', 'FlipperElite', 'AlphaSeeker'
  ];
  
  // Generate dummy wallets
  const randomWallets = Array(count).fill(0).map(() => {
    const walletChars = '0123456789abcdef';
    let wallet = '';
    for (let i = 0; i < 40; i++) {
      wallet += walletChars.charAt(Math.floor(Math.random() * walletChars.length));
    }
    return wallet;
  });
  
  for (let i = 0; i < count; i++) {
    // Random values for each user
    const wins = Math.floor(Math.random() * 150);
    const losses = Math.floor(Math.random() * 100);
    const totalBets = wins + losses;
    
    // Win rate calculated the same way as backend
    const winRate = totalBets > 0 ? Math.min(100, Math.max(0, (wins / totalBets) * 100)) : 0;
    
    // Earnings - higher for top positions
    const baseEarnings = type === 'earnings' 
      ? 100 - (i * 4) + (Math.random() * 20) 
      : 50 + (Math.random() * 50);
    
    dummyUsers.push({
      id: `dummy-user-${i + 1}`,
      wallet_address: `0x${randomWallets[i]}`,
      username: Math.random() > 0.3 ? usernames[i % usernames.length] : null,
      earnings: Number(baseEarnings.toFixed(2)),
      winRate: winRate,
      wins: wins,
      losses: losses,
      position: i + 1
    });
  }
  
  // Sort by earnings or winRate depending on leaderboard type
  if (type === 'earnings') {
    dummyUsers.sort((a, b) => b.earnings - a.earnings);
  } else {
    dummyUsers.sort((a, b) => b.winRate - a.winRate);
  }
  
  // Update positions after sort
  dummyUsers.forEach((user, index) => {
    user.position = index + 1;
  });
  
  return dummyUsers;
};

/**
 * Fetch leaderboard data based on type and timeframe
 * @param type Type of leaderboard (earnings or winRate)
 * @param timeframe Timeframe for the leaderboard (all, month, week)
 * @param page Page number
 * @param limit Number of items per page
 * @returns Leaderboard data
 */
export const getLeaderboard = async (
  type: LeaderboardType = 'earnings',
  timeframe: TimeFrame = 'all',
  page: number = 1,
  limit: number = 10
): Promise<LeaderboardResponse> => {
  // Set to true to use dummy data for development or when API is not available
  const useDummyData = process.env.NEXT_PUBLIC_USE_DUMMY_DATA === 'true' || false;
  
  if (useDummyData) {
    // Generate 20 dummy users
    const allDummyUsers = generateDummyLeaderboard(type, 20);
    
    // Calculate pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = allDummyUsers.slice(startIndex, endIndex);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      leaderboard: paginatedUsers,
      pagination: {
        total: allDummyUsers.length,
        page: page,
        limit: limit,
        totalPages: Math.ceil(allDummyUsers.length / limit)
      }
    };
  }
  
  try {
    const response = await fetch(
      `${API_BASE_URL}/v1/profile/leaderboard?type=${type}&timeframe=${timeframe}&page=${page}&limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch leaderboard: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    
    // Fallback to dummy data if API fails
    console.log('Falling back to dummy data due to API error');
    const allDummyUsers = generateDummyLeaderboard(type, 20);
    
    // Calculate pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = allDummyUsers.slice(startIndex, endIndex);
    
    return {
      leaderboard: paginatedUsers,
      pagination: {
        total: allDummyUsers.length,
        page: page,
        limit: limit,
        totalPages: Math.ceil(allDummyUsers.length / limit)
      }
    };
  }
};

/**
 * Get current user's position in the leaderboard with surrounding users
 * @param type Type of leaderboard (earnings or winRate)
 * @param timeframe Timeframe for the leaderboard (all, month, week)
 * @returns Current user's position with surrounding users
 */
export const getCurrentUserPosition = async (
  type: LeaderboardType = 'earnings',
  timeframe: TimeFrame = 'all'
): Promise<UserPositionResponse> => {
  // Set to true to use dummy data for development or when API is not available
  const useDummyData = process.env.NEXT_PUBLIC_USE_DUMMY_DATA === 'true' || false;
  
  if (useDummyData) {
    // Generate dummy leaderboard data
    const allDummyUsers = generateDummyLeaderboard(type, 20);
    
    // Create a dummy current user (position 8 for example)
    const userPosition = 8;
    const currentUser = {
      id: 'current-user',
      wallet_address: '0x1234567890abcdef1234567890abcdef12345678',
      username: 'You',
      earnings: 55.75,
      winRate: 62.5,
      wins: 50,
      losses: 30,
      position: userPosition
    };
    
    // Get surrounding users (2 above and 2 below)
    const startIndex = Math.max(0, userPosition - 3);
    const endIndex = Math.min(allDummyUsers.length, userPosition + 2);
    const surroundingUsers = allDummyUsers.slice(startIndex, endIndex);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      currentUser,
      surroundingUsers,
      total: allDummyUsers.length
    };
  }
  
  const token = localStorage.getItem('auth_token');
  if (!token) {
    throw new Error('Authentication required');
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/v1/profile/leaderboard/position?type=${type}&timeframe=${timeframe}`,
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
        console.error('Authentication failed when fetching user position');
        localStorage.removeItem('auth_token'); // Clear invalid token
        throw new Error('Your session has expired. Please sign in again.');
      }
      
      throw new Error(`Failed to fetch user position: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching user leaderboard position:', error);
    
    // Fallback to dummy data if API fails
    const allDummyUsers = generateDummyLeaderboard(type, 20);
    
    // Create a dummy current user (position 8 for example)
    const userPosition = 8;
    const currentUser = {
      id: 'current-user',
      wallet_address: '0x1234567890abcdef1234567890abcdef12345678',
      username: 'You',
      earnings: 55.75,
      winRate: 62.5,
      wins: 50,
      losses: 30,
      position: userPosition
    };
    
    // Get surrounding users (2 above and 2 below)
    const startIndex = Math.max(0, userPosition - 3);
    const endIndex = Math.min(allDummyUsers.length, userPosition + 2);
    const surroundingUsers = allDummyUsers.slice(startIndex, endIndex);
    
    return {
      currentUser,
      surroundingUsers,
      total: allDummyUsers.length
    };
  }
}; 