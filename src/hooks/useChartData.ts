import { useState, useEffect } from 'react';
import { ChartData } from '../types';
import { 
  fetchFighterPrices, 
  transformFighterPriceDataToChartData, 
  generateFallbackChartData,
  PriceInterval 
} from '../services/chart';

export const useChartData = (fighterId: string, matchId?: string) => {
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [usedFallback, setUsedFallback] = useState<boolean>(false);

  useEffect(() => {
    const loadChartData = async () => {
      if (!fighterId) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        setUsedFallback(false);
        
        // Only try to fetch from API if we have a match ID
        if (matchId) {
          console.log(`Fetching chart data for fighter: ${fighterId}, match: ${matchId}`);
          
          const interval: PriceInterval = '1h';
          const count = 24; // Default to 24 data points for a day
          
          try {
            // Fetch price data using our service with the provided match ID
            const priceData = await fetchFighterPrices(matchId, interval, count);
            
            if (!priceData.historicalData || priceData.historicalData.length === 0) {
              throw new Error('No historical data available for this match');
            }
            
            console.log(`Retrieved data for fighters: ${priceData.historicalData.map(f => f.fighter).join(', ')}`);
            
            // Check if our fighter exists in the data (case insensitive)
            const upperFighterId = fighterId.toUpperCase();
            const fighterExists = priceData.historicalData.some(f => f.fighter === upperFighterId);
            
            if (!fighterExists) {
              console.warn(`Fighter ${upperFighterId} not found in data. Available fighters: ${priceData.historicalData.map(f => f.fighter).join(', ')}`);
            }
            
            // Transform the data for chart display
            const formattedChartData = transformFighterPriceDataToChartData(priceData, fighterId);
            
            // If we have valid data
            if (formattedChartData.datasets.length > 0) {
              // Find the fighter data
              const fighterData = priceData.historicalData.find(f => 
                f.fighter.toLowerCase() === fighterId.toLowerCase() ||
                f.fighter === fighterId.toUpperCase()
              );
              
              // If we have quotes
              if (fighterData && fighterData.quotes.length > 0) {
                // Extract timeRange information
                const quotes = fighterData.quotes;
                const timeRange = {
                  start: quotes[0].timestamp,
                  end: quotes[quotes.length - 1].timestamp
                };
                
                // Set the chart data with time range
                setChartData({
                  ...formattedChartData,
                  timeRange
                });
                
                setError(null);
                return; // Exit early on success
              } 
            }
            // If we reach here, we couldn't find the right fighter data, fall through to the fallback
            throw new Error(`No valid data found for fighter ${fighterId}`);
          } catch (apiError) {
            // Log the error but use fallback data instead of failing
            console.warn('API error, using fallback data:', apiError);
            throw apiError; // Re-throw to trigger fallback
          }
        }
        
        // If we don't have a match ID or the API call failed, throw to trigger fallback
        throw new Error('Using fallback data');
        
      } catch (err) {
        // Use fallback data instead of showing an error
        console.log('Using fallback chart data for', fighterId);
        const fallbackData = generateFallbackChartData(fighterId);
        
        // Add a time range for the last 24 hours
        const now = new Date();
        const timeRange = {
          start: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
          end: now.toISOString()
        };
        
        setChartData({
          ...fallbackData,
          timeRange
        });
        
        // We're using fallback data, but don't show an error to the user
        setUsedFallback(true);
        setError(null);
      } finally {
        setLoading(false);
      }
    };

    loadChartData();
  }, [fighterId, matchId]); 

  return { chartData, loading, error, usedFallback };
}; 