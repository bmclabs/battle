import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, ChatUser } from '../../types';
import { formatWalletAddress } from '../../utils';
import Button from '../ui/Button';
import { useChat } from '../../hooks/useChat';

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
  
  // Use the chat hook
  const { messages, users, error, sendMessage } = useChat({
    roomId: 'global',
    userId: userId,
    walletAddress,
    isConnected: connected
  });

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
    setAutoScroll(isNearBottom());
  };

  // Auto-scroll to bottom when new messages arrive if autoScroll is true
  useEffect(() => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, autoScroll]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !connected) return;
    
    sendMessage(message);
    setMessage('');
    setAutoScroll(true); // Enable auto-scroll when sending a message
  };

  return (
    <div className="w-full h-full flex flex-col bg-black/80 border-2 border-primary retro-container overflow-hidden">
      <div className="bg-primary p-2">
        <h2 className="text-white text-center text-lg">CHAT ROOM</h2>
      </div>
      
      {/* Messages container */}
      <div 
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-2 pixel-scrollbar"
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 text-xs">No messages yet</p>
          </div>
        ) : (
          <div className="space-y-1 pr-1">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`p-1 rounded ${
                  msg.walletAddress === 'system'
                    ? 'bg-gray-800/40 border-l-2 border-gray-500'
                    : msg.walletAddress === walletAddress
                      ? 'bg-primary/40 border-l-2 border-primary'
                      : 'bg-primary/30 border-l-2 border-primary'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-bold ${
                    msg.walletAddress === 'system' ? 'text-gray-400' : 'text-primary'
                  }`}>
                    {msg.walletAddress === 'system' 
                      ? 'SYSTEM' 
                      : formatWalletAddress(msg.walletAddress)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-white text-xs break-words">{msg.message}</p>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {/* Connected users */}
      {users.length > 0 && (
        <div className="px-2 py-1 border-t border-primary bg-black/50">
          <p className="text-gray-400 text-xs">
            {users.length} user{users.length !== 1 ? 's' : ''} online
          </p>
        </div>
      )}
      
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
    </div>
  );
};

export default ChatRoom; 