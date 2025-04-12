import { useState, useEffect, useCallback, useRef } from 'react';
import { getUserStats, UserStats } from '@/services/profile';

interface UseUserStatsProps {
  walletAddress: string | null;
}

interface UseUserStatsResult {
  stats: UserStats | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch and manage user statistics
 * @param props.walletAddress The wallet address to get statistics for
 * @returns User statistics data, loading state, and error
 */
export function useUserStats(props: UseUserStatsProps): UseUserStatsResult {
  const { walletAddress } = props;
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const previousWalletAddressRef = useRef<string | null>(null);
  const isMountedRef = useRef<boolean>(true);
  const lastFetchTimeRef = useRef<number>(0);

  const fetchStats = useCallback(async (forceRefresh: boolean = false) => {
    if (!walletAddress) {
      setLoading(false);
      return;
    }

    // Prevent duplicate requests for the same wallet unless force refresh is requested
    // Also add a time-based throttle (minimum 5 seconds between refreshes)
    const now = Date.now();
    const timeSinceLastFetch = now - lastFetchTimeRef.current;
    if (
      !forceRefresh && 
      previousWalletAddressRef.current === walletAddress && 
      stats !== null &&
      timeSinceLastFetch < 5000 // 5 second minimum between refreshes
    ) {
      return;
    }

    setLoading(true);
    setError(null);
    previousWalletAddressRef.current = walletAddress;
    lastFetchTimeRef.current = now;

    try {
      const response = await getUserStats(walletAddress);
      if (isMountedRef.current) {
        if (response.success) {
          setStats(response.data);
        } else {
          setError(new Error('Failed to fetch user stats'));
        }
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [walletAddress, stats]);

  useEffect(() => {
    isMountedRef.current = true;
    
    if (walletAddress) {
      fetchStats();
    }
    
    return () => {
      isMountedRef.current = false;
    };
  }, [walletAddress, fetchStats]);

  const refetch = useCallback(async () => {
    // Only refetch if we have a wallet address
    if (walletAddress) {
      // Force a refresh
      await fetchStats(true);
    }
  }, [walletAddress, fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch
  };
} 