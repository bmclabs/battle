import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { rpcService } from '@/lib/services/rpcService';

export interface TokenAccount {
  pubkey: PublicKey;
  mint: string;
  owner: string;
  amount: string;
  decimals: number;
}

// Interface for token account response from RPC
interface ParsedTokenAccountItem {
  pubkey: PublicKey;
  account: {
    data: {
      parsed: {
        info: {
          mint: string;
          owner: string;
          tokenAmount: {
            amount: string;
            decimals: number;
          };
        };
      };
    };
  };
}

/**
 * Hook to fetch SPL token accounts for a wallet
 * @param specificMint Optional specific mint to filter for
 * @returns Token accounts and loading state
 */
export function useTokenAccounts(specificMint?: string) {
  const { publicKey, connected } = useWallet();
  const [tokenAccounts, setTokenAccounts] = useState<TokenAccount[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTokenAccounts = async () => {
      if (!connected || !publicKey) {
        setTokenAccounts([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        let filterMint: PublicKey | undefined;
        if (specificMint) {
          try {
            filterMint = new PublicKey(specificMint);
          } catch (err) {
            console.error('Invalid mint address', err);
            setError('Invalid mint address');
            setIsLoading(false);
            return;
          }
        }

        // Get token accounts using rpcService with fallback
        const response = await rpcService.getParsedTokenAccountsByOwner(
          publicKey,
          filterMint
        );

        // Format the response
        const formattedAccounts = response.value.map((item: ParsedTokenAccountItem) => {
          const accountData = item.account.data.parsed.info;
          return {
            pubkey: item.pubkey,
            mint: accountData.mint,
            owner: accountData.owner,
            amount: accountData.tokenAmount.amount,
            decimals: accountData.tokenAmount.decimals,
          };
        });

        setTokenAccounts(formattedAccounts);
      } catch (err) {
        console.error('Error fetching token accounts:', err);
        setError('Failed to fetch token accounts');
        setTokenAccounts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTokenAccounts();

    // Set up interval to refresh token accounts every 30 seconds if wallet is connected
    const interval = setInterval(() => {
      if (connected && publicKey) {
        fetchTokenAccounts();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [publicKey, connected, specificMint]);

  return { tokenAccounts, isLoading, error };
}

/**
 * Hook to fetch a specific token account
 * @param mintAddress The mint address of the token
 * @returns Token account, loading state, and balance in human readable format
 */
export function useTokenAccount(mintAddress: string) {
  const { tokenAccounts, isLoading, error } = useTokenAccounts(mintAddress);
  
  // Find the first account with the specified mint
  const tokenAccount = tokenAccounts.length > 0 ? tokenAccounts[0] : null;
  
  // Calculate human readable balance
  const balance = tokenAccount 
    ? parseFloat(tokenAccount.amount) / Math.pow(10, tokenAccount.decimals)
    : 0;

  return { 
    tokenAccount, 
    balance, 
    isLoading, 
    error 
  };
} 