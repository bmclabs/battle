import { Fighter, GameMode, Match } from "../types";

// API URL from environment variable with fallback
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3080';

// API response interface based on Swagger documentation
interface CurrentMatchResponse {
  matchId: string;
  fighter1: string;
  fighter2: string;
  status: string;
  timeStart: string;
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
    case 'completed':
      return GameMode.COMPLETED;
    case 'refund':
      return GameMode.REFUND;
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
  const url = `${API_BASE_URL}/v1/arena/current-match`;
  
  try {
    const response = await fetch(url);
    
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
      // Create default placeholder stats if not provided
      const stats = fighter.stats || {
        attack: Math.round(Math.random() * 100),
        defense: Math.round(Math.random() * 100),
        speed: Math.round(Math.random() * 100),
        health: 100
      };
      
      // Create Fighter object
      const fighterObj: Fighter = {
        id: fighter.name.toLowerCase(), // Use lowercase name as ID
        name: fighter.name,
        image: fighter.image || `/fighters/${fighter.name.toLowerCase()}.png`, // Default image path
        stats
      };
      
      fighterMap[fighter.name.toLowerCase()] = fighterObj;
    });
    
    // Convert response to Match interface
    const match: Match = {
      id: matchData.matchId,
      fighter1: fighterMap[matchData.fighter1.toLowerCase()],
      fighter2: fighterMap[matchData.fighter2.toLowerCase()],
      status: mapStatusToGameMode(matchData.status),
      startTime: new Date(matchData.timeStart).getTime(),
      endTime: null,
      totalBetsFighter1: 0, // These will be populated from another source
      totalBetsFighter2: 0,
      winner: null
    };
    
    return match;
  } catch (error) {
    console.error('Error fetching current match:', error);
    throw error;
  }
};
