// Game state types
export enum GameMode {
  SEARCHING = 'searching',
  PREPARATION = 'preparation',
  BATTLE = 'battle',
  CLAIMING = 'claiming',
  COMPLETED = 'completed',
  REFUND = 'refund',
  REFUND_FAILED = 'refund_failed',
  PAUSED = 'paused',
  BATTLE_FAILED = 'battle_failed',
  END_FAILED = 'end_failed',
  CLAIM_FAILED = 'claim_failed'
}

export interface Fighter {
  name: string;
  coinId: number;
}

export interface Match {
  matchId: string;
  matchAccountPubkey?: string;
  fighter1: string;
  fighter2: string;
  winner: string | null;
  status: GameMode;
  startTime: number;
  fighters: { name: string; coinId: number }[];
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
  userId?: string;
  roomId?: string;
  walletAddress: string;
  username?: string;
  message: string;
  timestamp: number;
}

export interface ChatUser {
  id: string;
  walletAddress: string;
  roomId: string;
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