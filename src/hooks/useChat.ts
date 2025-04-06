import { useState, useEffect, useCallback } from 'react';
import { 
  joinChatRoom, 
  leaveChatRoom, 
  sendChatMessage, 
  subscribeToChatMessages,
  subscribeToUserJoined,
  subscribeToUserLeft,
  subscribeToUsersList
} from '../services/socket';
import { ChatMessage, ChatUser } from '../types';

interface UseChatOptions {
  roomId?: string;
  userId?: string;
  walletAddress?: string;
  isConnected: boolean;
}

export const useChat = ({ 
  roomId = 'global', 
  userId = '', 
  walletAddress = '',
  isConnected
}: UseChatOptions) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Handle joining the chat room when connected
  useEffect(() => {
    // Clear messages when disconnected
    if (!isConnected || !userId) {
      setMessages([]);
      setUsers([]);
      return;
    }
    
    console.log('Joining chat room:', roomId);
    
    // Join the room
    joinChatRoom(roomId, userId, walletAddress);
    
    // Cleanup - leave the room
    return () => {
      console.log('Leaving chat room:', roomId);
      leaveChatRoom(roomId, userId, walletAddress);
    };
  }, [roomId, userId, walletAddress, isConnected]);
  
  // Subscribe to chat events
  useEffect(() => {
    if (!isConnected) return;
    
    // Clean up functions array
    const cleanupFns: (() => void)[] = [];
    
    // Subscribe to incoming messages
    const unsubscribeMessages = subscribeToChatMessages((message) => {
      setMessages((prev) => [...prev, message]);
    });
    cleanupFns.push(unsubscribeMessages);
    
    // Subscribe to users joining
    const unsubscribeUserJoined = subscribeToUserJoined(({ userId, walletAddress }) => {
      console.log(`User joined: ${walletAddress}`);
      // Add notification message
      const joinMsg: ChatMessage = {
        id: `join-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        walletAddress: 'system',
        message: `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)} joined the chat`,
        timestamp: Date.now()
      };
      setMessages((prev) => [...prev, joinMsg]);
    });
    cleanupFns.push(unsubscribeUserJoined);
    
    // Subscribe to users leaving
    const unsubscribeUserLeft = subscribeToUserLeft(({ userId, walletAddress }) => {
      console.log(`User left: ${walletAddress}`);
      // Add notification message
      const leaveMsg: ChatMessage = {
        id: `leave-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        walletAddress: 'system',
        message: `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)} left the chat`,
        timestamp: Date.now()
      };
      setMessages((prev) => [...prev, leaveMsg]);
    });
    cleanupFns.push(unsubscribeUserLeft);
    
    // Subscribe to users list
    const unsubscribeUsersList = subscribeToUsersList(({ users: updatedUsers }) => {
      setUsers(updatedUsers);
    });
    cleanupFns.push(unsubscribeUsersList);
    
    // Clean up all subscriptions
    return () => {
      cleanupFns.forEach(fn => fn());
    };
  }, [isConnected, roomId]);
  
  // Send a message
  const sendMessage = useCallback((message: string) => {
    if (!isConnected || !userId || !walletAddress || !message.trim()) {
      setError('Cannot send message: You need to be connected');
      return;
    }
    
    try {
      sendChatMessage(roomId, userId, walletAddress, message);
      
      // We don't need to update the messages state here
      // because the message will come back through the socket
      
      setError(null);
    } catch (err) {
      setError('Failed to send message');
      console.error('Error sending message:', err);
    }
  }, [roomId, userId, walletAddress, isConnected]);
  
  return {
    messages,
    users,
    error,
    sendMessage
  };
}; 