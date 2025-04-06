import { ChatMessage } from "../types";

// API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Fetch chat messages
export const fetchChatMessages = async (): Promise<ChatMessage[]> => {
  const response = await fetch(`${API_BASE_URL}/chat`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch chat messages');
  }
  
  return response.json();
};

// Send a chat message
export const sendChatMessage = async (walletAddress: string, message: string): Promise<ChatMessage> => {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      walletAddress,
      message,
    }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to send message');
  }
  
  return response.json();
}; 