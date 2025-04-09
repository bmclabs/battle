import { io, Socket } from 'socket.io-client';
import { ChatMessage, GameMode } from '../types';

// Socket events from backend implementation
export enum SocketEvents {
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  GAME_MATCH_UPDATE = 'game:match_update',
  GAME_CHART_DATA = 'game:chart_data',
  GAME_MATCH_RESULT = 'game:match_result',
  MATCH_STATUS_CHANGE = 'match:status_change',
  ERROR = 'error',
  // Chat events
  CHAT_JOIN = 'chat:join',
  CHAT_LEAVE = 'chat:leave',
  CHAT_MESSAGE = 'chat:message',
  CHAT_USER_JOINED = 'chat:user_joined',
  CHAT_USER_LEFT = 'chat:user_left',
  CHAT_USERS_LIST = 'chat:users_list'
}

// Match data interface
export interface MatchData {
  matchId: string;
  fighter1: string;
  fighter2: string;
  mode: GameMode;
  winner?: string;
}

// Fighter stats interface
export interface FighterStatsData {
  matchId: string;
  fighter: string;
  stats: {
    hp: number;
    maxMana: number;
    baseAttack: number;
    critical: number;
    defend: number;
    kickProbability: number;
    specialSkill1Cost: number;
    specialSkill2Cost: number;
    aggressiveness: number;
    defensiveness: number;
    jumpiness: number;
  };
}

// Chart data interface
export interface ChartData {
  matchId: string;
  interval: string;
  count: number;
  fighters: {
    fighterName: string;
    coinId: number;
    timeStart: string;
    timeEnd: string;
    marketData?: {
      price: number;
      marketCap: number;
      volume24h: number;
      percentChange24h: number;
    };
  }[];
}

// Chat user interface 
export interface ChatUser {
  id: string;
  walletAddress: string;
  roomId: string;
}

// Socket singleton instance
let socket: Socket | null = null;

