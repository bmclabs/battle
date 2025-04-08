'use client';

import React from 'react';
import { useTokenAccount } from '@/lib/hooks/useTokenAccounts';

interface TokenBalanceProps {
  mint: string;
  symbol?: string;
  className?: string;
  showSymbol?: boolean;
  decimals?: number;
}

/**
 * Component to display a token balance
 */
export default function TokenBalance({
  mint,
  symbol = 'tokens',
  className = '',
  showSymbol = true,
  decimals = 2,
}: TokenBalanceProps) {
  const { balance, isLoading, error } = useTokenAccount(mint);

  if (error) {
    return <span className={`text-red-500 ${className}`}>Error</span>;
  }

  if (isLoading) {
    return <span className={`opacity-70 ${className}`}>Loading...</span>;
  }

  // Format balance with specified decimal places
  const formattedBalance = balance.toFixed(decimals);
  
  return (
    <span className={className}>
      {formattedBalance}
      {showSymbol && ` ${symbol}`}
    </span>
  );
} 