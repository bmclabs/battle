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
    
    if (!symbol) {
      return NextResponse.json(
        { error: 'Symbol is required' },
        { status: 400 }
      );
    }
    
    // Validate start and end times
    if (start && end) {
      const startDate = new Date(start);
      const endDate = new Date(end);
      
      // Check if dates are valid
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return NextResponse.json(
          { error: 'Invalid date format' },
          { status: 400 }
        );
      }
    }
    
    // Build the API URL based on provided parameters
    let apiUrl = `https://pro-api.coinmarketcap.com/v3/cryptocurrency/quotes/historical?symbol=${symbol}&interval=${interval}`;
    
    // Add time parameters if provided
    if (start) {
      apiUrl += `&time_start=${encodeURIComponent(start)}`;
    }
    
    if (end) {
      apiUrl += `&time_end=${encodeURIComponent(end)}`;
    }
    
    // If neither start nor end is provided, set a default count
    if (!start && !end) {
      apiUrl += '&count=100';
    }
    
    console.log('Fetching from CoinMarketCap API:', apiUrl);
    
    // Fetch historical data from CoinMarketCap
    const response = await fetch(
      apiUrl,
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
    
    // Log the actual response structure for debugging
    console.log('CoinMarketCap historical API response structure:', JSON.stringify(data, null, 2));
    
    // Check if the API returned an error
    if (data.status?.error_code && data.status.error_code !== 0) {
      console.error('CoinMarketCap API returned an error:', data.status);
      return NextResponse.json(
        { error: `CoinMarketCap API error: ${data.status.error_message}` },
        { status: 500 }
      );
    }
    
    // Handle the case where no data is available for the symbol
    if (!data.data || !data.data[symbol] || !Array.isArray(data.data[symbol])) {
      console.warn(`No historical data available for symbol ${symbol}`);
      return NextResponse.json({
        data: {
          quotes: []
        }
      });
    }
    
    // The API returns an array of coins with the same symbol
    // Find the coin with the most data points (most active)
    let bestCoin = null;
    let maxQuotes = 0;
    
    for (const coin of data.data[symbol]) {
      if (coin.is_active === 1 && Array.isArray(coin.quotes) && coin.quotes.length > maxQuotes) {
        maxQuotes = coin.quotes.length;
        bestCoin = coin;
      }
    }
    
    // If no active coin found, try to use any coin with quotes
    if (!bestCoin) {
      for (const coin of data.data[symbol]) {
        if (Array.isArray(coin.quotes) && coin.quotes.length > maxQuotes) {
          maxQuotes = coin.quotes.length;
          bestCoin = coin;
        }
      }
    }
    
    // If still no coin with quotes, return empty array
    if (!bestCoin || !Array.isArray(bestCoin.quotes)) {
      console.warn(`No quotes found for any ${symbol} coin`);
      return NextResponse.json({
        data: {
          quotes: []
        }
      });
    }
    
    // Log which coin we're using
    console.log(`Using ${symbol} coin with ID ${bestCoin.id} (${bestCoin.name}) with ${bestCoin.quotes.length} quotes`);
    
    // Extract quotes from the selected coin
    const quotes = bestCoin.quotes;
    
    // Sort quotes by timestamp to ensure they're in chronological order
    quotes.sort((a: any, b: any) => {
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    });
    
    // Format response to match expected structure in the frontend
    return NextResponse.json({
      data: {
        quotes: quotes.map((quote: any) => {
          // Ensure all required fields exist with fallbacks
          const usdQuote = quote.quote?.USD || {};
          return {
            timestamp: quote.timestamp,
            quote: {
              USD: {
                price: usdQuote.price || 0,
                volume_24h: usdQuote.volume_24h || 0,
                market_cap: usdQuote.market_cap || 0,
                percent_change_1h: usdQuote.percent_change_1h || 0,
                percent_change_24h: usdQuote.percent_change_24h || 0
              }
            }
          };
        })
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