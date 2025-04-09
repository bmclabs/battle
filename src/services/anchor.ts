import { 
  PublicKey, 
  SystemProgram, 
  LAMPORTS_PER_SOL,
  ConfirmOptions,
  TransactionExpiredTimeoutError
} from '@solana/web3.js';
import { 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  AnchorProvider, 
  web3, 
  BN 
} from '@coral-xyz/anchor';
import { WalletContextState } from '@solana/wallet-adapter-react';
import { rpcService, createConnection } from '@/lib/services/rpcService';

// Get program ID from environment variables
const PROGRAM_ID = new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID || '');

// Custom confirmation options with longer timeout (120 seconds instead of default 30)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const CUSTOM_CONFIRM_OPTIONS: ConfirmOptions = {
  commitment: 'confirmed',
  preflightCommitment: 'processed',
  skipPreflight: false,
  maxRetries: 5
};

/**
 * Get the house wallet PDA
 */
export async function getHouseWalletPDA(): Promise<[PublicKey, number]> {
  return await PublicKey.findProgramAddressSync(
    [Buffer.from("house")],
    PROGRAM_ID
  );
}

/**
 * Wait for transaction confirmation manually without using WebSockets
 * This is a more reliable method for checking transaction status
 */
async function manualConfirmTransaction(
  signature: string,
  maxAttempts = 5, // Reduce number of attempts to avoid too many RPC calls
  intervalMs = 2000 // 2 seconds between checks
): Promise<boolean> {
  console.log(`Manually checking transaction ${signature}...`);
  
  // Create a connection with WebSocket disabled
  const connection = createConnection();
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      // Use direct REST-API call without WebSocket
      const status = await connection.getSignatureStatus(signature, {searchTransactionHistory: true});
      
      if (status && status.value) {
        if (status.value.confirmationStatus === 'confirmed' || 
            status.value.confirmationStatus === 'finalized') {
          console.log(`Transaction ${signature} confirmed (attempt ${attempt + 1})`);
          return true;
        } else if (status.value.err) {
          console.error(`Transaction ${signature} failed with error:`, status.value.err);
          return false;
        }
      }
      
      // If transaction is not yet confirmed, wait and try again
      console.log(`Transaction not yet confirmed... Attempt ${attempt + 1}/${maxAttempts}`);
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    } catch (error) {
      console.error(`Error checking transaction status (attempt ${attempt + 1})`, error);
      
      // Only wait and try again if we have attempts left
      if (attempt < maxAttempts - 1) {
        await new Promise(resolve => setTimeout(resolve, intervalMs));
      }
    }
  }
  
  // If we get here, we couldn't confirm the transaction
  // But we'll assume it went through and let the backend verify
  console.log(`Couldn't confirm transaction ${signature} after ${maxAttempts} attempts, but it may still be processing`);
  return true;
}

/**
 * Place a bet using the Anchor program
 * @param wallet The wallet context state
 * @param matchId The match ID
 * @param matchAccountPubkey The public key of the match account
 * @param fighter The fighter name
 * @param amount The bet amount in SOL
 * @returns The transaction signature
 */
