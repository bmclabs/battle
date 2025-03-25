import { NextRequest, NextResponse } from 'next/server';

// CoinMarketCap API key
const CMC_API_KEY = 'f5d884c4-217d-4a2c-9074-dd372493acf1';

export async function GET(
  request: NextRequest
) {
  try {
    const { searchParams } = new URL(request.url);
    const coinId = searchParams.get('coinId');
    
    if (!coinId) {
      return NextResponse.json(
        { error: 'Coin ID is required' },
        { status: 400 }
      );
    }
    
    // Get current date and date 7 days ago
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    
    // Convert to timestamps
    const startTimestamp = Math.floor(startDate.getTime() / 1000);
    const endTimestamp = Math.floor(endDate.getTime() / 1000);
    
    // Fetch data from CoinMarketCap API
    const response = await fetch(
      `https://pro-api.coinmarketcap.com/v2/cryptocurrency/ohlcv/historical?id=${coinId}&time_start=${startTimestamp}&time_end=${endTimestamp}&interval=1h`,
      {
        headers: {
          'X-CMC_PRO_API_KEY': CMC_API_KEY,
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`CoinMarketCap API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Extract OHLCV data
    const quotes = data.data.quotes;
    
    // Format data for candlestick chart
    const timestamps = quotes.map((quote: { time_open: number }) => quote.time_open);
    const prices = quotes.map((quote: { quote: { USD: { close: number } } }) => quote.quote.USD.close);
    
    return NextResponse.json({
      timestamps,
      prices,
      ohlc: quotes.map((quote: { 
        time_open: number; 
        quote: { 
          USD: { 
            open: number; 
            high: number; 
            low: number; 
            close: number; 
          } 
        } 
      }) => ({
        open: quote.quote.USD.open,
        high: quote.quote.USD.high,
        low: quote.quote.USD.low,
        close: quote.quote.USD.close,
        timestamp: quote.time_open
      }))
    });
  } catch (error) {
    console.error('Error fetching chart data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chart data' },
      { status: 500 }
    );
  }
} 