// Initialize socket connection
export const initializeSocket = (): Socket => {
  if (!socket) {
    // Get API URL from environment
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3080';
    
    console.log('Initializing socket connection to:', apiUrl);
    
    socket = io(apiUrl, {
      transports: ['websocket', 'polling'],
      withCredentials: true
    });
    
    // Log connection status
    socket.on(SocketEvents.CONNECT, () => {
      console.log('Connected to WebSocket server, socket id:', socket?.id);
    });
    
    socket.on(SocketEvents.DISCONNECT, (reason) => {
      console.log('Disconnected from WebSocket server, reason:', reason);
    });
    
    socket.on(SocketEvents.ERROR, (error) => {
      console.error('Socket error:', error);
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

// Clean up socket connection
export const disconnectSocket = (): void => {
  if (socket) {
    if (socket.connected && socket.id) {
      leaveChatRoom('global', socket.id, '');
    }
    socket.disconnect();
    socket = null;
  }
};

// Chat functions
// --------------------------------------

/**
 * Join a chat room
 * @param roomId the room to join, use 'global' for the main room
 * @param userId user ID from authentication
 * @param walletAddress user's wallet address
 */
export const joinChatRoom = (roomId: string, userId: string, walletAddress: string): void => {
  const socket = getSocket();
  
  if (!userId || !walletAddress) {
    console.warn('Cannot join chat: User ID or wallet address missing');
    return;
  }
  
  console.log(`Joining chat room: ${roomId}`);
  socket.emit(SocketEvents.CHAT_JOIN, { roomId, userId, walletAddress });
};

/**
 * Leave a chat room
 * @param roomId the room to leave
 * @param userId user ID
 * @param walletAddress user's wallet address
 */
export const leaveChatRoom = (roomId: string, userId: string, walletAddress: string): void => {
  const socket = getSocket();
  
  if (!socket.connected) {
    return;
  }
  
  console.log(`Leaving chat room: ${roomId}`);
  socket.emit(SocketEvents.CHAT_LEAVE, { roomId, userId, walletAddress });
};

/**
 * Send a chat message
 * @param roomId the room to send the message to
 * @param userId user ID
 * @param walletAddress user's wallet address
 * @param message the message text
 */
export const sendChatMessage = (roomId: string, userId: string, walletAddress: string, message: string): void => {
  const socket = getSocket();
  
  if (!socket.connected || !userId || !walletAddress || !message.trim()) {
    return;
  }
  
  const chatMessage: ChatMessage = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId,
    roomId,
    walletAddress,
    message: message.trim(),
    timestamp: Date.now()
  };
  
  console.log(`Sending message to room ${roomId}`);
  socket.emit(SocketEvents.CHAT_MESSAGE, chatMessage);
};

/**
 * Subscribe to chat messages
 * @param callback function to call when a new message is received
 */
export const subscribeToChatMessages = (callback: (message: ChatMessage) => void): () => void => {
  const socket = getSocket();
  socket.on(SocketEvents.CHAT_MESSAGE, callback);
  
  // Return cleanup function
  return () => {
    socket.off(SocketEvents.CHAT_MESSAGE, callback);
  };
};

/**
 * Subscribe to users joining the chat
 * @param callback function to call when a user joins
 */
export const subscribeToUserJoined = (callback: (data: { userId: string, walletAddress: string }) => void): () => void => {
  const socket = getSocket();
  socket.on(SocketEvents.CHAT_USER_JOINED, callback);
  
  // Return cleanup function
  return () => {
    socket.off(SocketEvents.CHAT_USER_JOINED, callback);
  };
};

/**
 * Subscribe to users leaving the chat
 * @param callback function to call when a user leaves
 */
export const subscribeToUserLeft = (callback: (data: { userId: string, walletAddress: string }) => void): () => void => {
  const socket = getSocket();
  socket.on(SocketEvents.CHAT_USER_LEFT, callback);
  
  // Return cleanup function
  return () => {
    socket.off(SocketEvents.CHAT_USER_LEFT, callback);
  };
};

/**
 * Subscribe to users list updates
 * @param callback function to call when the users list is updated
 */
export const subscribeToUsersList = (callback: (data: { users: ChatUser[] }) => void): () => void => {
  const socket = getSocket();
  socket.on(SocketEvents.CHAT_USERS_LIST, callback);
  
  // Return cleanup function
  return () => {
    socket.off(SocketEvents.CHAT_USERS_LIST, callback);
  };
};

// Game functions
// --------------------------------------

/**
 * Subscribe to match updates
 * @param callback function to call when a match update is received
 */
export const subscribeToMatchUpdates = (callback: (matchData: MatchData) => void): () => void => {
  const socket = getSocket();
  socket.on(SocketEvents.GAME_MATCH_UPDATE, callback);
  
  // Return cleanup function
  return () => {
    socket.off(SocketEvents.GAME_MATCH_UPDATE, callback);
  };
};

/**
 * Subscribe to chart data updates
 * @param callback function to call when chart data is received
 */
export const subscribeToChartData = (callback: (chartData: ChartData) => void): () => void => {
  const socket = getSocket();
  console.log('Subscribing to chart data updates, socket connected:', socket.connected);
  
  // Handler for chart data events
  const handleChartData = (data: ChartData) => {
    console.log('Received chart data event:', {
      matchId: data.matchId,
      fighters: data.fighters.map(f => f.fighterName)
    });
    callback(data);
  };
  
  // Subscribe to the event
  socket.on(SocketEvents.GAME_CHART_DATA, handleChartData);
  
  // Return cleanup function
  return () => {
    console.log('Unsubscribing from chart data updates');
    socket.off(SocketEvents.GAME_CHART_DATA, handleChartData);
  };
};

/**
 * Subscribe to match result updates
 * @param callback function to call when a match result is received
 */
export const subscribeToMatchResults = (callback: (data: { matchId: string, winner: string, status: string }) => void): () => void => {
  const socket = getSocket();
  socket.on(SocketEvents.GAME_MATCH_RESULT, callback);
  
  // Return cleanup function
  return () => {
    socket.off(SocketEvents.GAME_MATCH_RESULT, callback);
  };
};

/**
 * Subscribe to match status changes
 * @param callback function to call when a match status change is received
 */
export const subscribeToMatchStatusChanges = (callback: (data: { matchId: string, status: string }) => void): () => void => {
  const socket = getSocket();
  socket.on(SocketEvents.MATCH_STATUS_CHANGE, callback);
  
  // Return cleanup function
  return () => {
    socket.off(SocketEvents.MATCH_STATUS_CHANGE, callback);
  };
}; 