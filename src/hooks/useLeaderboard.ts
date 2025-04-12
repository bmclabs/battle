import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  getLeaderboard, 
  getCurrentUserPosition, 
  LeaderboardType, 
  TimeFrame, 
  LeaderboardUser, 
  LeaderboardResponse, 
  UserPositionResponse 
} from '@/services/leaderboard';
import { useWalletAuth } from '@/lib/context/WalletContext';

interface UseLeaderboardOptions {
  initialType?: LeaderboardType;
  initialTimeFrame?: TimeFrame;
}

export const useLeaderboard = ({
  initialType = 'earnings',
  initialTimeFrame = 'all'
}: UseLeaderboardOptions = {}) => {
  const [leaderboardType, setLeaderboardType] = useState<LeaderboardType>(initialType);
  const [timeFrame, setTimeFrame] = useState<TimeFrame>(initialTimeFrame);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
  const [userPosition, setUserPosition] = useState<LeaderboardUser | null>(null);
  const [surroundingUsers, setSurroundingUsers] = useState<LeaderboardUser[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { connected, isAuthenticated } = useWalletAuth();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  const leaderboardCacheRef = useRef<Map<string, { data: LeaderboardUser[], pagination: any, timestamp: number }>>(new Map());
  const userPositionCacheRef = useRef<Map<string, { user: LeaderboardUser | null, surrounding: LeaderboardUser[], timestamp: number }>>(new Map());
  const isMountedRef = useRef<boolean>(true);
  const requestInProgressRef = useRef<{ leaderboard: boolean, position: boolean }>({ leaderboard: false, position: false });

  // Helper to create cache key
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  const createCacheKey = useCallback((type: LeaderboardType, frame: TimeFrame): string => {
    return `${type}:${frame}`;
  }, []);

  // Check if cache is still valid (30 seconds TTL)
  const isCacheValid = useCallback((timestamp: number): boolean => {
    return Date.now() - timestamp < 30000; // 30 seconds cache
  }, []);

  // Fetch leaderboard data - selalu 10 teratas
  const fetchLeaderboard = useCallback(async (force: boolean = false) => {
    // Skip if a request is already in progress for leaderboard
    if (requestInProgressRef.current.leaderboard) {
      return;
    }

    const cacheKey = createCacheKey(leaderboardType, timeFrame);
    const cachedData = leaderboardCacheRef.current.get(cacheKey);
    
    // Use cache if available and not forcing refresh
    if (!force && cachedData && isCacheValid(cachedData.timestamp)) {
      setLeaderboardData(cachedData.data);
      setPagination(cachedData.pagination);
      return;
    }
    
    setLoading(true);
    setError(null);
    requestInProgressRef.current.leaderboard = true;
    
    try {
      const response: LeaderboardResponse = await getLeaderboard(
        leaderboardType,
        timeFrame,
        1, //  1 page
        10 // Selalu 10 data
      );
      
      if (isMountedRef.current) {
        setLeaderboardData(response.leaderboard);
        setPagination(response.pagination);
        
        // Cache the result
        leaderboardCacheRef.current.set(cacheKey, {
          data: response.leaderboard,
          pagination: response.pagination,
          timestamp: Date.now()
        });
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err.message : 'Failed to load leaderboard data');
        console.error('Error loading leaderboard:', err);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
      requestInProgressRef.current.leaderboard = false;
    }
  }, [leaderboardType, timeFrame, createCacheKey, isCacheValid]);

  // Fetch current user position
  const fetchUserPosition = useCallback(async (force: boolean = false) => {
    if (!connected || !isAuthenticated) {
      setUserPosition(null);
      setSurroundingUsers([]);
      return;
    }
    
    // Skip if a request is already in progress for user position
    if (requestInProgressRef.current.position) {
      return;
    }
    
    const cacheKey = createCacheKey(leaderboardType, timeFrame);
    const cachedData = userPositionCacheRef.current.get(cacheKey);
    
    // Use cache if available and not forcing refresh
    if (!force && cachedData && isCacheValid(cachedData.timestamp)) {
      setUserPosition(cachedData.user);
      setSurroundingUsers(cachedData.surrounding);
      return;
    }
    
    requestInProgressRef.current.position = true;
    
    try {
      const response: UserPositionResponse = await getCurrentUserPosition(
        leaderboardType,
        timeFrame
      );
      
      if (isMountedRef.current) {
        setUserPosition(response.currentUser);
        setSurroundingUsers(response.surroundingUsers);
        
        // Cache the result
        userPositionCacheRef.current.set(cacheKey, {
          user: response.currentUser,
          surrounding: response.surroundingUsers,
          timestamp: Date.now()
        });
      }
    } catch (err) {
      console.error('Error fetching user position:', err);
      // Don't set the main error state, just log it
    } finally {
      requestInProgressRef.current.position = false;
    }
  }, [leaderboardType, timeFrame, connected, isAuthenticated, createCacheKey, isCacheValid]);

  // Load leaderboard data when params change
  useEffect(() => {
    isMountedRef.current = true;
    fetchLeaderboard();
    
    return () => {
      isMountedRef.current = false;
    };
  }, [leaderboardType, timeFrame, fetchLeaderboard]);

  // Load user position when authenticated
  useEffect(() => {
    if (connected && isAuthenticated) {
      fetchUserPosition();
    }
  }, [connected, isAuthenticated, fetchUserPosition]);

  // Change leaderboard type
  const changeLeaderboardType = useCallback((type: LeaderboardType) => {
    setLeaderboardType(type);
  }, []);

  // Change time frame
  const changeTimeFrame = useCallback((frame: TimeFrame) => {
    setTimeFrame(frame);
  }, []);

  // Refresh function with force parameter
  const refresh = useCallback(() => {
    fetchLeaderboard(true);
    if (connected && isAuthenticated) {
      fetchUserPosition(true);
    }
  }, [fetchLeaderboard, connected, isAuthenticated, fetchUserPosition]);

  return {
    leaderboardData,
    userPosition,
    surroundingUsers,
    pagination,
    loading,
    error,
    leaderboardType,
    timeFrame,
    changeLeaderboardType,
    changeTimeFrame,
    refresh
  };
}; 