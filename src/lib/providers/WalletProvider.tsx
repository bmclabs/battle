'use client';

import React, { ReactNode } from 'react';
import dynamic from 'next/dynamic';

// placeholder for component that will be loaded dynamically
const WalletProviderContent = dynamic(
  () => import('./WalletProviderContent'),
  { 
    ssr: false,
    loading: () => <div className="bg-black text-white min-h-screen"></div>
  }
);

interface WalletProviderProps {
  children: ReactNode;
}

export default function WalletProvider({ children }: WalletProviderProps) {
  return <WalletProviderContent>{children}</WalletProviderContent>;
} 