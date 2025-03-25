import { NextRequest, NextResponse } from 'next/server';
import { CoinMarketData } from '@/types';

// CoinMarketCap API key should be in environment variables
const CMC_API_KEY = process.env.COINMARKETCAP_API_KEY || 'f5d884c4-217d-4a2c-9074-dd372493acf1';

export async function GET(
  request: NextRequest
) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    
    if (!symbol) {
      return NextResponse.json(
        { error: 'Symbol is required' },
        { status: 400 }
      );
    }
    
    // Fetch current market data from CoinMarketCap
    const response = await fetch(
      `https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?symbol=${symbol}`,
      {
        headers: {
          'X-CMC_PRO_API_KEY': CMC_API_KEY,
        },
        next: { revalidate: 60 } // Cache for 1 minute
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      console.error('CoinMarketCap API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      return NextResponse.json(
        { error: `CoinMarketCap API error: ${response.status} ${errorText}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    
    // Validate the response structure
    if (!data.data?.[symbol]?.[0]?.quote?.USD) {
      console.error('Invalid API response structure:', data);
      return NextResponse.json(
        { error: 'Invalid API response structure' },
        { status: 500 }
      );
    }
    
    const quote = data.data[symbol][0].quote.USD;
    
    // Validate required fields
    const requiredFields = ['price', 'market_cap', 'volume_24h', 'percent_change_24h'];
    const missingFields = requiredFields.filter(field => quote[field] === undefined);
    
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 500 }
      );
    }
    
    // Format market data
    const marketData: CoinMarketData = {
      price: quote.price,
      marketCap: quote.market_cap,
      volume24h: quote.volume_24h,
      percentChange24h: quote.percent_change_24h,
    };
    
    return NextResponse.json(marketData);
  } catch (error) {
    console.error('Error fetching market data:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch market data' },
      { status: 500 }
    );
  }
} 