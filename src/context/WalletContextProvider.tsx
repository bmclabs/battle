'use client';

import { FC, ReactNode, useMemo, useState } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { getBestRpcUrl, getCurrentCluster } from '@/utils/network';

// Import the default styles
import '@solana/wallet-adapter-react-ui/styles.css';

interface WalletContextProviderProps {
  children: ReactNode;
}

export const WalletContextProvider: FC<WalletContextProviderProps> = ({ children }) => {
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Get the best available RPC endpoint (prioritizing Helius for mainnet)
  const endpoint = useMemo(() => {
    try {
      const url = getBestRpcUrl();
      setConnectionError(null);
      return url;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown connection error';
      setConnectionError(errorMessage);
      
      // For mainnet, return a placeholder URL that won't be used due to the error boundary
      // For devnet, we can fall back to the default endpoint
      const cluster = getCurrentCluster();
      if (cluster === 'mainnet-beta') {
        console.error('RPC Connection Error:', errorMessage);
        return 'https://placeholder-url-due-to-error.com';
      }
      return `https://api.${cluster}.solana.com`;
    }
  }, []);

  // @solana/wallet-adapter-wallets includes all the adapters but supports tree shaking
  // and lazy loading -- only the wallets you configure here will be compiled into your
  // application, and only the dependencies of wallets that your users connect to will be
  // loaded
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );

  // Display an error message if there's a connection error
  if (connectionError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
        <div className="max-w-md p-6 bg-red-900 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold mb-4">RPC Connection Error</h1>
          <p className="mb-4">
            Unable to connect to Solana network. This is likely because a valid Helius API key is required for mainnet operations.
          </p>
          <p className="text-sm mb-4 font-mono bg-black p-3 rounded">
            Error: {connectionError}
          </p>
          <p>
            Please make sure you have configured a valid Helius API key in your environment variables. 
            See the README.md file for more information.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default WalletContextProvider; 