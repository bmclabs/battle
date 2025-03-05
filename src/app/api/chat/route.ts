import { NextRequest, NextResponse } from 'next/server';
import { ChatMessage } from '../../../types';

// Mock chat messages
let messages: ChatMessage[] = [
  {
    id: "msg-1",
    walletAddress: "8xJUNEBuJR5dNuEtRPMJD5iBjKRtQGP5Bz7LWGEh2eQ1",
    message: "PEPE is going to win for sure!",
    timestamp: Date.now() - 5000
  },
  {
    id: "msg-2",
    walletAddress: "6yJENFBuJR5dNuEtRPMJD5iBjKRtQGP5Bz7LWGEh2eQ2",
    message: "DOGE to the moon!",
    timestamp: Date.now() - 10000
  },
  {
    id: "msg-3",
    walletAddress: "4zJENFBuJR5dNuEtRPMJD5iBjKRtQGP5Bz7LWGEh2eQ3",
    message: "All in on PEPE!",
    timestamp: Date.now() - 15000
  }
];

// GET all chat messages
export async function GET() {
  return NextResponse.json(messages);
}

// POST a new chat message
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.walletAddress || !data.message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Create new message
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      walletAddress: data.walletAddress,
      message: data.message,
      timestamp: Date.now()
    };
    
    // Add to messages array
    messages.push(newMessage);
    
    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
} 