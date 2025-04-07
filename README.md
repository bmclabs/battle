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

# RPC Provider Configuration
# Helius API key (REQUIRED for mainnet usage)
NEXT_PUBLIC_HELIUS_API_KEY=your-helius-api-key

# Solana Program IDs
NEXT_PUBLIC_PROGRAM_ID=your-program-id

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3080/api
```

For production mainnet deployment, make sure to set:
```
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
NEXT_PUBLIC_HELIUS_API_KEY=your-actual-helius-api-key
```

The application is configured to prioritize Helius RPC for mainnet connections to ensure the best performance and reliability.

## Getting Started

First, install dependencies:

```bash
npm install
# or
yarn install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Backend API Endpoints

The application uses the following backend API endpoints for wallet authentication:

- `POST /api/auth/challenge` - Get a challenge message for wallet signature
- `POST /api/auth/verify` - Verify the signature and get authentication token
- `GET /api/auth/user` - Get the current user data
- `POST /api/auth/logout` - Logout and invalidate the token

## Technologies Used

- Next.js
- React
- TypeScript
- Solana Web3.js
- Solana Wallet Adapter
- TailwindCSS
- Chart.js

## Project Structure

```battle-memecoin-club/
├── public/            # Static assets
├── src/
│   ├── app/           # Next.js app router
│   │   └── api/       # API routes
│   ├── components/    # React components
│   │   ├── battle/    # Components related to battle
│   │   ├── betting/   # Components related to betting
│   │   ├── chat/      # Components related to chat
│   │   └── chart/     # Components related to chart
│   ├── hooks/         # Custom React hooks
│   ├── services/      # API and WebSocket services
│   ├── types/         # TypeScript type definitions
│   └── utils/         # Utility functions
├── .gitignore
├── next.config.ts
├── package.json
├── README.md
└── tsconfig.json
```

## Alur Game

1. **Mode Preparation**: Users can view fighter statistics, analyze charts, and place bets.
2. **Mode Battle**: Battle starts, and users can watch the battle in real-time. Betting is closed during this phase.
3. **Mode Result**: Winner is announced, and winnings are distributed to users who bet on the winning fighter.

## Betting System

Bets are placed using SOL. When a fighter wins, the total bet amount on the losing fighter is distributed proportionally to the users who bet on the winning fighter, based on the amount they bet.

## How to Use

1. Connect your Solana wallet by clicking the "CONNECT WALLET" button
2. On the preparation mode, select the fighter you want to support
3. Enter the amount of SOL you want to bet
4. Click "PLACE BET" to place your bet
5. Wait for the battle to start and watch the result
6. If your fighter wins, you will receive the winnings automatically

## Demo Controls

For demonstration purposes, you can use the controls in the bottom right corner to switch between game modes:
- **Preparation**: Mode for placing bets
- **Battle**: Active battle mode
- **Result**: Result mode

## Development

This project is actively being developed. Features to be added include:
- Improved Solana wallet integration
- More comprehensive backend implementation
- More statistics and analytics
- Leaderboard and ranking system

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by [SaltyBet](https://www.saltybet.com/)
- Pixel art assets created by Nils
