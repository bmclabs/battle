# Battle Memecoin Club

A pixel art betting game where memecoins battle for supremacy.

## Features

- Connect to Solana wallets (Phantom, Solflare)
- Authenticate with wallet signature
- Place bets on memecoin battles
- Real-time chat with other players
- View memecoin price charts
- Pixel art battle animations

## Wallet Connection Flow

The application implements a secure wallet connection flow:

1. User clicks "CONNECT WALLET" button
2. Wallet adapter modal appears for user to select their wallet (Phantom, Solflare)
3. After connecting wallet, a sign message modal appears
4. User must sign the message to authenticate with the backend
5. The sign message modal cannot be closed without either signing or disconnecting
6. After successful authentication, user can place bets and use chat

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
# Solana Cluster Configuration
NEXT_PUBLIC_SOLANA_NETWORK=devnet

# Solana Program IDs
NEXT_PUBLIC_PROGRAM_ID=your-program-id

# Server-side RPC Provider Configuration (not exposed to client)
HELIUS_API_KEY=your-helius-api-key
QUICKNODE_API_KEY=your-quicknode-api-key

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3080/api
```

For production mainnet deployment, make sure to set:
```
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
HELIUS_API_KEY=your-actual-helius-api-key
```

> **IMPORTANT**: The application is configured to **ONLY** use Helius RPC for mainnet connections. The default public Solana endpoint (api.mainnet-beta.solana.com) cannot be used as it returns 403 Forbidden errors. You must provide a valid Helius API key for mainnet operations.

## API Key Protection

To prevent API keys from being exposed in browser network requests, the application uses a server-side proxy system:

1. RPC API keys are stored as server-side environment variables (without the `NEXT_PUBLIC_` prefix)
2. Client-side code makes requests to local API endpoints (`/api/rpc/*`) 
3. These endpoints proxy the requests to the actual RPC providers with the API keys
4. This ensures that sensitive API keys never appear in browser network requests

## Getting Started

First, install dependencies:

```