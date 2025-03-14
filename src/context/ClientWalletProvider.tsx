'use client';

import { FC, ReactNode } from 'react';
import WalletContextProvider from './WalletContextProvider';

interface ClientWalletProviderProps {
  children: ReactNode;
}

export const ClientWalletProvider: FC<ClientWalletProviderProps> = ({ children }) => {
  return <WalletContextProvider>{children}</WalletContextProvider>;
};

export default ClientWalletProvider; 