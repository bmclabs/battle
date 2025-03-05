import { useState, useEffect } from 'react';
import { ChartData } from '../types';

// CoinMarketCap API key
const CMC_API_KEY = 'f5d884c4-217d-4a2c-9074-dd372493acf1';

// Map fighter IDs to CoinMarketCap IDs
const COIN_ID_MAP: Record<string, number> = {
  'pepe': 24478, // PEPE
  'doge': 74, // Dogecoin
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
        
        // Get coin ID from map
        const coinId = COIN_ID_MAP[fighterId];
        
        // Fetch data from CoinMarketCap API (using proxy to avoid CORS issues)
        const response = await fetch(`/api/chart/${fighterId}?coinId=${coinId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch chart data');
        }
        
        const data = await response.json();
        
        // Format data for candlestick chart
        const formattedData: ChartData = {
          labels: data.timestamps.map((timestamp: number) => {
            const date = new Date(timestamp);
            return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
          }),
          datasets: [
            {
              label: fighterId.toUpperCase(),
              data: data.prices,
              borderColor: fighterId === 'pepe' ? '#9945FF' : '#14F195',
              backgroundColor: fighterId === 'pepe' ? 'rgba(153, 69, 255, 0.2)' : 'rgba(20, 241, 149, 0.2)',
            },
          ],
        };
        
        setChartData(formattedData);
        setError(null);
      } catch (err) {
        setError('Failed to load chart data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadChartData();
  }, [fighterId]);

  return { chartData, loading, error };
}; 