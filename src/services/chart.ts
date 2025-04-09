import { CoinMarketData } from "../types";

// API URL from environment variable with fallback
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3080';
const ARENA_SECRET_KEY = process.env.NEXT_PUBLIC_ARENA_SECRET_KEY;

// Time interval type
export type PriceInterval = '15m' | '1h' | '1d';

// Single quote data point
export interface PriceQuote {
  timestamp: string;
  price: number;
  volume: number;
  marketCap: number;
  percentChange: number;
}

// Fighter price data
export interface FighterPriceData {
  fighter: string;
  coinId: number;
  quotes: PriceQuote[];
  market: CoinMarketData;
}

// Response from the fighter prices API
export interface FighterPricesResponse {
  matchId: string;
  interval: string;
  count: number;
  historicalData: FighterPriceData[];
}

/**
 * Fetches historical and current price data for fighters in a match
 * @param matchId - The match ID
 * @param interval - Time interval for price data (15m, 1h, 1d)
 * @param count - Number of data points to return
 * @returns Promise with fighter price data
 */
export const fetchFighterPrices = async (
  matchId: string,
  interval: PriceInterval = '1h',
  count: number = 24
): Promise<FighterPricesResponse> => {
  // Construct the URL with query parameters
  const url = new URL(`${API_BASE_URL}/v1/arena/matches/${matchId}/fighter-prices`);
  url.searchParams.append('interval', interval);
  url.searchParams.append('count', count.toString());

  console.log('Fetching fighter prices from:', url.toString());

  try {
    // Make the request with the API key in the header
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-arena-api-key': ARENA_SECRET_KEY || '',
      },
      credentials: 'include'
    });

    console.log('Fighter prices response status:', response.status);
    
    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Error fetching fighter prices:', {
        status: response.status,
        url: response.url,
        body: errorBody
      });
      throw new Error(`Failed to fetch fighter prices: ${response.status} ${response.statusText} - ${errorBody}`);
    }

    const data = await response.json();
    console.log('Fighter prices data received for fighters:', 
      data.historicalData?.map((f: FighterPriceData) => f.fighter)?.join(', ') || 'No data');
    
    return data;
  } catch (error) {
    console.error('Error fetching fighter prices:', error);
    throw error;
  }
};

/**
 * Formats a timestamp for display in the chart
 * @param timestamp - ISO string timestamp
 * @returns Formatted time string
 */
const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

/**
 * Transforms raw fighter price data into a format suitable for chart display
 * @param data - The raw fighter price data
 * @param fighterId - Optional fighter ID to filter data for a specific fighter
 * @returns Formatted chart data
 */
