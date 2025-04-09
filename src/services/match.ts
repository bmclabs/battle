import { Fighter, GameMode, Match } from "../types";

// API URL from environment variable with fallback
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3080';

// API response interface based on Swagger documentation
interface CurrentMatchResponse {
  matchId: string;
  matchAccountPubkey: string;
  fighter1: string;
  fighter2: string;
  status: string;
  timeStart: string;
  winner: string;
  fighters: {
    name: string;
    coinId: number;
    image?: string;
    stats?: {
      attack: number;
      defense: number;
      speed: number;
      health: number;
    };
  }[];
}

/**
 * Maps API status to GameMode enum
 * @param status API status string
 * @returns GameMode enum value
 */
const mapStatusToGameMode = (status: string): GameMode => {
  switch (status.toLowerCase()) {
    case 'searching':
      return GameMode.SEARCHING;
    case 'preparation':
      return GameMode.PREPARATION;
    case 'battle':
      return GameMode.BATTLE;
    case 'claiming':
      return GameMode.CLAIMING;
    case 'completed':
      return GameMode.COMPLETED;
    case 'refund':
      return GameMode.REFUND;
    case 'refund_failed':
      return GameMode.REFUND_FAILED;
    case 'paused':
      return GameMode.PAUSED;
    default:
      return GameMode.PREPARATION;
  }
};

/**
 * Fetches the current active match from the arena
 * @returns Promise with the current match data
 */
export const fetchCurrentMatch = async (): Promise<Match> => {
  const response = await fetch(`${API_BASE_URL}/v1/auth/current-match`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('No active match found');
    }
    throw new Error(`Failed to fetch current match: ${response.status} ${response.statusText}`);
  }

  const matchData: CurrentMatchResponse = await response.json();

   // Map fighters from the response to Fighter objects
   const fighterMap: Record<string, Fighter> = {};
    
   matchData.fighters.forEach(fighter => {
     // Create Fighter object
     const fighterObj: Fighter = {
       name: fighter.name,
       coinId: fighter.coinId
     };
     
     fighterMap[fighter.name.toUpperCase()] = fighterObj;
   });

  // Convert response to Match interface
  const match: Match = {
    matchId: matchData.matchId,
    matchAccountPubkey: matchData.matchAccountPubkey,
    fighter1: matchData.fighter1,
    fighter2: matchData.fighter2,
    status: mapStatusToGameMode(matchData.status),
    winner: matchData.winner,
    startTime: new Date(matchData.timeStart).getTime(),
    fighters: matchData.fighters
  };
  
  return match;
};
