import React, { useState, useRef, useEffect } from 'react';
import { formatWalletAddress } from '../../utils';
import Button from '../ui/Button';
import { useChat } from '../../hooks/useChat';
import ProfileModal from '../profile/ProfileModal';
import { useWalletAuth } from '@/lib/context/WalletContext';
// import { useBetting } from '../../hooks/useBetting';
// import { useMatch } from '../../hooks/useMatch';

interface ChatRoomProps {
  walletAddress: string;
  connected: boolean;
  userId?: string;
}

const ChatRoom: React.FC<ChatRoomProps> = ({
  walletAddress,
  connected,
  userId = ''
}) => {
  const [message, setMessage] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [userScrolled, setUserScrolled] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<{
    address: string;
    username?: string;
    balance?: number;
    isOwnProfile: boolean;
  } | null>(null);
  
  // Get wallet auth context to access balance
  const { balance, user } = useWalletAuth();
  
  // Get current match
  // const { match } = useMatch();
  // const matchId = match?.matchId || '';
  
  // Use the chat hook
  const { messages, error, sendMessage } = useChat({
    roomId: 'global',
    userId: userId,
    walletAddress,
    username: user?.username,
    isConnected: connected
  });

  // Get betting data
  // const { userBets } = useBetting({ matchId });
  
  // Get the most recent bet if it exists
  // const latestBet = userBets && userBets.length > 0 ? userBets[0] : null;

  // Check if user is near bottom of chat
  const isNearBottom = () => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      return container.scrollHeight - container.scrollTop - container.clientHeight < 100;
    }
    return true;
  };

  // Handle scroll event
  const handleScroll = () => {
    // Mark that user has manually scrolled
    setUserScrolled(true);
    
    // Check if user has scrolled to the bottom
    if (isNearBottom()) {
      setAutoScroll(true);
    } else {
      setAutoScroll(false);
    }
  };

  // Handle clicking on a user in the chat
  const handleUserClick = (address: string, username?: string) => {
    if (address === 'system') return;
    
    const isOwnProfile = address === walletAddress;
    
    setSelectedProfile({
      address,
      username,
      balance: isOwnProfile ? balance : undefined,
      isOwnProfile
    });
  };

  // Auto-scroll when new messages arrive, but only if we're already at the bottom
  // or if the user hasn't manually scrolled
  useEffect(() => {
    if ((autoScroll || !userScrolled) && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, autoScroll, userScrolled]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !connected) return;
    
    sendMessage(message);
    setMessage('');
    // Enable auto-scroll when sending a message
    setAutoScroll(true);
  };

  // Format display name for chat message
  const formatDisplayName = (message: typeof messages[0]) => {
    if (message.walletAddress === 'system') {
      return 'SYSTEM';
    }
    
    // If message has a username, show it
    if (message.username) {
      return message.username;
    }
    
    // For the current user's messages, use their username if available
    if (message.walletAddress === walletAddress && user?.username) {
      return user.username;
    }
    
    // Fallback to formatted wallet address
    return formatWalletAddress(message.walletAddress);
  };

  return (
    <div className="w-full h-[450px] flex flex-col bg-black/80 border-2 border-primary retro-container overflow-hidden">
      <div className="bg-primary p-2">
        <h2 className="text-white text-center text-lg">CHAT ROOM</h2>
      </div>
      
      {/* Messages container */}
      <div 
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-2 pixel-scrollbar relative"
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 text-center text-[10px]">Only connected users can see messages</p>
          </div>
        ) : (
          <div className="space-y-1 pr-1">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`p-1 rounded ${
                  msg.walletAddress === 'system'
                    ? 'bg-gray-800/40 border-l-2 border-gray-500 hidden'
                    : msg.walletAddress === walletAddress
                      ? 'bg-[#14F195]/10 border-l-2 border-[#14F195]'
                      : 'bg-[#14F195]/25 border-l-2 border-[#14F195]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span 
                    className={`text-xs font-bold ${
                      msg.walletAddress === 'system' ? 'text-gray-400' : 'text-[#14F195]'
                    } ${msg.walletAddress !== 'system' ? 'cursor-pointer hover:underline' : ''}`}
                    onClick={() => msg.walletAddress !== 'system' && handleUserClick(msg.walletAddress, msg.username)}
                    title={msg.walletAddress !== 'system' ? msg.walletAddress : undefined}
                  >
                    {formatDisplayName(msg)}
                  </span>
                  <span className="text-[10px] text-gray-500">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-white text-xs break-words">{msg.message}</p>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
        
        {/* Scroll to bottom button - only show when not at bottom and messages exist */}
        {!autoScroll && messages.length > 0 && (
          <button
            onClick={() => {
              setAutoScroll(true);
              if (messagesEndRef.current) {
                messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="absolute bottom-2 right-2 bg-primary/80 hover:bg-primary text-white rounded-full p-1 shadow-lg"
            title="Scroll to latest messages"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
        )}
      </div>
      
      {/* Footer info - Show either placed bet or connected users */}
      {/* <div className="px-2 py-1 border-t border-primary bg-black/50 flex items-center justify-between">
        {latestBet && (
          <p className="text-gray-400 text-xs">
            Placed bet: <span className="text-[#14F195] font-semibold">{latestBet.fighterName}</span>
          </p>
        )}
        
        <div className="flex items-center">
          {latestBet && (
            <p className="text-gray-400 text-xs mr-4">
              <span className="text-[#14F195] font-semibold">{formatSolAmount(latestBet.amount)}</span> SOL
            </p>
          )}
        </div>
      </div> */}
      
      {/* Message input */}
      <form onSubmit={handleSendMessage} className="p-2 border-t border-primary">
        {connected ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="retro-input flex-1 min-w-0"
              maxLength={100}
            />
            <Button
              type="submit"
              disabled={!message.trim()}
              variant="primary"
              size="xs"
            >
              SEND
            </Button>
          </div>
        ) : (
          <div className="bg-black/50 p-2 text-center retro-container">
            <p className="text-gray-400 text-xs">Connect wallet to chat</p>
          </div>
        )}
      </form>
      
      {/* Error message */}
      {error && (
        <div className="p-2 bg-red-900/50 border-t border-red-500">
          <p className="text-red-300 text-xs">{error}</p>
        </div>
      )}

      {/* User profile modal */}
      {selectedProfile && (
        <ProfileModal
          isOpen={!!selectedProfile}
          onClose={() => setSelectedProfile(null)}
          walletAddress={selectedProfile.address}
          username={selectedProfile.username}
          balance={selectedProfile.balance}
          isOwnProfile={selectedProfile.isOwnProfile}
        />
      )}
    </div>
  );
};

export default ChatRoom; 