'use client';

import { FC, ReactNode } from 'react';
import WalletProvider from '@/lib/providers/WalletProvider';
import { ToastProvider } from '@/lib/providers/ToastProvider';

interface ClientWalletProviderProps {
  children: ReactNode;
}

export const ClientWalletProvider: FC<ClientWalletProviderProps> = ({ children }) => {
  return (
    <ToastProvider>
      <WalletProvider>{children}</WalletProvider>
    </ToastProvider>
  );
};

export default ClientWalletProvider; 