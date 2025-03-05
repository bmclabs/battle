# Battle Memecoin Club

is a pixel art betting game where memecoins battle for supremacy. Users can place bets on their favorite memecoin fighters and win SOL based on the outcome of the battle.

## Features

- Real-time memecoin battle with pixel art graphics
- Direct betting with SOL (Solana)
- Real-time chat for users to discuss the battle
- Price chart for analyzing fighter performance
- Responsive design for desktop and mobile

## Tech Stack

- **Frontend**: Next.js, TypeScript, Tailwind CSS
- **Blockchain**: Solana Web3.js
- **Real-time**: WebSockets (Socket.io)
- **Charts**: Chart.js, react-chartjs-2
- **Styling**: Pixel art theme with custom CSS

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Wallet Solana (seperti Phantom)

### Installation

1. Clone repository:
   ```bash
   git clone https://github.com/yourusername/battle-memecoin-club.git
   cd battle-memecoin-club
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run development server:
   ```bash
   npm run dev
   ```

   Or use the start script:
   ```bash
   ./start.sh
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
battle-memecoin-club/
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