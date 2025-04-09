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
import { getBestRpcUrl } from '@/utils/network';

// Default styles from Solana wallet adapter
import '@solana/wallet-adapter-react-ui/styles.css';

interface WalletProviderContentProps {
    children: ReactNode;
}

export default function WalletProviderContent({ children }: WalletProviderContentProps) {
    // Network settings for devnet/mainnet
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const network = process.env.NEXT_PUBLIC_NETWORK || 'mainnet-beta';
    
    // Get endpoint using our secure RPC utility that protects API keys
    const endpoint = useMemo(() => getBestRpcUrl(), []);

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