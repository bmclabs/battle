'use client';

import React, { useState } from 'react';
import ChatRoom from './ChatRoom';
import LeaderboardModal from '../leaderboard/LeaderboardModal';
import Image from 'next/image';

interface ChatContainerProps {
  walletAddress: string;
  connected: boolean;
  userId?: string;
}

const ChatContainer: React.FC<ChatContainerProps> = ({
  walletAddress,
  connected,
  userId = ''
}) => {
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);

  const openLeaderboard = () => {
    setIsLeaderboardOpen(true);
  };

  const closeLeaderboard = () => {
    setIsLeaderboardOpen(false);
  };

  return (
    <div className="relative">
      {/* Leaderboard button */}
      <button
        onClick={openLeaderboard}
        className="absolute top-2 right-2 z-10 bg-black/70 p-1 rounded border border-[#14F195]/50 hover:bg-[#14F195]/20 transition-colors cursor-pointer"
        title="Show Leaderboard"
      >
        <Image
          src="/icons/icon_leaderboard.png"
          alt="Leaderboard icon"
          width={20}
          height={20}
        />
      </button>
      
      {/* Chat Content */}
      <ChatRoom
        walletAddress={walletAddress}
        connected={connected}
        userId={userId}
      />
      
      {/* Leaderboard Modal */}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={closeLeaderboard}
      />
    </div>
  );
};

export default ChatContainer; 