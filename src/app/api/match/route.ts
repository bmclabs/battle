import { NextResponse } from 'next/server';
import { GameMode } from '../../../types';

export async function GET() {
  // Mock data for the current match
  const match = {
    id: "match-1",
    fighter1: {
      id: "pepe",
      name: "PEPE",
      image: "https://via.placeholder.com/200x200/9945FF/FFFFFF?text=PEPE",
      stats: {
        attack: 75,
        defense: 60,
        speed: 85,
        health: 70
      }
    },
    fighter2: {
      id: "doge",
      name: "DOGE",
      image: "https://via.placeholder.com/200x200/14F195/FFFFFF?text=DOGE",
      stats: {
        attack: 65,
        defense: 80,
        speed: 70,
        health: 85
      }
    },
    totalBetsFighter1: 150,
    totalBetsFighter2: 200,
    winner: null,
    status: GameMode.PREPARATION,
    startTime: Date.now(),
    endTime: null
  };

  return NextResponse.json(match);
} 