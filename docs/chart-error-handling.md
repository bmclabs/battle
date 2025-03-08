# Price Chart Error Handling & Fallback Mechanisms

This document explains the error handling and fallback mechanisms implemented in the price chart functionality to ensure a robust user experience even when API data is incomplete or unavailable.

## Error Types

The price chart system handles several types of errors:

1. **API Connection Errors**: Failed connections to the CoinMarketCap API
2. **API Response Errors**: Error responses from the CoinMarketCap API
3. **Data Structure Errors**: Invalid or unexpected data structures in API responses
4. **Missing Data Errors**: Required data fields missing from API responses
5. **Processing Errors**: Errors during data processing and calculation

## Error Handling Flow

### 1. API Endpoint Level

The API endpoints (`/api/chart/[fighterId]/market` and `/api/chart/[fighterId]/historical`) implement the following error handling:

```
Request → Validate Parameters → Fetch from CoinMarketCap → 
Check Response Status → Parse JSON → Validate Structure → 
Format Response → Return Data
```

At each step, errors are caught and appropriate error responses are returned:

```typescript
try {
  // API call and processing
} catch (error) {
  console.error('Error fetching data:', error);
  return NextResponse.json(
    { error: error instanceof Error ? error.message : 'Failed to fetch data' },
    { status: 500 }
  );
}
```

### 2. Hook Level

The `useChartData` hook implements error handling for both API calls and data processing:

```
Initialize → Fetch Market & Historical Data → Check Response Status → 
Parse JSON → Validate Data → Process Data → Format for Chart → 
Return Formatted Data
```

Errors at any stage are caught and stored in the `error` state:

```typescript
try {
  // Data fetching and processing
} catch (err) {
  const errorMessage = err instanceof Error ? err.message : 'Failed to load chart data';
  console.error('Chart data error:', err);
  setError(errorMessage);
  setChartData(null);
}
```

### 3. Component Level

The `CoinChart` component handles errors by displaying appropriate messages:

```tsx
{loading ? (
  <div className="flex items-center justify-center h-full">
    <p className="text-white text-sm pixel-glitch">Loading chart data...</p>
  </div>
) : error ? (
  <div className="flex items-center justify-center h-full">
    <p className="text-red-500 text-sm pixel-glitch">{error}</p>
  </div>
) : !chartData ? (
  <div className="flex items-center justify-center h-full">
    <p className="text-white text-sm">No chart data available</p>
  </div>
) : (
  // Render chart
)}
```

## Fallback Mechanisms

### 1. Empty Historical Data

When historical data is unavailable or empty, the system uses the current price as a fallback:

```typescript
// If no historical quotes are available, we'll use current price for all data points
if (quotes.length === 0) {
  console.warn('No historical quotes available, using current price for all data points');
}

// Process each selected time
for (const time of selectedTimes) {
  try {
    // If no historical quotes are available, use the current price as fallback
    const avgPrice = calculateHourlyAverage(
      quotes,
      time.getTime(),
      marketData.price // Use current price as fallback
    );
    
    timestamps.push(time.getTime());
    prices.push(avgPrice);
  } catch (error) {
    // If we can't calculate the average, still add a data point with the current price
    timestamps.push(time.getTime());
    prices.push(marketData.price);
  }
}
```

### 2. Missing Data for Specific Time Periods

When data for specific time periods is missing, the system uses the current price for those periods:

```typescript
const calculateHourlyAverage = (quotes: any[], startTime: number, fallbackPrice?: number): number => {
  // If quotes array is empty and we have a fallback price, return it immediately
  if (quotes.length === 0 && fallbackPrice !== undefined) {
    return fallbackPrice;
  }
  
  // Filter quotes within 1 hour after startTime
  const relevantQuotes = quotes.filter(quote => {
    const quoteTime = new Date(quote.timestamp).getTime();
    return quoteTime >= startTime && quoteTime < startTime + (60 * 60 * 1000);
  });

  if (relevantQuotes.length === 0) {
    if (fallbackPrice !== undefined) {
      return fallbackPrice;
    }
    throw new Error('No data available for the selected time period');
  }

  // Calculate average price from all quotes in the hour
  const sum = relevantQuotes.reduce((acc, quote) => acc + quote.quote.USD.price, 0);
  return sum / relevantQuotes.length;
};
```

### 3. Missing Fields in API Responses

When fields are missing in API responses, the system uses default values:

```typescript
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
```

## Error Recovery

The system implements several error recovery mechanisms:

1. **Automatic Retries**: Not currently implemented, but could be added using libraries like axios-retry
2. **Graceful Degradation**: The chart will display with limited data rather than failing completely
3. **Informative Error Messages**: Error messages provide specific information about what went wrong
4. **Logging**: Errors are logged to the console for debugging

## Common Error Scenarios and Solutions

### 1. CoinMarketCap API Key Issues

**Error**: "Failed to fetch data: Market data: CoinMarketCap API error: 401 Unauthorized"

**Solution**:
- Verify that your API key is valid and active
- Check that your API key has access to the required endpoints
- Ensure the API key is correctly set in environment variables

### 2. Invalid Symbol

**Error**: "Failed to fetch data: Historical data: Invalid API response structure: missing data for symbol XYZ"

**Solution**:
- Verify that the symbol is correct and supported by CoinMarketCap
- Check that the symbol is correctly mapped in the `COIN_ID_MAP`
- Ensure the API key has access to data for that symbol

### 3. Rate Limiting

**Error**: "Failed to fetch data: Market data: CoinMarketCap API error: 429 Too Many Requests"

**Solution**:
- Implement caching to reduce API calls
- Increase cache duration in the API endpoints
- Upgrade to a higher tier API plan if needed

### 4. Network Issues

**Error**: "Failed to fetch data: Network error"

**Solution**:
- Implement retry logic for network failures
- Add offline support with cached data
- Display a user-friendly message suggesting to check network connection

## Testing Error Handling

To test the error handling mechanisms:

1. **Invalid API Key Test**: Temporarily change the API key to an invalid value
2. **Missing Symbol Test**: Request data for a non-existent cryptocurrency symbol
3. **Network Failure Test**: Disable network connectivity temporarily
4. **Malformed Response Test**: Mock the API to return malformed JSON

## Conclusion

The price chart system implements robust error handling and fallback mechanisms to ensure a good user experience even when data is incomplete or unavailable. By gracefully handling errors and providing fallbacks, the chart can continue to function and provide value to users even in suboptimal conditions. 