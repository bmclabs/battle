// Game state types
export enum GameMode {
  PREPARATION = 'preparation',
  BATTLE = 'battle',
  RESULT = 'result'
}

export interface Fighter {
  id: string;
  name: string;
  image: string;
  stats: {
    attack: number;
    defense: number;
    speed: number;
    health: number;
  };
}

export interface Match {
  id: string;
  fighter1: Fighter;
  fighter2: Fighter;
  totalBetsFighter1: number;
  totalBetsFighter2: number;
  winner: string | null;
  status: GameMode;
  startTime: number;
  endTime: number | null;
}

// Betting types
export interface Bet {
  walletAddress: string;
  amount: number;
  fighterId: string;
  timestamp: number;
}

// Chat types
export interface ChatMessage {
  id: string;
  walletAddress: string;
  message: string;
  timestamp: number;
}

// Chart types
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
  }[];
} 