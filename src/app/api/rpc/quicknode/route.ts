import { NextRequest, NextResponse } from 'next/server';
import { getCurrentCluster } from '@/utils/network';

/**
 * Server-side API endpoint to proxy RPC requests to QuickNode
 * This keeps the API key hidden from client-side code
 */
export async function POST(request: NextRequest) {
  try {
    // Get the QuickNode API key from environment variables (server-side only)
    const apiKey = process.env.NEXT_PUBLIC_QUICKNODE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'QuickNode RPC service misconfigured' },
        { status: 500 }
      );
    }

    // Get the current cluster
    const cluster = getCurrentCluster();
    
    // Determine the QuickNode endpoint based on the cluster
    const quickNodeEndpoint = cluster === 'mainnet-beta'
      ? `https://api.quicknode.com/solana/${apiKey}`
      : `https://api.devnet.solana.com`; // Fallback to default devnet endpoint

    // Parse the request body
    const body = await request.json();

    // Forward the request to QuickNode
    const response = await fetch(quickNodeEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    // Parse the response
    const data = await response.json();

    // Return the response from QuickNode
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying QuickNode RPC request:', error);
    return NextResponse.json(
      { error: 'Error proxying RPC request' },
      { status: 500 }
    );
  }
} 