export async function placeBetOnChain(
  wallet: WalletContextState,
  matchId: string,
  matchAccountPubkey: string,
  fighter: string,
  amount: number
): Promise<string> {
  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error('Wallet not connected');
  }

  try {
    // Get connection with WebSocket disabled to prevent connection errors
    const connection = createConnection();
    
    // Create a Transaction object
    const transaction = new web3.Transaction();
    
    // Get recent blockhash with longer validity
    const recentBlockhash = await rpcService.getRecentBlockhash();
    transaction.recentBlockhash = recentBlockhash.blockhash;
    transaction.lastValidBlockHeight = recentBlockhash.lastValidBlockHeight;
    transaction.feePayer = wallet.publicKey;
    
    // Convert amount to lamports
    const amountLamports = new BN(amount * LAMPORTS_PER_SOL);
    
    // Get house wallet PDA
    const [houseWallet] = await getHouseWalletPDA();
    
    // Use provided match account public key
    const matchAccount = new PublicKey(matchAccountPubkey);
    
    // Properly encode data for Anchor
    // Anchor expects strings to be prefixed with their length
    const matchIdBytes = new TextEncoder().encode(matchId);
    const fighterBytes = new TextEncoder().encode(fighter);
    
    // Create buffer for instruction data
    // Format:
    // - 8 bytes: discriminator
    // - 4 bytes: match ID length
    // - N bytes: match ID
    // - 4 bytes: fighter length
    // - N bytes: fighter
    // - 8 bytes: amount in lamports
    
    const dataLayout = new Uint8Array(
      8 + // discriminator
      4 + matchIdBytes.length + // match ID with length prefix
      4 + fighterBytes.length + // fighter with length prefix
      8   // amount in lamports
    );
    
    // Add discriminator
    dataLayout.set([222, 62, 67, 220, 63, 166, 126, 33], 0); // place_bet discriminator
    
    // Add match ID length (as u32 little endian)
    dataLayout.set(new Uint8Array([
      matchIdBytes.length & 0xff,
      (matchIdBytes.length >> 8) & 0xff,
      (matchIdBytes.length >> 16) & 0xff,
      (matchIdBytes.length >> 24) & 0xff
    ]), 8);
    
    // Add match ID bytes
    dataLayout.set(matchIdBytes, 8 + 4);
    
    // Add fighter length (as u32 little endian)
    dataLayout.set(new Uint8Array([
      fighterBytes.length & 0xff,
      (fighterBytes.length >> 8) & 0xff,
      (fighterBytes.length >> 16) & 0xff,
      (fighterBytes.length >> 24) & 0xff
    ]), 8 + 4 + matchIdBytes.length);
    
    // Add fighter bytes
    dataLayout.set(fighterBytes, 8 + 4 + matchIdBytes.length + 4);
    
    // Add amount (8 bytes, little endian)
    const amountBytes = amountLamports.toArray('le', 8);
    dataLayout.set(amountBytes, 8 + 4 + matchIdBytes.length + 4 + fighterBytes.length);
    
    const placeBetIx = new web3.TransactionInstruction({
      programId: PROGRAM_ID,
      keys: [
        { pubkey: matchAccount, isSigner: false, isWritable: true },
        { pubkey: houseWallet, isSigner: false, isWritable: true },
        { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
      ],
      data: Buffer.from(dataLayout)
    });
    
    transaction.add(placeBetIx);
    
    console.log('Placing bet on-chain...');
    
    try {
      // Only sign transaction with wallet - this will prompt the user
      const signedTransaction = await wallet.signTransaction(transaction);
      
      // Send signed transaction and get signature without waiting for confirmation
      // This avoids WebSocket connections and polling
      const signature = await connection.sendRawTransaction(
        signedTransaction.serialize(),
        { skipPreflight: false, preflightCommitment: 'processed' }
      );
      
      console.log(`Transaction sent with signature: ${signature}`);
      
      // Do a light status check (not using WebSockets)
      // This is optional and doesn't block the return of the signature
      setTimeout(async () => {
        try {
          const confirmed = await manualConfirmTransaction(signature, 3, 2000);
          console.log(`Transaction ${signature} confirmation check: ${confirmed ? 'successful' : 'still pending'}`);
        } catch (confirmError) {
          console.error('Error during light confirmation check:', confirmError);
          // Continue despite error - backend will verify
        }
      }, 500);
      
      // Return the signature immediately without waiting for confirmation
      // The backend will verify the transaction separately
      return signature;
    } catch (error: unknown) {
      // Handle specific errors
      if (error instanceof TransactionExpiredTimeoutError) {
        console.error('Transaction timeout:', error);
        throw new Error('Transaction timed out. The Solana network may be congested. Please try again later.');
      }
      
      // Check for specific error codes
      const errorWithMessage = error as { message?: string, code?: string };
      if (errorWithMessage.message && typeof errorWithMessage.message === 'string') {
        if (errorWithMessage.message.includes('custom program error: 0x1776') || 
            errorWithMessage.message.includes('Error Code: AlreadyBet') || 
            errorWithMessage.message.includes('Error Number: 6006')) {
          console.error('RPC already bet error:', error);
          // Throw special error for already bet that can be caught by transaction handler
          const alreadyBetError = new Error('You have already placed a bet in this match');
          // @ts-expect-error - Adding custom property to identify error type
          alreadyBetError.code = 'ALREADY_BET';
          throw alreadyBetError;
        } else if (errorWithMessage.message.includes('User rejected')) {
          throw new Error('Transaction was cancelled by user');
        } else if (errorWithMessage.message.includes('insufficient funds')) {
          throw new Error('You don\'t have enough SOL in your wallet to place this bet');
        }
      }
      
      console.error('Blockchain transaction error:', error);
      throw error;
    }
  } catch (error) {
    console.error('Failed to place bet on-chain:', error);
    throw error;
  }
} 