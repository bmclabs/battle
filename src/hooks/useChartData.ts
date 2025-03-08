import { useState, useEffect } from 'react';
import { ChartData, CoinMarketData } from '../types';

// Map fighter IDs to CoinMarketCap IDs
const COIN_ID_MAP: Record<string, { id: number, symbol: string }> = {
  'pepe': { id: 24478, symbol: 'PEPE' },
  'doge': { id: 74, symbol: 'DOGE' },
};

// Helper function to get random times in the last 24 hours
const getRandomTimesInLast24 = (count: number): Date[] => {
  const now = new Date();
  now.setMinutes(0, 0, 0); // Round to current hour UTC
  
  // Create array of all possible hours in last 24 hours
  const allTimes: Date[] = [];
  for (let i = 0; i < 24; i++) {
    const hourBase = new Date(now.getTime() - (i * 60 * 60 * 1000));
    // Add 4 15-minute intervals for each hour
    for (let j = 0; j < 4; j++) {
      const time = new Date(hourBase.getTime() + (j * 15 * 60 * 1000));
      // Only add if we have a full hour ahead for averaging
      if (time.getTime() + (60 * 60 * 1000) <= now.getTime()) {
        allTimes.push(time);
      }
    }
  }
  
  // Shuffle array and take first 'count' elements
  const shuffled = allTimes.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count).sort((a, b) => a.getTime() - b.getTime());
};

// Helper function to calculate average price from historical data
const calculateHourlyAverage = (quotes: any[], startTime: number): number => {
  // Filter quotes within 1 hour after startTime
  const relevantQuotes = quotes.filter(quote => {
    const quoteTime = new Date(quote.timestamp).getTime();
    return quoteTime >= startTime && quoteTime < startTime + (60 * 60 * 1000);
  });

  if (relevantQuotes.length === 0) {
    throw new Error('No data available for the selected time period');
  }

  // Calculate average price from all quotes in the hour
  const sum = relevantQuotes.reduce((acc, quote) => acc + quote.quote.USD.price, 0);
  return sum / relevantQuotes.length;
};

export const useChartData = (fighterId: string) => {
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadChartData = async () => {
      if (!fighterId || !COIN_ID_MAP[fighterId]) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Get coin info from map
        const { symbol } = COIN_ID_MAP[fighterId];
        
        // Get current time and time 24 hours ago
        const now = new Date();
        const twentyFourHoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
        
        // Fetch both current market data and historical data
        const [marketResponse, historicalResponse] = await Promise.all([
          fetch(`/api/chart/${fighterId}/market?symbol=${symbol}`),
          fetch(`/api/chart/${fighterId}/historical?symbol=${symbol}&start=${twentyFourHoursAgo.toISOString()}&end=${now.toISOString()}&interval=5m`)
        ]);
        
        if (!marketResponse.ok || !historicalResponse.ok) {
          const [marketData, historicalData] = await Promise.all([
            marketResponse.json().catch(() => ({ error: marketResponse.statusText })),
            historicalResponse.json().catch(() => ({ error: historicalResponse.statusText }))
          ]);
          
          const errors = [];
          if (!marketResponse.ok) {
            errors.push(`Market data: ${marketData.error || marketResponse.statusText}`);
          }
          if (!historicalResponse.ok) {
            errors.push(`Historical data: ${historicalData.error || historicalResponse.statusText}`);
          }
          
          throw new Error(`Failed to fetch data: ${errors.join(', ')}`);
        }
        
        const [marketData, historicalData] = await Promise.all([
          marketResponse.json(),
          historicalResponse.json()
        ]);

        // Validate the data structure
        if (!marketData.price || !marketData.marketCap || !marketData.volume24h || marketData.percentChange24h === undefined) {
          throw new Error('Invalid market data format');
        }

        if (!historicalData.data?.quotes || !Array.isArray(historicalData.data.quotes)) {
          throw new Error('Invalid historical data format');
        }

        // Get 8 random times from the last 24 hours
        const selectedTimes = getRandomTimesInLast24(8);
        
        // Generate price data for each selected time
        const timestamps: number[] = [];
        const prices: number[] = [];
        
        // Process each selected time
        for (const time of selectedTimes) {
          try {
            const avgPrice = calculateHourlyAverage(
              historicalData.data.quotes,
              time.getTime()
            );
            
            timestamps.push(time.getTime());
            prices.push(avgPrice);
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.warn(`Skipping time ${time.toISOString()}: ${errorMessage}`);
          }
        }

        if (timestamps.length === 0) {
          throw new Error('No valid data points could be calculated');
        }
        
        // Format data for chart
        const formattedData: ChartData = {
          labels: timestamps.map(timestamp => {
            const date = new Date(timestamp);
            return `${date.getUTCHours().toString().padStart(2, '0')}:${date.getUTCMinutes().toString().padStart(2, '0')}`;
          }),
          datasets: [
            {
              label: symbol,
              data: prices,
              borderColor: fighterId === 'pepe' ? '#9945FF' : '#14F195',
              backgroundColor: fighterId === 'pepe' ? 'rgba(153, 69, 255, 0.2)' : 'rgba(20, 241, 149, 0.2)',
            },
          ],
          marketData: marketData,
        };
        
        setChartData(formattedData);
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load chart data';
        console.error('Chart data error:', err);
        setError(errorMessage);
        setChartData(null);
      } finally {
        setLoading(false);
      }
    };

    loadChartData();
  }, [fighterId]);

  return { chartData, loading, error };
}; 