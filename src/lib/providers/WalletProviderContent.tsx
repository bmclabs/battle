'use client';

import React, { ReactNode, useMemo } from 'react';
import { ConnectionProvider, WalletProvider as SolanaWalletProvider } from '@solana/wallet-adapter-react';
import {
    PhantomWalletAdapter,
    SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { WalletAuthProvider } from '../context/WalletContext';
import WalletAuthModalController from './WalletAuthModalController';
import { clusterApiUrl } from '@solana/web3.js';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

// Default styles from Solana wallet adapter
import '@solana/wallet-adapter-react-ui/styles.css';

interface WalletProviderContentProps {
    children: ReactNode;
}

export default function WalletProviderContent({ children }: WalletProviderContentProps) {
    // Get the network from environment variables
    const networkEnv = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet';
    const network = networkEnv === 'mainnet-beta' 
        ? WalletAdapterNetwork.Mainnet 
        : networkEnv === 'testnet' 
            ? WalletAdapterNetwork.Testnet 
            : WalletAdapterNetwork.Devnet;
    
    // Get endpoint for the selected network
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);

    // Initialize the supported wallet adapters
    const wallets = useMemo(() => [
        new PhantomWalletAdapter(),
        new SolflareWalletAdapter(),
        // Note: Backpack wallet is supported via the Phantom adapter
    ], []);

    return (
        <ConnectionProvider endpoint={endpoint}>
            <SolanaWalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                    <WalletAuthProvider>
                        <WalletAuthModalController />
                        {children}
                    </WalletAuthProvider>
                </WalletModalProvider>
            </SolanaWalletProvider>
        </ConnectionProvider>
    );
} 