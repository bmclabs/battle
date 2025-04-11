import { useState, useEffect } from 'react';
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

  // Fetch betting history
  const fetchBettingHistory = async (page: number = 1, limit: number = 4) => {
    if (!walletAddress) return;

    try {
      setLoading(true);
      setError(null);
      
      const response = await getUserBettingHistory(walletAddress, page, limit);
      
      setBettingHistory(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load betting history');
      console.error('Error loading betting history:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load betting history when wallet address changes
  useEffect(() => {
    if (walletAddress) {
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
  }, [walletAddress]);

  // Function to change page
  const changePage = (page: number) => {
    if (page < 1 || page > pagination.totalPages) return;
    fetchBettingHistory(page, pagination.limit);
  };

  return {
    bettingHistory,
    pagination,
    loading,
    error,
    changePage,
    refresh: () => fetchBettingHistory(pagination.page, pagination.limit)
  };
}; 