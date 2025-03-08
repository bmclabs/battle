import { useState, useEffect } from 'react';
import { ChartData, CoinMarketData } from '../types';

// Map fighter IDs to CoinMarketCap IDs
const COIN_ID_MAP: Record<string, { id: number, symbol: string }> = {
  'pepe': { id: 24478, symbol: 'PEPE' },
  'doge': { id: 74, symbol: 'DOGE' },
};

// Helper function to get a random 24-hour period from the past month
const getRandomDayInLastMonth = (): { start: Date, end: Date } => {
  const now = new Date();
  const oneMonthAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
  
  // Get a random time between one month ago and 1 day ago
  const minTime = oneMonthAgo.getTime();
  const maxTime = now.getTime() - (24 * 60 * 60 * 1000); // Subtract 1 day from now
  
  // Generate random timestamp between minTime and maxTime
  const randomTime = minTime + Math.random() * (maxTime - minTime);
  
  // Create start and end dates for the 24-hour period
  const startDate = new Date(randomTime);
  const endDate = new Date(randomTime + (24 * 60 * 60 * 1000)); // Add 24 hours
  
  // Round to nearest hour for cleaner timestamps
  startDate.setMinutes(0, 0, 0);
  endDate.setMinutes(0, 0, 0);
  
  return { start: startDate, end: endDate };
};

// Helper function to generate evenly spaced timestamps within a 24-hour period
const generateTimestampsInDay = (start: Date, end: Date, count: number): Date[] => {
  const result: Date[] = [];
  const startTime = start.getTime();
  const timeRange = end.getTime() - startTime;
  
  // Create evenly spaced intervals
  for (let i = 0; i < count; i++) {
    const time = new Date(startTime + (timeRange * i / (count - 1)));
    result.push(time);
  }
  
  return result;
};

// Helper function to find the closest price data point to a given timestamp
const findClosestPrice = (quotes: any[], targetTime: number): number => {
  if (!quotes || quotes.length === 0) {
    throw new Error('No quotes available');
  }
  
  // Find the quote with the closest timestamp to the target time
  let closestQuote = quotes[0];
  let closestDistance = Math.abs(new Date(closestQuote.timestamp).getTime() - targetTime);
  
  for (let i = 1; i < quotes.length; i++) {
    const quote = quotes[i];
    const distance = Math.abs(new Date(quote.timestamp).getTime() - targetTime);
    
    if (distance < closestDistance) {
      closestQuote = quote;
      closestDistance = distance;
    }
  }
  
  return closestQuote.quote.USD.price;
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
        
        // Get a random 24-hour period from the past month
        const { start, end } = getRandomDayInLastMonth();
        console.log(`Selected time period: ${start.toISOString()} to ${end.toISOString()}`);
        
        // Fetch both current market data and historical data for the specific 24-hour period
        const [marketResponse, historicalResponse] = await Promise.all([
          fetch(`/api/chart/${fighterId}/market?symbol=${symbol}`),
          fetch(`/api/chart/${fighterId}/historical?symbol=${symbol}&start=${start.toISOString()}&end=${end.toISOString()}&interval=1h`)
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

        // Check if historical data exists and has the expected structure
        if (!historicalData.data || !historicalData.data.quotes) {
          console.warn('Historical data missing or invalid format:', historicalData);
          throw new Error('Invalid historical data format');
        }
        
        // Ensure quotes is an array (even if empty)
        const quotes = Array.isArray(historicalData.data.quotes) ? historicalData.data.quotes : [];
        
        // Log the quotes for debugging
        console.log(`Received ${quotes.length} historical data points`);
        if (quotes.length > 0) {
          console.log('Sample quote:', quotes[0]);
        }
        
        // If no historical data is available, we'll use current price for all data points
        if (quotes.length === 0) {
          console.warn('No historical quotes available, using current price for all data points');
        }

        // Sort quotes by timestamp to ensure they're in chronological order
        quotes.sort((a: any, b: any) => {
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        });

        // Process the historical data
        let timestamps: Date[] = [];
        let prices: number[] = [];
        
        if (quotes.length >= 8) {
          // If we have enough data points, select 8 evenly spaced points
          const step = Math.floor(quotes.length / 8);
          for (let i = 0; i < 8; i++) {
            const index = Math.min(i * step, quotes.length - 1);
            const quote = quotes[index];
            timestamps.push(new Date(quote.timestamp));
            prices.push(quote.quote.USD.price);
          }
        } else if (quotes.length > 0) {
          // If we have some data but not enough, use what we have
          quotes.forEach((quote: any) => {
            timestamps.push(new Date(quote.timestamp));
            prices.push(quote.quote.USD.price);
          });
        } else {
          // If we have no data, generate evenly spaced timestamps and use current price
          const timeStep = (end.getTime() - start.getTime()) / 7;
          for (let i = 0; i < 8; i++) {
            timestamps.push(new Date(start.getTime() + i * timeStep));
            prices.push(marketData.price);
          }
        }

        // Log the data we're using for the chart
        console.log('Chart timestamps:', timestamps.map(t => t.toISOString()));
        console.log('Chart prices:', prices);
        
        // Format data for chart
        const formattedData: ChartData = {
          labels: timestamps.map(timestamp => {
            // Format as "MM/DD HH:MM" for 24-hour period
            return `${(timestamp.getUTCMonth() + 1).toString().padStart(2, '0')}/${timestamp.getUTCDate().toString().padStart(2, '0')} ${timestamp.getUTCHours().toString().padStart(2, '0')}:00`;
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
          // Add time range information for display
          timeRange: {
            start: start.toISOString(),
            end: end.toISOString()
          }
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