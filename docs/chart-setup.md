# Price Chart Setup Guide

This guide explains how to set up and configure the price chart functionality in the application.

## Prerequisites

- Node.js 16+ and npm/yarn
- CoinMarketCap API key (for production use)

## Configuration

### 1. API Key Setup

The application uses the CoinMarketCap API to fetch cryptocurrency price data. You'll need to set up an API key:

1. Register for a free account at [CoinMarketCap](https://coinmarketcap.com/api/)
2. Create an API key in your dashboard
3. Set the API key in your environment variables:

```bash
# .env.local
COINMARKETCAP_API_KEY=your_api_key_here
```

For development purposes, a fallback API key is provided, but it has limited usage and should be replaced for production.

### 2. Supported Cryptocurrencies

The application currently supports PEPE and DOGE cryptocurrencies. To add more cryptocurrencies:

1. Open `src/hooks/useChartData.ts`
2. Update the `COIN_ID_MAP` with additional cryptocurrencies:

```typescript
const COIN_ID_MAP: Record<string, { id: number, symbol: string }> = {
  'pepe': { id: 24478, symbol: 'PEPE' },
  'doge': { id: 74, symbol: 'DOGE' },
  // Add new cryptocurrencies here
  'shib': { id: 5994, symbol: 'SHIB' },
};
```

You can find the CoinMarketCap ID for a cryptocurrency by looking at its URL on CoinMarketCap.com (e.g., https://coinmarketcap.com/currencies/shiba-inu/ has ID 5994).

### 3. API Endpoint Configuration

The application uses two API endpoints for chart data:

1. `/api/chart/[fighterId]/market` - Fetches current market data
2. `/api/chart/[fighterId]/historical` - Fetches historical price data

These endpoints are already configured, but you can modify them if needed:

- `src/app/api/chart/[fighterId]/market/route.ts` - Market data endpoint
- `src/app/api/chart/[fighterId]/historical/route.ts` - Historical data endpoint

## Usage

### Basic Usage

To use the price chart in a component:

```tsx
import { useChartData } from '../hooks/useChartData';
import CoinChart from '../components/chart/CoinChart';

const MyComponent = () => {
  const fighterId = 'pepe'; // or 'doge'
  const { chartData, loading, error } = useChartData(fighterId);
  
  return (
    <CoinChart
      fighter={{ id: fighterId, name: 'PEPE', image: '/pepe.png', stats: {...} }}
      chartData={chartData}
      loading={loading}
      error={error}
      gameMode={GameMode.PREPARATION}
    />
  );
};
```

### Customizing the Chart

To customize the chart appearance:

1. Open `src/components/chart/CoinChart.tsx`
2. Modify the `options` object to change chart settings
3. Update the styling in the component's JSX

## Troubleshooting

### API Rate Limits

CoinMarketCap has API rate limits that vary by plan:

- Basic: 10,000 credits per month
- Each call to the historical endpoint uses 1 credit per 100 data points
- Each call to the market endpoint uses 1 credit

To reduce API usage:

1. Increase cache duration in the API endpoints
2. Reduce the number of data points requested
3. Implement client-side caching

### Common Errors

1. **"Failed to fetch data: Historical data: Invalid API response structure"**
   - Check your API key permissions
   - Verify the cryptocurrency symbol is correct
   - Check CoinMarketCap API documentation for changes

2. **"No historical quotes available"**
   - Some cryptocurrencies may have limited historical data
   - Try using a different time interval
   - Verify the cryptocurrency is actively traded

## Advanced Configuration

### Customizing Time Intervals

To change the default time interval for historical data:

1. Open `src/hooks/useChartData.ts`
2. Modify the interval parameter in the fetch call:

```typescript
fetch(`/api/chart/${fighterId}/historical?symbol=${symbol}&start=${twentyFourHoursAgo.toISOString()}&end=${now.toISOString()}&interval=15m`)
```

Available intervals: 5m, 10m, 15m, 30m, 45m, 1h, 2h, 3h, 4h, 6h, 12h, 24h, etc.

### Changing the Number of Data Points

To change the number of data points displayed on the chart:

1. Open `src/hooks/useChartData.ts`
2. Modify the `getRandomTimesInLast24` call:

```typescript
const selectedTimes = getRandomTimesInLast24(12); // Change from 8 to 12
```

More data points provide a more detailed chart but increase processing time. 