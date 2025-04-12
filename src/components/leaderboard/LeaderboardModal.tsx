'use client';

import React, { useState } from 'react';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { LeaderboardUser } from '@/services/leaderboard';
import { formatWalletAddress } from '@/utils';
import Image from 'next/image';
import ProfileModal from '../profile/ProfileModal';
import SolAmount from '@/components/ui/SolAmount';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose
}) => {
  const {
    leaderboardData,
    userPosition,
    loading,
    error,
    leaderboardType,
    timeFrame,
    changeLeaderboardType,
    changeTimeFrame,
    refresh
  } = useLeaderboard();

  const [selectedUser, setSelectedUser] = useState<LeaderboardUser | null>(null);

  // Handle user selection for profile modal
  const handleUserClick = (user: LeaderboardUser) => {
    setSelectedUser(user);
  };

  // Format win rate percentage
  const formatWinRate = (rate: number): string => {
    // Backend sudah mengembalikan nilai dalam persentase (0-100)
    // Pastikan nilai berada dalam rentang 0-100
    const clampedRate = Math.max(0, Math.min(100, rate));
    return `${clampedRate.toFixed(2)}%`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl bg-black/90 border-2 border-[#14F195] rounded-md shadow-xl max-h-[60vh] flex flex-col h-[600px]">
        <div className="bg-[#14F195] p-2 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h2 className="text-white text-center text-lg">LEADERBOARD</h2>
            <Image src="/icons/icon_leaderboard.png" alt="Leaderboard icon" width={20} height={20} />
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        {/* Filter Controls */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-[#14F195]/30">
          <div className="flex space-x-1">
            <button
              onClick={() => changeLeaderboardType('earnings')}
              className={`text-xs px-3 py-1 rounded cursor-pointer ${
                leaderboardType === 'earnings'
                  ? 'bg-[#14F195]/20 text-[#14F195] border border-[#14F195]/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              Earnings
            </button>
            {/* <button
              onClick={() => changeLeaderboardType('winRate')}
              className={`text-xs px-3 py-1 rounded cursor-pointer ${
                leaderboardType === 'winRate'
                  ? 'bg-[#14F195]/20 text-[#14F195] border border-[#14F195]/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              Win Rate
            </button> */}
          </div>
          
          <div className="flex space-x-1">
            <button
              onClick={() => changeTimeFrame('all')}
              className={`text-xs px-2 py-1 rounded cursor-pointer ${
                timeFrame === 'all'
                  ? 'bg-[#FF69B4]/20 text-[#FF69B4] border border-[#FF69B4]/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => changeTimeFrame('month')}
              className={`text-xs px-2 py-1 rounded cursor-pointer ${
                timeFrame === 'month'
                  ? 'bg-[#FF69B4]/20 text-[#FF69B4] border border-[#FF69B4]/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => changeTimeFrame('week')}
              className={`text-xs px-2 py-1 rounded cursor-pointer ${
                timeFrame === 'week'
                  ? 'bg-[#FF69B4]/20 text-[#FF69B4] border border-[#FF69B4]/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              Week
            </button>
          </div>
        </div>
        
        {/* User Position Section */}
        {userPosition && (
          <div className="bg-[#FF69B4]/10 border-b border-[#FF69B4]/30 p-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="text-[#FF69B4] text-sm font-bold mr-2">#{userPosition.position}</div>
                <div 
                  className="text-white text-sm font-medium cursor-pointer hover:text-[#FF69B4] transition-colors"
                  onClick={() => handleUserClick(userPosition)}
                >
                  {userPosition.username || formatWalletAddress(userPosition.wallet_address)}
                </div>
              </div>
              <div className="flex space-x-4 items-center">
                <div className="text-xs">
                  <span className="text-gray-400">W/L:</span>{' '}
                  <span className="text-white">{(userPosition.wins !== undefined && userPosition.losses !== undefined) ? `${userPosition.wins}/${userPosition.losses}` : 'N/A'}</span>
                </div>
                <div className="text-xs">
                  <span className="text-gray-400">Rate:</span>{' '}
                  <span className="text-white">{(userPosition.winRate >= 0) ? formatWinRate(userPosition.winRate) : 'N/A'}</span>
                </div>
                <div className="text-xs">
                  <span className="text-gray-400">Earnings:</span>{' '}
                  <span className="text-[#FF69B4]">
                    <SolAmount amount={userPosition.earnings} className="text-[#FF69B4]" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Leaderboard Table */}
        <div className="flex-1 overflow-y-auto min-h-[300px] leaderboard-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#14F195]"></div>
            </div>
          ) : error ? (
            <div className="p-4 text-center flex flex-col items-center">
              <p className="text-red-400 mb-3 text-sm">
                {error.includes('429') ? 'Rate limit exceeded. Please wait a moment before trying again.' : error}
              </p>
              <button 
                onClick={() => refresh()}
                className="px-4 py-1 bg-[#14F195]/20 text-[#14F195] text-sm border border-[#14F195]/30 rounded hover:bg-[#14F195]/30 transition-colors"
                disabled={loading}
              >
                Retry
              </button>
            </div>
          ) : leaderboardData.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              No data available
            </div>
          ) : (
            <div className="px-2">
              <table className="w-full">
                <thead className="sticky top-0 bg-black/90 border-b border-gray-800 text-xs text-gray-400">
                  <tr>
                    <th className="py-3 text-left pl-2">Rank</th>
                    <th className="py-3 text-left">Player</th>
                    <th className="py-3 text-center">W/L</th>
                    <th className="py-3 text-center">Win Rate</th>
                    <th className="py-3 text-right pr-2">
                      {leaderboardType === 'earnings' ? 'Earnings' : 'Profit'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboardData.map((user, index) => (
                    <tr 
                      key={user.id}
                      className={`border-b border-gray-800/30 hover:bg-[#14F195]/5 cursor-pointer ${
                        userPosition && user.id === userPosition.id 
                          ? 'bg-[#14F195]/10'
                          : ''
                      }`}
                      onClick={() => handleUserClick(user)}
                    >
                      <td className="py-2 pl-2 text-sm text-[#14F195] font-medium">
                        {index + 1}
                      </td>
                      <td className="py-2 text-sm">
                        <span className="font-medium text-white">
                          {user.username || formatWalletAddress(user.wallet_address)}
                        </span>
                      </td>
                      <td className="py-2 text-center text-sm text-gray-300">
                        {(user.wins !== undefined && user.losses !== undefined) ? `${user.wins}/${user.losses}` : 'N/A'}
                      </td>
                      <td className="py-2 text-center text-sm text-gray-300">
                        {(user.winRate >= 0) ? formatWinRate(user.winRate) : 'N/A'}
                      </td>
                      <td className="py-2 pr-2 text-right text-sm font-medium text-[#14F195]">
                        <SolAmount amount={user.earnings} className="text-[#14F195]" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Profile Modal */}
        {selectedUser && (
          <ProfileModal
            isOpen={!!selectedUser}
            onClose={() => setSelectedUser(null)}
            walletAddress={selectedUser.wallet_address}
            username={selectedUser.username || undefined}
            isOwnProfile={userPosition ? selectedUser.id === userPosition.id : false}
          />
        )}
      </div>
    </div>
  );
};

export default LeaderboardModal; 