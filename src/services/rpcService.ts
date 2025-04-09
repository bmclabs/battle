import { 
  Connection, 
  PublicKey,
} from '@solana/web3.js';
import { getBestRpcUrl } from '@/utils/network';

/**
 * Service for handling RPC requests, ensuring API keys are not exposed
 */
class RpcService {
  private connection: Connection;
  private proxyUrl: string | null = null;

  constructor() {
    const rpcUrl = getBestRpcUrl();
    
    // Check if this is a proxy URL
    if (rpcUrl.startsWith('/api/')) {
      this.proxyUrl = rpcUrl;
      // Use a fallback public endpoint for the Connection object
      // Actual requests will be sent through our proxy
      this.connection = new Connection('https://api.devnet.solana.com');
    } else {
      // For non-proxy URLs, use the standard Connection
      this.connection = new Connection(rpcUrl, 'confirmed');
    }
  }

  /**
   * Send a JSON-RPC request through our proxy
   */
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  private async sendJsonRpcRequest(method: string, params: any[]): Promise<any> {
    if (!this.proxyUrl) {
      throw new Error('Proxy URL not configured');
    }

    const response = await fetch(this.proxyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      /* eslint-disable  @typescript-eslint/no-explicit-any */
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method,
        params,
      }),
    });

    if (!response.ok) {
      throw new Error(`RPC request failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(`RPC error: ${data.error.message}`);
    }

    return data.result;
  }

  /**
   * Get account info using the appropriate method
   */
  async getAccountInfo(publicKey: PublicKey) {
    if (this.proxyUrl) {
      return this.sendJsonRpcRequest('getAccountInfo', [publicKey.toBase58()]);
    } else {
      return this.connection.getAccountInfo(publicKey);
    }
  }

  /**
   * Get balance using the appropriate method
   */
  async getBalance(publicKey: PublicKey): Promise<number> {
    if (this.proxyUrl) {
      return this.sendJsonRpcRequest('getBalance', [publicKey.toBase58()]);
    } else {
      return this.connection.getBalance(publicKey);
    }
  }

  /**
   * Get recent blockhash using the appropriate method
   */
  async getRecentBlockhash() {
    if (this.proxyUrl) {
      return this.sendJsonRpcRequest('getRecentBlockhash', []);
    } else {
      return this.connection.getRecentBlockhash();
    }
  }

  /**
   * Get the raw connection object (should avoid using directly if possible)
   * Instead, prefer using the proxy methods above
   */
  getConnection(): Connection {
    return this.connection;
  }
}

// Export as singleton
export const rpcService = new RpcService();
export default rpcService; 