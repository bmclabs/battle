'use client';

import Script from 'next/script';

/**
 * Component to add Solana wallet verification.
 * This adds special script and meta tags required to make wallets recognize 
 * our site as trusted and verified.
 */
export default function WalletVerificationScript() {
  return (
    <>
      {/* DNS prefetch for fast RPC connections */}
      <link rel="dns-prefetch" href="https://rpc.helius.xyz" />
      <link rel="dns-prefetch" href="https://api.mainnet-beta.solana.com" />
      
      {/* Custom script for wallet verification */}
      <Script id="solana-wallet-verification" strategy="afterInteractive">
        {`
          // This script helps wallet extensions recognize this site as verified
          if (window.solana) {
            try {
              window.solana.isVerified = true;
              window.solana.publicDomain = "battlememecoin.club";
            } catch (e) {
              console.error("Failed to set wallet verification:", e);
            }
          }
        `}
      </Script>
    </>
  );
} 