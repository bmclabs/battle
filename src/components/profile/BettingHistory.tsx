import React from 'react';
import { BettingHistoryItem, Pagination } from '@/services/profile';
import { formatSolAmount, formatWalletAddress } from '@/utils';

interface BettingHistoryProps {
  history: BettingHistoryItem[];
  pagination: Pagination;
  loading: boolean;
  error: string | null;
  onPageChange: (page: number) => void;
}

// Fighter color map based on common fighter colors
const FIGHTER_COLORS: Record<string, string> = {
  'doge': '#BA9F33',
  'shiba': '#F3A62F',
  'pepe': '#4C9641',
  'pengu': '#8CB3FE',
  'trump': '#EAD793',
  'brett': '#00ACDC'
};

// Get fighter color or fallback to default
const getFighterColor = (fighterName: string): string => {
  const lowerName = fighterName.toLowerCase();
  for (const [key, value] of Object.entries(FIGHTER_COLORS)) {
    if (lowerName.includes(key)) {
      return value;
    }
  }
  return '#14F195'; // Default to primary color
};

const BettingHistory: React.FC<BettingHistoryProps> = ({
  history,
  pagination,
  loading,
  error,
  onPageChange
}) => {
  // Format bet timestamp
  const formatBetTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Format bet status
  const getBetStatusDetails = (bet: BettingHistoryItem) => {
    if (bet.isWinningBet) {
      return {
        text: 'WIN',
        color: 'text-green-400',
        bgColor: 'bg-green-900/20'
      };
    }
    
    if (bet.matchStatus === 'completed' && !bet.isWinningBet) {
      return {
        text: 'LOSS',
        color: 'text-red-400',
        bgColor: 'bg-red-900/20'
      };
    }
    
    if (bet.matchStatus === 'refund') {
      return {
        text: 'REFUNDED',
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-900/20'
      };
    }
    
    // For ongoing matches
    return {
      text: 'ACTIVE',
      color: 'text-blue-400',
      bgColor: 'bg-blue-900/20'
    };
  };

  // Generate array of page numbers to display
  const getPageNumbers = () => {
    // Ensure totalPages is at least 1
    const totalPages = Math.max(1, pagination.totalPages);
    const currentPage = Math.min(pagination.page, totalPages);
    const pageNumbers = [];
    
    // If 7 or fewer pages, show all pages
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
      return pageNumbers;
    }
    
    // Always show first page
    pageNumbers.push(1);
    
    // Calculate start and end of page numbers to show
    let startPage = Math.max(2, currentPage - 2);
    let endPage = Math.min(totalPages - 1, currentPage + 2);
    
    // Adjust if we're close to the start
    if (currentPage < 5) {
      endPage = 5;
    }
    
    // Adjust if we're close to the end
    if (currentPage > totalPages - 4) {
      startPage = totalPages - 4;
    }
    
    // Add ellipsis after first page if needed
    if (startPage > 2) {
      pageNumbers.push('...');
    }
    
    // Add calculated page numbers
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    // Add ellipsis before last page if needed
    if (endPage < totalPages - 1) {
      pageNumbers.push('...');
    }
    
    // Always show last page if not already included
    if (totalPages > 1) {
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };

  return (
    <div className="space-y-4 relative">
      {error && (
        <div className="bg-red-900/20 border border-red-500 p-3 rounded-md text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mb-2"></div>
            <p className="text-primary text-sm">Loading...</p>
          </div>
        </div>
      )}

      {!loading && history.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          No betting history found
        </div>
      ) : (
        <>
          <div className="space-y-3 pr-1 min-h-[200px]">
            {history.map((bet) => {
              const statusDetails = getBetStatusDetails(bet);
              const fighterColor = getFighterColor(bet.fighterName);
              
              return (
                <div 
                  key={bet.id} 
                  className="bg-black/50 border border-gray-800 rounded-md overflow-hidden"
                >
                  <div className="grid grid-cols-12 p-3 gap-2">
                    {/* Fighter/Result info */}
                    <div className="col-span-7">
                      <div className="flex items-center mb-2">
                        <div 
                          className={`text-xs font-medium px-2 py-1 rounded-sm mr-2 ${statusDetails.bgColor} ${statusDetails.color}`}
                        >
                          {statusDetails.text}
                        </div>
                        <span className="text-xs text-gray-400">
                          {formatBetTime(bet.betTime)}
                        </span>
                      </div>
                      
                      <p className="text-sm">
                        <span className="text-gray-400 mr-1">Bet on:</span>
                        <span 
                          className="font-medium"
                          style={{ color: fighterColor }}
                        >
                          {bet.fighterName}
                        </span>
                      </p>
                      
                      <p className="text-xs text-gray-400 mt-1">
                        Match: {bet.fighter1Name} vs {bet.fighter2Name}
                      </p>
                    </div>
                    
                    {/* Amount info */}
                    <div className="col-span-5 flex flex-col items-end justify-between">
                      <div className="text-sm">
                        <span className="text-gray-400 mr-1">Bet:</span>
                        <span className="text-white font-medium">
                          {formatSolAmount(bet.amount)} SOL
                        </span>
                      </div>
                      
                      {bet.isWinningBet && (
                        <div className="text-sm">
                          <span className="text-gray-400 mr-1">Won:</span>
                          <span className="text-green-400 font-medium">
                            {formatSolAmount(bet.amount * bet.prizeShare)} SOL
                          </span>
                        </div>
                      )}
                      
                      <a
                        href={`https://solscan.io/tx/${bet.transactionSignature}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-gray-500 hover:text-primary underline mt-1"
                      >
                        View Transaction
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Enhanced Pagination - Always show */}
          <div className="flex justify-center items-center pt-4 border-t border-gray-800">
            <div className="flex flex-wrap items-center justify-center gap-1">
              {/* First page button */}
              <button
                onClick={() => onPageChange(1)}
                disabled={pagination.page <= 1 || loading}
                className={`p-2 rounded-md ${
                  pagination.page <= 1 || loading
                    ? 'text-gray-600 cursor-not-allowed'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
                title="First page"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="11 17 6 12 11 7"></polyline>
                  <polyline points="18 17 13 12 18 7"></polyline>
                </svg>
              </button>
              
              {/* Previous page */}
              <button
                onClick={() => onPageChange(Math.max(1, pagination.page - 1))}
                disabled={pagination.page <= 1 || loading}
                className={`p-2 rounded-md ${
                  pagination.page <= 1 || loading
                    ? 'text-gray-600 cursor-not-allowed'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
                title="Previous page"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>
              
              {/* Page numbers */}
              <div className="flex items-center">
                {getPageNumbers().map((pageNum, index) => (
                  <React.Fragment key={index}>
                    {pageNum === '...' ? (
                      <span className="text-gray-600 px-2">...</span>
                    ) : (
                      <button
                        onClick={() => typeof pageNum === 'number' && onPageChange(pageNum)}
                        disabled={loading}
                        className={`w-8 h-8 flex items-center justify-center rounded-md text-sm ${
                          pagination.page === pageNum
                            ? 'bg-primary/20 text-primary border border-primary/30'
                            : loading 
                              ? 'text-gray-600 cursor-not-allowed'
                              : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )}
                  </React.Fragment>
                ))}
              </div>
              
              {/* Next page */}
              <button
                onClick={() => onPageChange(Math.min(pagination.totalPages || 1, pagination.page + 1))}
                disabled={pagination.page >= (pagination.totalPages || 1) || loading}
                className={`p-2 rounded-md ${
                  pagination.page >= (pagination.totalPages || 1) || loading
                    ? 'text-gray-600 cursor-not-allowed'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
                title="Next page"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
              
              {/* Last page button */}
              <button
                onClick={() => onPageChange(pagination.totalPages || 1)}
                disabled={pagination.page >= (pagination.totalPages || 1) || loading}
                className={`p-2 rounded-md ${
                  pagination.page >= (pagination.totalPages || 1) || loading
                    ? 'text-gray-600 cursor-not-allowed'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
                title="Last page"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="13 17 18 12 13 7"></polyline>
                  <polyline points="6 17 11 12 6 7"></polyline>
                </svg>
              </button>
            </div>
          </div>
          
          {/* Page info */}
          <div className="text-center text-xs text-gray-500 pt-2">
            Showing {Math.min(pagination.total, pagination.limit * (pagination.page - 1) + 1)} to {Math.min(pagination.limit * pagination.page, pagination.total)} of {pagination.total || 0} bets
          </div>
        </>
      )}
    </div>
  );
};

export default BettingHistory; 