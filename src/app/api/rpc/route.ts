import { NextRequest, NextResponse } from 'next/server';
import { getCurrentCluster } from '@/utils/network';

/**
 * Server-side API endpoint to proxy RPC requests to Helius
 * This keeps the API key hidden from client-side code
 */
export async function POST(request: NextRequest) {
  try {
    // Get the Helius API key from environment variables (server-side only)
    const apiKey = process.env.HELIUS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'RPC service misconfigured' },
        { status: 500 }
      );
    }

    // Get the current cluster
    const cluster = getCurrentCluster();
    
    // Determine the Helius endpoint based on the cluster
    const heliusEndpoint = cluster === 'mainnet-beta'
      ? `https://mainnet.helius-rpc.com/?api-key=${apiKey}`
      : `https://api.devnet.solana.com`;

    // Parse the request body
    const body = await request.json();

    // Forward the request to Helius
    const response = await fetch(heliusEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    // Parse the response
    const data = await response.json();

    // Return the response from Helius
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying RPC request:', error);
    return NextResponse.json(
      { error: 'Error proxying RPC request' },
      { status: 500 }
    );
  }
} 