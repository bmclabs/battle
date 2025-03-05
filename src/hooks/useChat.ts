import { useState, useEffect } from 'react';
import { fetchChatMessages, sendChatMessage as apiSendChatMessage } from '../services/api';
import { subscribeToChatMessages, sendChatMessage as socketSendChatMessage } from '../services/socket';
import { ChatMessage } from '../types';

export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState<boolean>(false);

  useEffect(() => {
    const loadMessages = async () => {
      try {
        setLoading(true);
        const messagesData = await fetchChatMessages();
        setMessages(messagesData);
        setError(null);
      } catch (err) {
        setError('Failed to load chat messages');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();

    // Subscribe to new chat messages
    subscribeToChatMessages((newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    return () => {
      // Cleanup would happen here if needed
    };
  }, []);

  const sendMessage = async (walletAddress: string, message: string) => {
    try {
      setSending(true);
      setError(null);
      
      // Send via API (for persistence)
      const newMessage = await apiSendChatMessage(walletAddress, message);
      
      // Send via WebSocket (for real-time)
      socketSendChatMessage(message, walletAddress);
      
      // Optimistically add to local state
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      
      return newMessage;
    } catch (err) {
      setError('Failed to send message');
      console.error(err);
      throw err;
    } finally {
      setSending(false);
    }
  };

  return {
    messages,
    loading,
    error,
    sending,
    sendMessage
  };
}; 