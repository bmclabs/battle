// Game state types
export enum GameMode {
  SEARCHING = 'searching',
  PREPARATION = 'preparation',
  BATTLE = 'battle',
  COMPLETED = 'completed',
  REFUND = 'refund',
  REFUND_FAILED = 'refund-failed',
  PAUSED = 'paused'
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
  matchAccountPubkey?: string;
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
  id: string;
  matchId: string;
  walletAddress: string;
  amount: number;
  fighterId: string;
  fighterName: string;
  timestamp: number;
  status: string;
  transactionSignature?: string;
  claimed: boolean;
}

export interface BetSignature {
  betId: string;
  signature: string;
  instructions: {
    programId: string;
    treasuryWallet: string;
  };
}

export interface MatchBettingSummary {
  matchId: string;
  totalBets: number;
  totalAmount: string;
  fighters: Record<string, {
    totalBets: number;
    totalAmount: string | number;
  }>;
  userBets?: {
    walletAddress: string;
    fighterName: string;
    amount: string;
  }[];
}

// Chat types
export interface ChatMessage {
  id: string;
  walletAddress: string;
  message: string;
  timestamp: number;
}

// Chart types
export interface CoinMarketData {
  price: number;
  marketCap: number;
  volume24h: number;
  percentChange24h: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
  }[];
  marketData?: CoinMarketData;
  timeRange?: {
    start: string;
    end: string;
  };
} 