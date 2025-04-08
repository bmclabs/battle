import { 
  Connection, 
  Commitment,
  PublicKey,
  BlockhashWithExpiryBlockHeight,
  Transaction,
  TransactionSignature,
  SendOptions,
  AccountInfo,
  ParsedAccountData,
  RpcResponseAndContext
} from '@solana/web3.js';
import { getHeliusRpcUrl } from '@/utils/network';

// Default connection config
const connectionConfig = {
  commitment: 'confirmed' as Commitment,
  confirmTransactionInitialTimeout: 120000, // 2 minutes
  disableRetryOnRateLimit: false,
  skipPreflight: false
};

// Define interface for token accounts response
interface ParsedTokenAccountsByOwnerResponse {
  value: Array<{
    pubkey: PublicKey;
    account: AccountInfo<ParsedAccountData>;
  }>;
}

// More generic type for confirmation response
type ConfirmationResponse = RpcResponseAndContext<unknown>;

export class RpcService {
  private rpcEndpoints: string[];
  private connections: Connection[];
  private currentConnectionIndex: number = 0;
  private maxRetries: number;
  private retryDelay: number;

  constructor(
    rpcEndpoints?: string[],
    options?: { 
      maxRetries?: number;
      retryDelay?: number;
      config?: typeof connectionConfig;
    }
  ) {
    // Use provided endpoints or default to using Helius RPC URL (if available) + public Solana endpoints
    this.rpcEndpoints = rpcEndpoints || [
      getHeliusRpcUrl() || 'https://api.mainnet-beta.solana.com',
      'https://solana-api.projectserum.com',
      'https://rpc.ankr.com/solana'
    ];
    
    // Create connections for each endpoint
    this.connections = this.rpcEndpoints.map(endpoint => 
      new Connection(endpoint, options?.config || connectionConfig)
    );
    
    // Set retry options
    this.maxRetries = options?.maxRetries || 2;
    this.retryDelay = options?.retryDelay || 500; // 500ms default
  }

  // Get the current connection
  getConnection(): Connection {
    return this.connections[this.currentConnectionIndex];
  }

  // Get balance with fallback
  async getBalance(publicKey: PublicKey): Promise<number> {
    return this.withFallback(connection => connection.getBalance(publicKey));
  }

  // Get account info with fallback
  async getAccountInfo(publicKey: PublicKey): Promise<AccountInfo<Buffer> | null> {
    return this.withFallback(connection => connection.getAccountInfo(publicKey));
  }

  // Get parsed token accounts with fallback
  async getParsedTokenAccountsByOwner(
    owner: PublicKey, 
    filterMint?: PublicKey
  ): Promise<ParsedTokenAccountsByOwnerResponse> {
    return this.withFallback(connection => 
      connection.getParsedTokenAccountsByOwner(
        owner, 
        filterMint ? { mint: filterMint } : { programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') }
      )
    );
  }

  // Get recent blockhash with fallback
  async getRecentBlockhash(): Promise<BlockhashWithExpiryBlockHeight> {
    return this.withFallback(connection => connection.getLatestBlockhash('finalized'));
  }

  // Send transaction with fallback
  async sendTransaction(
    transaction: Transaction, 
    wallet: { publicKey: PublicKey; signTransaction: (tx: Transaction) => Promise<Transaction> },
    options?: SendOptions
  ): Promise<TransactionSignature> {
    // Sign transaction
    const signedTransaction = await wallet.signTransaction(transaction);
    
    // Send using the connection with fallback
    return this.withFallback(connection => 
      connection.sendRawTransaction(signedTransaction.serialize(), options)
    );
  }

  // Confirm transaction with fallback
  async confirmTransaction(signature: TransactionSignature): Promise<ConfirmationResponse> {
    return this.withFallback(connection => 
      connection.confirmTransaction(signature, 'confirmed')
    );
  }

  // Generic fallback method that tries each connection with retries
  async withFallback<T>(
    operation: (connection: Connection) => Promise<T>,
    specificEndpointIndices?: number[]
  ): Promise<T> {
    const indicesToTry = specificEndpointIndices || 
      Array.from({ length: this.connections.length }, (_, i) => i);
    
    let lastError: Error | null = null;
    
    // Try each endpoint
    for (const index of indicesToTry) {
      let retryCount = 0;

      // Try current endpoint with retries
      while (retryCount <= this.maxRetries) {
        try {
          const result = await operation(this.connections[index]);
          // If successful, update the current index for future operations
          this.currentConnectionIndex = index;
          return result;
        } catch (error) {
          lastError = error as Error;
          retryCount++;
          
          // If we have retries left, wait before trying again
          if (retryCount <= this.maxRetries) {
            await new Promise(resolve => 
              setTimeout(resolve, this.retryDelay * Math.pow(2, retryCount - 1))
            );
          }
        }
      }
    }
    
    // If we get here, all endpoints failed
    throw new Error(`All RPC endpoints failed: ${this.rpcEndpoints.join(', ')}. Last error: ${lastError?.message || 'Unknown error'}`);
  }
}

// Export a singleton instance
export const rpcService = new RpcService();

// Export the service class for testing or custom instances
export default RpcService; 