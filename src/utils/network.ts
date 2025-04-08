/**
 * Network and RPC URL utility functions
 */

import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { clusterApiUrl } from '@solana/web3.js';

// Get the current Solana cluster from environment variables
export const getCurrentCluster = (): WalletAdapterNetwork => {
  return (process.env.NEXT_PUBLIC_SOLANA_NETWORK as WalletAdapterNetwork) || 
    WalletAdapterNetwork.Devnet;
};

// Get RPC URL for Helius
export const getHeliusRpcUrl = (): string | null => {
  const apiKey = process.env.NEXT_PUBLIC_HELIUS_API_KEY;
  if (!apiKey) {
    return null;
  }
  
  const cluster = getCurrentCluster();
  if (cluster === 'mainnet-beta') {
    return `https://mainnet.helius-rpc.com/?api-key=${apiKey}`;
  } else if (cluster === 'devnet') {
    return `https://devnet.helius-rpc.com/?api-key=${apiKey}`;
  }
  return null;
};

// Get RPC URL for QuickNode
export const getQuickNodeRpcUrl = (): string | null => {
  const apiKey = process.env.NEXT_PUBLIC_QUICKNODE_API_KEY;
  if (!apiKey) {
    return null;
  }
  
  const cluster = getCurrentCluster();
  if (cluster === 'mainnet-beta') {
    return `https://api.quicknode.com/solana/${apiKey}`;
  } else if (cluster === 'devnet') {
    return `https://api.devnet.solana.com`;
  }
  return null;
};

// Get RPC URL for custom provider
export const getCustomRpcUrl = (): string | null => {
  const cluster = getCurrentCluster();
  if (cluster === 'mainnet-beta' && process.env.NEXT_PUBLIC_MAINNET_RPC_URL) {
    // Don't use the default Solana endpoint which returns 403
    if (process.env.NEXT_PUBLIC_MAINNET_RPC_URL !== 'https://api.mainnet-beta.solana.com') {
      return process.env.NEXT_PUBLIC_MAINNET_RPC_URL;
    }
    return null;
  } else if (cluster === 'devnet' && process.env.NEXT_PUBLIC_DEVNET_RPC_URL) {
    return process.env.NEXT_PUBLIC_DEVNET_RPC_URL;
  }
  return null;
};

/**
 * Get RPC endpoints with priority
 * @returns Array of RPC endpoints in priority order
 */
export const getRpcEndpoints = (): string[] => {
  const cluster = getCurrentCluster();
  const endpoints: string[] = [];
  
  // Add Helius RPC URL if available (highest priority)
  const heliusRpc = getHeliusRpcUrl();
  if (heliusRpc) {
    endpoints.push(heliusRpc);
  }
  
  // Add custom RPC URL if available
  const customRpc = process.env.NEXT_PUBLIC_SOLANA_RPC_URL;
  if (customRpc) {
    endpoints.push(customRpc);
  }
  
  // Add QuickNode RPC URL if available
  const quickNodeApiKey = process.env.NEXT_PUBLIC_QUICKNODE_API_KEY;
  if (quickNodeApiKey && cluster === 'mainnet-beta') {
    endpoints.push(`https://api.quicknode.com/solana/${quickNodeApiKey}`);
  }
  
  // Add public RPC endpoints as fallbacks
  if (cluster === 'mainnet-beta') {
    endpoints.push(
      'https://api.mainnet-beta.solana.com',
      'https://solana-api.projectserum.com',
      'https://rpc.ankr.com/solana'
    );
  } else if (cluster === 'devnet') {
    endpoints.push(
      'https://api.devnet.solana.com',
      'https://devnet.genesysgo.net'
    );
  } else {
    // Testnet or other networks
    endpoints.push(clusterApiUrl(cluster));
  }
  
  return endpoints;
};

/**
 * Get the best RPC URL based on priority
 * @returns The best available RPC URL
 */
export const getBestRpcUrl = (): string => {
  const endpoints = getRpcEndpoints();
  return endpoints[0] || clusterApiUrl(getCurrentCluster());
}; 