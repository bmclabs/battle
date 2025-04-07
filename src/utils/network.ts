/**
 * Network and RPC URL utility functions
 */

// Get current cluster from environment variables
export const getCurrentCluster = (): string => {
  return process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet';
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
    return `https://api.devnet.solana.com`;
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

// Get the best available RPC URL
export const getBestRpcUrl = (): string => {
  const cluster = getCurrentCluster();
  
  if (cluster === 'mainnet-beta') {
    // For mainnet, always prioritize Helius and never fall back to default endpoint
    const heliusUrl = getHeliusRpcUrl();
    if (heliusUrl) return heliusUrl;
    
    // If Helius is not available, try custom URL
    const customUrl = getCustomRpcUrl();
    if (customUrl) return customUrl;
    
    // If custom URL is not available, try QuickNode
    const quickNodeUrl = getQuickNodeRpcUrl();
    if (quickNodeUrl) return quickNodeUrl;
    
    // If no valid RPC endpoint is available, throw an error
    throw new Error('No valid RPC endpoint available for mainnet. Please configure NEXT_PUBLIC_HELIUS_API_KEY.');
  } else {
    // For devnet, we can still use fallbacks
    const heliusUrl = getHeliusRpcUrl();
    if (heliusUrl) return heliusUrl;
    
    const customUrl = getCustomRpcUrl();
    if (customUrl) return customUrl;
    
    const quickNodeUrl = getQuickNodeRpcUrl();
    if (quickNodeUrl) return quickNodeUrl;
    
    // Fallback to default Solana endpoint only for devnet
    return `https://api.${cluster}.solana.com`;
  }
}; 