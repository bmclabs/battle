import { useState, useEffect, useCallback, useRef } from 'react';
import { getUserBettingHistory, BettingHistoryItem, Pagination } from '@/services/profile';

interface UseProfileProps {
  walletAddress: string | null;
}

export const useProfile = ({ walletAddress }: UseProfileProps) => {
  const [bettingHistory, setBettingHistory] = useState<BettingHistoryItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 4,
    totalPages: 0
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const previousRequestRef = useRef<{ wallet: string | null; page: number; limit: number } | null>(null);
  const isMountedRef = useRef<boolean>(true);

  // Fetch betting history with caching to prevent duplicate requests
  const fetchBettingHistory = useCallback(async (page: number = 1, limit: number = 4, forceRefresh: boolean = false) => {
    if (!walletAddress) return;

    const currentRequest = { wallet: walletAddress, page, limit };
    
    // Skip if this is the exact same request as before and we have data (unless forced)
    if (
      !forceRefresh &&
      previousRequestRef.current && 
      previousRequestRef.current.wallet === currentRequest.wallet && 
      previousRequestRef.current.page === currentRequest.page && 
      previousRequestRef.current.limit === currentRequest.limit &&
      bettingHistory.length > 0
    ) {
      // Return with existing data
      return;
    }

    try {
      setLoading(true);
      setError(null);
      previousRequestRef.current = currentRequest;
      
      console.log(`Fetching betting history for ${walletAddress}, page ${page}`);
      const response = await getUserBettingHistory(walletAddress, page, limit);
      
      if (isMountedRef.current) {
        console.log(`Received betting history: ${response.data.length} items`);
        setBettingHistory(response.data);
        setPagination(response.pagination);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err.message : 'Failed to load betting history');
        console.error('Error loading betting history:', err);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [walletAddress, bettingHistory.length]);

  // Load betting history when wallet address changes
  useEffect(() => {
    isMountedRef.current = true;
    
    if (walletAddress) {
      // Always fetch when wallet address is set
      fetchBettingHistory();
    } else {
      // Reset state when no wallet address
      setBettingHistory([]);
      setPagination({
        total: 0,
        page: 1,
        limit: 4,
        totalPages: 0
      });
    }
    
    return () => {
      isMountedRef.current = false;
    };
  }, [walletAddress, fetchBettingHistory]);

  // Function to change page
  const changePage = useCallback((page: number) => {
    if (page < 1 || page > pagination.totalPages) return;
    
    // When changing page, we don't need to force refresh
    fetchBettingHistory(page, pagination.limit, false);
  }, [pagination.totalPages, pagination.limit, fetchBettingHistory]);

  // Function to explicitly refresh data
  const refresh = useCallback(() => {
    if (walletAddress) {
      // Force a refresh by passing true
      fetchBettingHistory(pagination.page, pagination.limit, true);
    }
  }, [walletAddress, pagination.page, pagination.limit, fetchBettingHistory]);

  return {
    bettingHistory,
    pagination,
    loading,
    error,
    changePage,
    refresh
  };
}; 