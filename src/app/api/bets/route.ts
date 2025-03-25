import { NextRequest, NextResponse } from 'next/server';
import { Bet } from '../../../types';

// Mock bets data
const bets: Bet[] = [
  {
    walletAddress: "8xJUNEBuJR5dNuEtRPMJD5iBjKRtQGP5Bz7LWGEh2eQ1",
    amount: 2.5,
    fighterId: "pepe",
    timestamp: Date.now() - 5000
  },
  {
    walletAddress: "6yJENFBuJR5dNuEtRPMJD5iBjKRtQGP5Bz7LWGEh2eQ2",
    amount: 1.8,
    fighterId: "doge",
    timestamp: Date.now() - 10000
  },
  {
    walletAddress: "4zJENFBuJR5dNuEtRPMJD5iBjKRtQGP5Bz7LWGEh2eQ3",
    amount: 3.2,
    fighterId: "pepe",
    timestamp: Date.now() - 15000
  }
];

// GET all bets
export async function GET() {
  return NextResponse.json(bets);
}

// POST a new bet
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.walletAddress || !data.amount || !data.fighterId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Create new bet
    const newBet: Bet = {
      walletAddress: data.walletAddress,
      amount: parseFloat(data.amount),
      fighterId: data.fighterId,
      timestamp: Date.now()
    };
    
    // Add to bets array
    bets.push(newBet);
    
    return NextResponse.json(newBet, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Failed to place bet' },
      { status: 500 }
    );
  }
} 