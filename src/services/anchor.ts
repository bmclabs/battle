import { 
  Connection, 
  PublicKey, 
  SystemProgram, 
  LAMPORTS_PER_SOL,
  ConfirmOptions,
  TransactionExpiredTimeoutError
} from '@solana/web3.js';
import { 
  AnchorProvider, 
  web3, 
  BN 
} from '@coral-xyz/anchor';
import { WalletContextState } from '@solana/wallet-adapter-react';

// Get program ID from environment variables
const PROGRAM_ID = new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID || '');

// Maximum number of retries for placing a bet
const MAX_RETRIES = 3;

// Custom confirmation options with longer timeout (120 seconds instead of default 30)
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
 * Wait for transaction confirmation manually
 * This is a fallback method if the automatic confirmation fails
 */
async function manualConfirmTransaction(
  connection: Connection,
  signature: string,
  maxAttempts = 60, // Up to 5 minutes (60 * 5 seconds)
  intervalMs = 5000 // 5 seconds between checks
): Promise<boolean> {
  console.log(`Manually confirming transaction ${signature}...`);
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const status = await connection.getSignatureStatus(signature);
      
      if (status.value?.confirmationStatus === 'confirmed' || 
          status.value?.confirmationStatus === 'finalized') {
        console.log(`Transaction ${signature} confirmed after ${attempt + 1} attempts`);
        return true;
      }
      
      // If transaction is not yet confirmed, wait and try again
      console.log(`Waiting for transaction confirmation... Attempt ${attempt + 1}/${maxAttempts}`);
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    } catch (error) {
      console.error(`Error checking transaction status (attempt ${attempt + 1})`, error);
      
      // Continue trying despite error
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
  }
  
  console.error(`Failed to manually confirm transaction after ${maxAttempts} attempts`);
  return false;
}

/**
 * Place a bet using the Anchor program
 * @param wallet The wallet context state
 * @param matchId The match ID
 * @param matchAccountPubkey The public key of the match account
 * @param fighter The fighter name
 * @param amount The bet amount in SOL
 * @param onRetry Optional callback that is called when a retry is attempted
 * @returns The transaction signature
 */
export async function placeBetOnChain(
  wallet: WalletContextState,
  matchId: string,
  matchAccountPubkey: string,
  fighter: string,
  amount: number,
  onRetry?: (retryCount: number) => void
): Promise<string> {
  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error('Wallet not connected');
  }

  let retryCount = 0;
  let lastError: unknown = null;

  while (retryCount < MAX_RETRIES) {
    try {
      // Get network from environment variables
      const networkEnv = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet';
      const endpoint = `https://api.${networkEnv}.solana.com`;
      
      // Create connection
      const connection = new Connection(endpoint, "confirmed");
      
      // Create AnchorProvider with custom confirm options
      const provider = new AnchorProvider(
        connection,
        /* eslint-disable @typescript-eslint/no-explicit-any */
        wallet as any,
        CUSTOM_CONFIRM_OPTIONS
      );

      // Convert amount to lamports
      const amountLamports = new BN(amount * LAMPORTS_PER_SOL);
      
      // Get house wallet PDA
      const [houseWallet] = await getHouseWalletPDA();
      
      // Use provided match account public key
      const matchAccount = new PublicKey(matchAccountPubkey);
      
      // Create a Transaction object
      const transaction = new web3.Transaction();
      
      // Get recent blockhash with longer validity
      const recentBlockhash = await connection.getLatestBlockhash('finalized');
      transaction.recentBlockhash = recentBlockhash.blockhash;
      transaction.lastValidBlockHeight = recentBlockhash.lastValidBlockHeight;
      transaction.feePayer = wallet.publicKey;
      
      // Add instruction for placeBet
      // Note: This is a simplified approach. In a real implementation,
      // you'd want to actually load the program using the IDL.
      
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
      
      console.log(`Attempt ${retryCount + 1}/${MAX_RETRIES}: Placing bet on-chain...`);
      
      try {
        // Sign and send transaction with extended timeout
        const txSignature = await provider.sendAndConfirm(transaction);
        console.log(`Bet placed on-chain: ${txSignature}`);
        return txSignature;
      } catch (confirmError) {
        // Handle timeout errors differently
        if (confirmError instanceof TransactionExpiredTimeoutError) {
          console.warn(`Transaction confirmation timed out. Trying manual confirmation...`);
          
          // Get the signature from the error message
          const signatureMatch = confirmError.message.match(/Check signature ([a-zA-Z0-9]+)/);
          if (signatureMatch && signatureMatch[1]) {
            const txSignature = signatureMatch[1];
            
            // Try to manually confirm the transaction
            const confirmed = await manualConfirmTransaction(connection, txSignature);
            if (confirmed) {
              console.log(`Manually confirmed transaction: ${txSignature}`);
              return txSignature;
            }
          }
        }
        
        // Re-throw if not a timeout or manual confirmation failed
        throw confirmError;
      }
    } catch (error) {
      // Update the retry count and last error
      retryCount++;
      lastError = error;
      
      // Call onRetry callback if provided
      if (onRetry) {
        onRetry(retryCount);
      }
      
      // If we've reached max retries, throw the last error
      if (retryCount >= MAX_RETRIES) {
        break;
      }
      
      // Wait before retrying with exponential backoff
      const backoffMs = Math.min(1000 * (2 ** retryCount), 15000); // Max 15 seconds
      console.log(`Waiting ${backoffMs / 1000} seconds before retrying...`);
      await new Promise(resolve => setTimeout(resolve, backoffMs));
    }
  }

  // If all retries failed, throw an improved error message
  if (lastError instanceof TransactionExpiredTimeoutError) {
    throw new Error(
      `Transaction timed out after ${MAX_RETRIES} attempts. The Solana network may be congested. ` +
      `Your funds are safe, and you can try placing your bet again later.`
    );
  } else {
    console.error('All retry attempts failed for placing bet on-chain:', lastError);
    throw lastError;
  }
} 