export const transformFighterPriceDataToChartData = (
  data: FighterPricesResponse,
  fighterId?: string
): {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
  }>;
  marketData?: CoinMarketData;
} => {
  // If no data, return empty chart data
  if (!data.historicalData || data.historicalData.length === 0) {
    return { labels: [], datasets: [] };
  }

  // Filter data for the specific fighter if provided
  let fighterData;
  if (fighterId) {
    // Convert fighterId to uppercase to match API response (which has uppercase fighter names)
    const upperFighterId = fighterId.toUpperCase();
    
    // Find the fighter data that matches the requested fighter ID
    fighterData = data.historicalData.find(f => f.fighter === upperFighterId);
    
    // If no matching fighter found, log warning and return empty data
    if (!fighterData) {
      console.warn(`No data found for fighter ${upperFighterId}. Available fighters:`, 
        data.historicalData.map(f => f.fighter));
      return { labels: [], datasets: [] };
    }
  } else {
    // If no specific fighter requested, use the first one in the array
    fighterData = data.historicalData[0];
  }

  // Extract timestamps for labels from the fighter's quotes
  const labels = fighterData.quotes.map(q => formatTimestamp(q.timestamp));

  // Colors for fighter based on fighter ID
  let borderColor = '#14F195';  // default green
  let backgroundColor = 'rgba(20, 241, 149, 0.2)';
  
  if (fighterId) {
    const lowerFighterId = fighterId.toLowerCase();
    // Assign colors based on fighter ID
    if (lowerFighterId == 'doge') {
      borderColor = '#BA9F33';
      backgroundColor = 'rgba(186, 159, 51, 0.2)';
    } else if (lowerFighterId == 'shiba') {
      borderColor = '#F3A62F';
      backgroundColor = 'rgba(243, 166, 47, 0.2)';
    } else if (lowerFighterId == 'pepe') {
      borderColor = '#4C9641';
      backgroundColor = 'rgba(76, 150, 65, 0.2)';
    } else if (lowerFighterId == 'pengu') {
      borderColor = '#8CB3FE';
      backgroundColor = 'rgba(140, 179, 254, 0.2)';
    } else if (lowerFighterId == 'trump') {
      borderColor = '#EAD793';
      backgroundColor = 'rgba(234, 215, 147, 0.2)';
    } else if (lowerFighterId == 'brett') {
      borderColor = '#00ACDC';
      backgroundColor = 'rgba(0, 172, 220, 0.2)';
    }
  }

  // Create dataset for the fighter
  const dataset = {
    label: fighterData.fighter,
    data: fighterData.quotes.map(q => q.price),
    borderColor,
    backgroundColor,
  };

  // Return the formatted chart data
  return {
    labels,
    datasets: [dataset],
    marketData: fighterData.market,
  };
};

/**
 * Generates fallback chart data when the API fails
 * @param fighterId - ID of the fighter
 * @returns Fallback chart data
 */
export const generateFallbackChartData = (fighterId: string) => {
  const isFirst = fighterId.toLowerCase() === 'pepe' || fighterId.toLowerCase() === 'pengu';
  
  // Generate random data points
  const now = new Date();
  const labels = [];
  const data = [];
  
  // Create 24 hours of data
  for (let i = 0; i < 24; i++) {
    const time = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000);
    labels.push(formatTimestamp(time.toISOString()));
    
    // Generate price with some volatility
    const basePrice = isFirst ? 0.00473 : 0.000012;
    const volatility = isFirst ? 0.0001 : 0.0000005;
    const randomFactor = Math.random() * 2 - 1; // -1 to 1
    data.push(basePrice + volatility * randomFactor);
  }
  
  // Apply same color logic as the main function
  let borderColor = '#14F195';  // default green
  let backgroundColor = 'rgba(20, 241, 149, 0.2)';
  
  const lowerFighterId = fighterId.toLowerCase();
  // Assign colors based on fighter ID
  if (lowerFighterId === 'doge') {
    borderColor = '#BA9F33';
    backgroundColor = 'rgba(186, 159, 51, 0.2)';
  } else if (lowerFighterId === 'shiba') {
    borderColor = '#F3A62F';
    backgroundColor = 'rgba(243, 166, 47, 0.2)';
  } else if (lowerFighterId === 'pepe') {
    borderColor = '#4C9641';
    backgroundColor = 'rgba(76, 150, 65, 0.2)';
  } else if (lowerFighterId === 'pengu') {
    borderColor = '#8CB3FE';
    backgroundColor = 'rgba(140, 179, 254, 0.2)';
  } else if (lowerFighterId === 'trump') {
    borderColor = '#EAD793';
    backgroundColor = 'rgba(234, 215, 147, 0.2)';
  } else if (lowerFighterId === 'brett') {
    borderColor = '#00ACDC';
    backgroundColor = 'rgba(0, 172, 220, 0.2)';
  }
  
  // Create market data
  const latestPrice = data[data.length - 1];
  const marketData = {
    price: latestPrice,
    marketCap: isFirst ? 295000000 : 7200000000,
    volume24h: isFirst ? 30000000 : 250000000,
    percentChange24h: (Math.random() * 2 - 1) * 2 // -2% to +2%
  };
  
  return {
    labels,
    datasets: [{
      label: fighterId.toUpperCase(),
      data,
      borderColor,
      backgroundColor
    }],
    marketData
  };
};
