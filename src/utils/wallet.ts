/**
 * Format a wallet address for display by truncating the middle part
 * @param address Wallet address to format
 * @param leadingChars Number of characters to show at the beginning
 * @param trailingChars Number of characters to show at the end
 * @returns Formatted wallet address
 */
export function formatWalletAddress(
  address?: string | null,
  leadingChars = 4,
  trailingChars = 4
): string {
  if (!address) return '';
  
  if (address.length <= leadingChars + trailingChars) {
    return address;
  }
  
  return `${address.slice(0, leadingChars)}...${address.slice(-trailingChars)}`;
}

/**
 * Validates if the input is a valid Solana address
 * @param address Address to validate
 * @returns Whether the address is valid
 */
export function isValidSolanaAddress(address: string): boolean {
  // Solana addresses are base58 encoded and 44 characters long
  // Regular expression for base58 validation
  return /^[1-9A-HJ-NP-Za-km-z]{43,44}$/.test(address);
}

/**
 * Check if the browser has any Solana wallet extension installed
 * @returns Whether a wallet extension is detected
 */
export function detectWalletExtension(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check for common wallet adapters
  return !!(
    window.solana || // Phantom, Solflare, etc.
    window.solflare ||
    window.backpack
  );
}

/**
 * Guess the wallet provider name based on window objects
 * @returns The name of the detected wallet provider or null
 */
export function guessWalletProvider(): string | null {
  if (typeof window === 'undefined') return null;
  
  if (window.phantom) return 'Phantom';
  if (window.solflare) return 'Solflare';
  if (window.backpack) return 'Backpack';
  if (window.solana) {
    // Try to guess based on solana object properties
    const solana = window.solana;
    if (solana.isPhantom) return 'Phantom';
    if (solana.isSolflare) return 'Solflare';
  }
  
  return window.solana ? 'Solana Wallet' : null;
}

// Add window type definitions
declare global {
  interface Window {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    solana?: any;
    /* eslint-disable @typescript-eslint/no-explicit-any */
    phantom?: any;
    /* eslint-disable @typescript-eslint/no-explicit-any */
    solflare?: any;
    /* eslint-disable @typescript-eslint/no-explicit-any */
    backpack?: any;
  }
} 