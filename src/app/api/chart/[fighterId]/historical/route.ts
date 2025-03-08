import { NextRequest, NextResponse } from 'next/server';

// CoinMarketCap API key should be in environment variables
const CMC_API_KEY = process.env.COINMARKETCAP_API_KEY || 'f5d884c4-217d-4a2c-9074-dd372493acf1';

export async function GET(
  request: NextRequest,
  { params }: { params: { fighterId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    const start = searchParams.get('start');
    const end = searchParams.get('end');
    const interval = searchParams.get('interval') || '5m';
    
    if (!symbol || !start || !end) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }
    
    // Convert ISO dates to timestamps
    const startTimestamp = Math.floor(new Date(start).getTime() / 1000);
    const endTimestamp = Math.floor(new Date(end).getTime() / 1000);
    
    // Fetch historical data from CoinMarketCap
    const response = await fetch(
      `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/historical?symbol=${symbol}&time_start=${startTimestamp}&time_end=${endTimestamp}&interval=${interval}&count=500`,
      {
        headers: {
          'X-CMC_PRO_API_KEY': CMC_API_KEY,
        },
        next: { revalidate: 300 } // Cache for 5 minutes
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
    if (!data.data?.[symbol]?.quotes || !Array.isArray(data.data[symbol].quotes)) {
      console.error('Invalid API response structure:', data);
      return NextResponse.json(
        { error: 'Invalid API response structure' },
        { status: 500 }
      );
    }
    
    // Format response
    return NextResponse.json({
      data: {
        quotes: data.data[symbol].quotes.map((quote: any) => ({
          timestamp: quote.timestamp,
          quote: {
            USD: {
              price: quote.quote.USD.price,
              volume_24h: quote.quote.USD.volume_24h,
              market_cap: quote.quote.USD.market_cap,
              percent_change_1h: quote.quote.USD.percent_change_1h,
              percent_change_24h: quote.quote.USD.percent_change_24h
            }
          }
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching historical data:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch historical data' },
      { status: 500 }
    );
  }
} 