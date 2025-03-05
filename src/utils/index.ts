import { Bet } from "../types";

// Format wallet address to show only first and last few characters
export const formatWalletAddress = (address: string): string => {
  if (!address) return '';
  return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
};

// Format SOL amount with 2 decimal places
export const formatSolAmount = (amount: number): string => {
  return amount.toFixed(2);
};

// Calculate proportional winnings based on bet amount and total bets
export const calculateWinnings = (
  bet: Bet,
  totalBetsWinner: number,
  totalBetsLoser: number
): number => {
  // Calculate proportion of the bet to total bets on the winning side
  const proportion = bet.amount / totalBetsWinner;
  
  // Calculate winnings (original bet + proportion of losing side's bets)
  const winnings = bet.amount + proportion * totalBetsLoser;
  
  return parseFloat(winnings.toFixed(2));
};

// Generate random stats for fighters based on chart data
export const generateStatsFromChart = (
  chartData: number[]
): { attack: number; defense: number; speed: number; health: number } => {
  // Use chart data to generate stats
  // This is a simplified example - you would use actual chart data patterns
  const max = Math.max(...chartData);
  const min = Math.min(...chartData);
  const avg = chartData.reduce((sum, val) => sum + val, 0) / chartData.length;
  const volatility = chartData.reduce((sum, val) => sum + Math.abs(val - avg), 0) / chartData.length;
  
  return {
    attack: Math.floor((max / (max - min + 1)) * 100),
    defense: Math.floor((min / (max - min + 1) + 0.5) * 100),
    speed: Math.floor((volatility / (max - min + 1) + 0.5) * 100),
    health: Math.floor(((avg - min) / (max - min + 1) + 0.5) * 100),
  };
};

// Truncate text with ellipsis
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}; 