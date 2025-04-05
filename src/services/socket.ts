import { io, Socket } from 'socket.io-client';
import { Bet, ChatMessage, GameMode, Match } from '../types';

// Events we'll listen for
export enum SocketEvents {
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  MATCH_UPDATE = 'match_update',
  NEW_BET = 'new_bet',
  NEW_CHAT_MESSAGE = 'new_chat_message',
  GAME_MODE_CHANGE = 'game_mode_change',
  MATCH_RESULT = 'match_result'
}

// Socket singleton instance
let socket: Socket | null = null;

// Initialize socket connection
export const initializeSocket = (): Socket => {
  if (!socket) {
    // In production, this would be your actual WebSocket server URL
    socket = io(process.env.NEXT_PUBLIC_API_URL);
    
    // Log connection status
    socket.on(SocketEvents.CONNECT, () => {
      console.log('Connected to WebSocket server');
    });
    
    socket.on(SocketEvents.DISCONNECT, () => {
      console.log('Disconnected from WebSocket server');
    });
  }
  
  return socket;
};

// Get socket instance (initialize if not already done)
export const getSocket = (): Socket => {
  if (!socket) {
    return initializeSocket();
  }
  return socket;
};

// Subscribe to match updates
export const subscribeToMatchUpdates = (callback: (match: Match) => void): void => {
  const socket = getSocket();
  socket.on(SocketEvents.MATCH_UPDATE, callback);
};

// Subscribe to new bets
export const subscribeToNewBets = (callback: (bet: Bet) => void): void => {
  const socket = getSocket();
  socket.on(SocketEvents.NEW_BET, callback);
};

// Subscribe to chat messages
export const subscribeToChatMessages = (callback: (message: ChatMessage) => void): void => {
  const socket = getSocket();
  socket.on(SocketEvents.NEW_CHAT_MESSAGE, callback);
};

// Subscribe to game mode changes
export const subscribeToGameModeChanges = (callback: (mode: GameMode) => void): void => {
  const socket = getSocket();
  socket.on(SocketEvents.GAME_MODE_CHANGE, callback);
};

// Subscribe to match results
export const subscribeToMatchResults = (callback: (result: { winnerId: string, match: Match }) => void): void => {
  const socket = getSocket();
  socket.on(SocketEvents.MATCH_RESULT, callback);
};

// Send a chat message
export const sendChatMessage = (message: string, walletAddress: string): void => {
  const socket = getSocket();
  socket.emit(SocketEvents.NEW_CHAT_MESSAGE, { message, walletAddress });
};

// Clean up socket connection
export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}; 