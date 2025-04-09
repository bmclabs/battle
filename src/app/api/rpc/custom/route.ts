import { NextRequest, NextResponse } from 'next/server';
import { getCurrentCluster } from '@/utils/network';

/**
 * Server-side API endpoint to proxy RPC requests to a custom endpoint
 * This keeps any API keys hidden from client-side code
 */
export async function POST(request: NextRequest) {
  try {
    const cluster = getCurrentCluster();
    
    // Determine the endpoint based on the cluster
    let rpcEndpoint: string | null = null;
    
    if (cluster === 'mainnet-beta') {
      rpcEndpoint = process.env.MAINNET_RPC_URL || null;
    } else if (cluster === 'devnet') {
      rpcEndpoint = process.env.DEVNET_RPC_URL || null;
    }
    
    if (!rpcEndpoint) {
      return NextResponse.json(
        { error: 'Custom RPC endpoint not configured for this network' },
        { status: 500 }
      );
    }

    // Parse the request body
    const body = await request.json();

    // Forward the request to the custom endpoint
    const response = await fetch(rpcEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    // Parse the response
    const data = await response.json();

    // Return the response
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying custom RPC request:', error);
    return NextResponse.json(
      { error: 'Error proxying RPC request' },
      { status: 500 }
    );
  }
} 