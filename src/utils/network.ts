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

// Get RPC URL for Helius (using proxy to protect API key)
export const getHeliusRpcUrl = (): string | null => {
  // Return the full URL to the local API endpoint that will proxy requests to Helius
  // This keeps the API key secure on the server side
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/api/rpc`;
  }
  // For server-side rendering, we need to use a default URL or return null
  return null;
};

// Get RPC URL for QuickNode
export const getQuickNodeRpcUrl = (): string | null => {
  // Use a proxy for QuickNode too instead of exposing API key
  const cluster = getCurrentCluster();
  if (cluster === 'mainnet-beta') {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/api/rpc/quicknode`;
    }
    return null;
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
      // If using an API key in the URL, use a proxy instead
      if (process.env.NEXT_PUBLIC_MAINNET_RPC_URL.includes('api-key')) {
        if (typeof window !== 'undefined') {
          return `${window.location.origin}/api/rpc/custom`;
        }
        return null;
      }
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
  if (heliusRpc && (heliusRpc.startsWith('http://') || heliusRpc.startsWith('https://'))) {
    endpoints.push(heliusRpc);
  }
  
  // Add custom RPC URL if available
  const customRpc = getCustomRpcUrl();
  if (customRpc && (customRpc.startsWith('http://') || customRpc.startsWith('https://'))) {
    endpoints.push(customRpc);
  }
  
  // Add QuickNode RPC URL if available
  const quickNodeRpc = getQuickNodeRpcUrl();
  if (quickNodeRpc && (quickNodeRpc.startsWith('http://') || quickNodeRpc.startsWith('https://'))) {
    endpoints.push(quickNodeRpc);
  }
  
  // Add public RPC endpoints as fallbacks
  if (cluster === 'devnet') {
    endpoints.push(
      'https://api.devnet.solana.com',
      'https://devnet.genesysgo.net'
    );
  } else if (cluster !== 'mainnet-beta') {
    // Testnet or other networks
    endpoints.push(clusterApiUrl(cluster));
  } else {
    // Always include public mainnet endpoint as fallback
    endpoints.push('https://api.mainnet-beta.solana.com');
  }
  
  return endpoints;
};

/**
 * Get the best RPC URL based on priority
 * @returns The best available RPC URL
 */
export const getBestRpcUrl = (): string => {
  const endpoints = getRpcEndpoints();
  
  // Filter to ensure we only have valid URLs
  const validEndpoints = endpoints.filter(url => 
    url && (url.startsWith('http://') || url.startsWith('https://'))
  );
  
  return validEndpoints.length > 0 
    ? validEndpoints[0] 
    : clusterApiUrl(getCurrentCluster());
}; 