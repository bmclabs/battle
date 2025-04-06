import { 
  Connection, 
  PublicKey, 
  SystemProgram, 
  LAMPORTS_PER_SOL 
} from '@solana/web3.js';
import { 
  Program, 
  AnchorProvider, 
  web3, 
  BN 
} from '@coral-xyz/anchor';
import { WalletContextState } from '@solana/wallet-adapter-react';

// Get program ID from environment variables
const PROGRAM_ID = new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID || '');

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
    // Get network from environment variables
    const networkEnv = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet';
    const endpoint = `https://api.${networkEnv}.solana.com`;
    
    // Create connection
    const connection = new Connection(endpoint);
    
    // Create AnchorProvider
    const provider = new AnchorProvider(
      connection,
      wallet as any,
      { commitment: 'confirmed' }
    );

    // Convert amount to lamports
    const amountLamports = new BN(amount * LAMPORTS_PER_SOL);
    
    // Get house wallet PDA
    const [houseWallet] = await getHouseWalletPDA();
    
    // Use provided match account public key
    const matchAccount = new PublicKey(matchAccountPubkey);
    
    // Create a Transaction object
    const transaction = new web3.Transaction();
    
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
    
    // Sign and send transaction
    const txSignature = await provider.sendAndConfirm(transaction);
    
    console.log(`Bet placed on-chain: ${txSignature}`);
    return txSignature;
  } catch (error) {
    console.error('Error placing bet on-chain:', error);
    throw error;
  }
} 