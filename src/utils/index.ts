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