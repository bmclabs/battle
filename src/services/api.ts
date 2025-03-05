import { Bet, ChatMessage, Fighter, Match } from "../types";

// API base URL
const API_BASE_URL = '/api';

// Fetch current match data
export const fetchCurrentMatch = async (): Promise<Match> => {
  const response = await fetch(`${API_BASE_URL}/match`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch match data');
  }
  
  return response.json();
};

// Fetch chart data for a specific fighter
export const fetchFighterChartData = async (fighterId: string): Promise<{ labels: string[], data: number[] }> => {
  if (!fighterId) {
    return { labels: [], data: [] };
  }
  
  const response = await fetch(`${API_BASE_URL}/chart/${fighterId}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch chart data');
  }
  
  return response.json();
};

// Place a bet
export const placeBet = async (walletAddress: string, amount: number, fighterId: string): Promise<Bet> => {
  const response = await fetch(`${API_BASE_URL}/bets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      walletAddress,
      amount,
      fighterId,
    }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to place bet');
  }
  
  return response.json();
};

// Fetch all bets for the current match
export const fetchBets = async (): Promise<Bet[]> => {
  const response = await fetch(`${API_BASE_URL}/bets`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch bets');
  }
  
  return response.json();
};

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