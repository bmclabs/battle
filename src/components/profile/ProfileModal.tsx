'use client';

import React, { useState, useEffect, useRef } from 'react';
import { formatWalletAddress } from '@/utils';
import { useProfile } from '@/hooks/useProfile';
import { useUserStats } from '@/hooks/useUserStats';
import BettingHistory from './BettingHistory';
import SolAmount from '@/components/ui/SolAmount';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress: string;
  username?: string;
  balance?: number;
  isOwnProfile?: boolean;
}

const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  walletAddress,
  username,
  balance = 0,
  isOwnProfile = true
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'history'>('profile');
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const previousWalletRef = useRef<string | null>(null);
  const initializedRef = useRef<boolean>(false);
  
  // Only fetch data when modal is open and wallet address has changed
  // const shouldFetchData = isOpen && (previousWalletRef.current !== walletAddress || !initializedRef.current);
  
  // Use profile hook to get betting history - always fetch when modal is open but avoid unnecessary requests
  const { bettingHistory, pagination, loading, error, changePage, refresh: refreshHistory } = useProfile({
    walletAddress: isOpen ? walletAddress : null
  });

  // Use user stats hook to get detailed statistics - always fetch when modal is open
  const { stats, loading: statsLoading, refetch: refreshStats } = useUserStats({
    walletAddress: isOpen ? walletAddress : null
  });
  
  // Keep track of the wallet address that's been loaded
  useEffect(() => {
    if (isOpen && walletAddress) {
      previousWalletRef.current = walletAddress;
      initializedRef.current = true;
    }
  }, [isOpen, walletAddress]);
  
  // Reset the initialization flag when modal closes
  useEffect(() => {
    if (!isOpen) {
      initializedRef.current = false;
    }
  }, [isOpen]);

  // Refresh data when modal is opened
  useEffect(() => {
    if (isOpen && previousWalletRef.current === walletAddress) {
      // Only refresh if we're reopening the modal for the same wallet
      if (activeTab === 'history') {
        refreshHistory();
      } else {
        refreshStats();
      }
    }
  }, [isOpen]);

  // Copy wallet address to clipboard
  const copyWalletAddress = () => {
    navigator.clipboard.writeText(walletAddress)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy wallet address:', err);
      });
  };

  // Handle tab changes
  const handleTabChange = (tab: 'profile' | 'history') => {
    setActiveTab(tab);
    
    // If changing to history tab and no data is loaded yet, refresh it
    if (tab === 'history' && bettingHistory.length === 0 && !loading) {
      refreshHistory();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-black/90 border-2 border-[#14F195] rounded-md shadow-xl p-5 retro-container max-h-[85vh] flex flex-col">
        {/* Header with close button */}
        <div className="flex justify-between items-center mb-4 border-b border-[#14F195] pb-3">
          <h2 className="text-[#14F195] text-lg font-pixel">
            {isOwnProfile ? 'Your Profile' : 'User Profile'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-800 mb-4">
          <button
            className={`px-4 py-2 font-medium text-sm cursor-pointer ${
              activeTab === 'profile'
                ? 'text-[#14F195] border-b-2 border-[#14F195]'
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => handleTabChange('profile')}
          >
            Profile
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm cursor-pointer ${
              activeTab === 'history'
                ? 'text-[#14F195] border-b-2 border-[#14F195]'
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => handleTabChange('history')}
          >
            Betting History
          </button>
        </div>

        {/* Tab content */}
        {activeTab === 'profile' ? (
          <div className="overflow-y-auto flex-1">
            <div className="space-y-6 px-1">
              {/* Profile section */}
              <div className="bg-black/50 p-6 rounded-md border border-gray-800">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-[#14F195]/20 rounded-full flex items-center justify-center">
                    <span className="text-3xl text-[#14F195]">
                      {username ? username[0].toUpperCase() : walletAddress[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    {username && (
                      <p className="text-white font-semibold text-lg">{username}</p>
                    )}
                    <div className="flex items-center mb-1">
                      <p className="text-gray-400 text-sm mr-2">
                        {formatWalletAddress(walletAddress)}
                      </p>
                      <button
                        onClick={copyWalletAddress}
                        className={`text-gray-500 hover:text-[#14F195] transition-colors ${copySuccess ? 'text-[#14F195]' : 'cursor-pointer'}`}
                        title="Copy wallet address"
                      >
                        {copySuccess ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" color="#14F195">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                          </svg>
                        )}
                      </button>
                    </div>
                    {isOwnProfile && (
                      <p className="text-[#14F195] font-medium">
                        <SolAmount amount={balance} iconSize={24} />
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats section */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/50 p-4 rounded-md border border-gray-800">
                  <p className="text-gray-400 text-xs mb-1">Total Bets</p>
                  <p className="text-white text-xl font-medium">
                    {statsLoading 
                      ? 'Loading...' 
                      : stats?.detailedStats?.totalCompletedBets || pagination.total || '0'}
                  </p>
                </div>
                <div className="bg-black/50 p-4 rounded-md border border-gray-800">
                  <p className="text-gray-400 text-xs mb-1">Win Rate</p>
                  <p className="text-white text-xl font-medium">
                    {statsLoading 
                      ? 'Loading...' 
                      : stats?.detailedStats?.completedWinRate 
                        ? `${stats.detailedStats.completedWinRate.toFixed(2)}%` 
                        : (pagination.total > 0
                          ? `${Math.round((bettingHistory.filter(bet => bet.isWinningBet).length / pagination.total) * 100)}%`
                          : '0%')}
                  </p>
                </div>
              </div>

              {/* Additional detailed statistics */}
              {stats && !statsLoading && (
                <div className="bg-black/50 p-4 rounded-md border border-gray-800">
                  <h3 className="text-[#14F195] text-sm font-medium mb-3">Detailed Statistics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-400 text-xs mb-1">Won Bets</p>
                      <p className="text-white text-lg font-medium">{stats.detailedStats.wonCompletedBets}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs mb-1">Lost Bets</p>
                      <p className="text-white text-lg font-medium">{stats.detailedStats.lostCompletedBets}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs mb-1">Total Earnings</p>
                      <p className="text-white text-lg font-medium">
                        <SolAmount amount={stats.totalEarnings} iconSize={26} />
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs mb-1">Biggest Win</p>
                      <p className="text-white text-lg font-medium">
                        <SolAmount amount={stats.detailedStats.biggestWin} iconSize={26} />
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1">
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#14F195] mb-2"></div>
              </div>
            ) : bettingHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                {error ? `Error: ${error}` : "No betting history found."}
                {/* <button 
                  onClick={refreshHistory}
                  className="mt-2 px-4 py-2 text-sm text-[#14F195] border border-[#14F195] rounded-md hover:bg-[#14F195]/10 block mx-auto"
                >
                  Refresh
                </button> */}
              </div>
            ) : (
              <BettingHistory
                history={bettingHistory}
                pagination={pagination}
                loading={loading}
                error={error}
                onPageChange={changePage}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileModal; 