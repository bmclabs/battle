# Price Chart Documentation

## Overview

The Price Chart component in this application displays real-time and historical cryptocurrency price data for fighters in the battle arena. It provides users with valuable market information including current price, 24-hour price change, market capitalization, and trading volume.

The chart is implemented using Chart.js and React-ChartJS-2, with custom styling to match the application's pixel art theme. The data is fetched from the CoinMarketCap API through custom backend endpoints.

## Architecture

The price chart functionality consists of the following components:

1. **Frontend Components**:
   - `CoinChart.tsx`: The main React component that renders the price chart
   - `useChartData.ts`: A custom React hook that fetches and processes chart data

2. **Backend API Endpoints**:
   - `/api/chart/[fighterId]/market`: Fetches current market data for a cryptocurrency
   - `/api/chart/[fighterId]/historical`: Fetches historical price data for a cryptocurrency

3. **Data Types**:
   - `ChartData`: Defines the structure of data used by the chart component
   - `CoinMarketData`: Defines the structure of market data (price, market cap, etc.)

## Data Flow

1. The `useChartData` hook is called with a fighter ID
2. The hook makes parallel API requests to fetch current market data and historical data
3. The data is processed and formatted for the Chart.js component
4. The formatted data is passed to the `CoinChart` component for rendering

## API Endpoints

### Market Data Endpoint

**Endpoint**: `/api/chart/[fighterId]/market`

**Parameters**:
- `symbol` (required): The cryptocurrency symbol (e.g., "PEPE", "DOGE")

**Response**:
```json
{
  "price": 0.000001234,
  "marketCap": 1000000000,
  "volume24h": 50000000,
  "percentChange24h": 5.67
}
```

**Implementation Details**:
- Uses CoinMarketCap's `/v2/cryptocurrency/quotes/latest` endpoint
- Caches responses for 1 minute to reduce API usage
- Validates response structure and required fields
- Returns formatted market data or appropriate error messages

### Historical Data Endpoint

**Endpoint**: `/api/chart/[fighterId]/historical`

**Parameters**:
- `symbol` (required): The cryptocurrency symbol (e.g., "PEPE", "DOGE")
- `start` (optional): Start timestamp in ISO format
- `end` (optional): End timestamp in ISO format
- `interval` (optional): Time interval between data points (default: "5m")

**Response**:
```json
{
  "data": {
    "quotes": [
      {
        "timestamp": "2023-06-01T00:00:00Z",
        "quote": {
          "USD": {
            "price": 0.000001234,
            "volume_24h": 50000000,
            "market_cap": 1000000000,
            "percent_change_1h": 1.23,
            "percent_change_24h": 5.67
          }
        }
      },
      // Additional quotes...
    ]
  }
}
```

**Implementation Details**:
- Uses CoinMarketCap's `/v3/cryptocurrency/quotes/historical` endpoint
- Supports flexible time parameters (start/end or count-based)
- Handles empty or missing data gracefully
- Caches responses for 5 minutes to reduce API usage
- Returns formatted historical data or appropriate error messages

## The `useChartData` Hook

The `useChartData` hook is responsible for fetching and processing chart data. It takes a fighter ID as input and returns an object containing:

- `chartData`: Formatted data for the Chart.js component
- `loading`: Boolean indicating if data is being loaded
- `error`: Error message if data fetching failed

**Key Features**:
- Maps fighter IDs to CoinMarketCap symbols
- Fetches both current market data and historical data in parallel
- Processes historical data to generate chart points
- Handles API errors and data validation
- Provides fallback mechanisms when historical data is unavailable

**Data Processing**:
1. Selects 8 random time points from the last 24 hours
2. For each time point, calculates the average price from historical data
3. If historical data is unavailable, uses current price as fallback
4. Formats the data for Chart.js with appropriate styling

## The `CoinChart` Component

The `CoinChart` component renders the price chart and market information. It takes the following props:

- `fighter`: The selected fighter
- `chartData`: Formatted chart data from the `useChartData` hook
- `loading`: Boolean indicating if data is being loaded
- `error`: Error message if data fetching failed
- `gameMode`: Current game mode

**Features**:
- Responsive line chart showing price history
- Market information panel with current price, 24h change, market cap, and volume
- Custom styling based on fighter (PEPE: purple, DOGE: green)
- Loading and error states
- Pixel art styling to match the application theme

## Error Handling

The price chart system includes robust error handling at multiple levels:

1. **API Endpoints**:
   - Validate request parameters
   - Handle API errors from CoinMarketCap
   - Validate response structure
   - Return appropriate error messages and status codes

2. **useChartData Hook**:
   - Handles API errors from both endpoints
   - Validates data structure
   - Provides fallbacks for missing historical data
   - Returns error messages for display

3. **CoinChart Component**:
   - Displays loading state during data fetching
   - Displays error messages when data fetching fails
   - Handles missing or incomplete data gracefully

## Fallback Mechanisms

To ensure a good user experience even when data is incomplete:

1. If historical data is unavailable, the current price is used for all data points
2. If some time periods have no data, they are still included with the current price
3. If market data is missing specific fields, default values are used

## CoinMarketCap API Integration

The application integrates with the following CoinMarketCap API endpoints:

1. **Latest Quotes**: `/v2/cryptocurrency/quotes/latest`
   - Used to fetch current market data
   - Provides price, market cap, volume, and percent change

2. **Historical Quotes**: `/v3/cryptocurrency/quotes/historical`
   - Used to fetch historical price data
   - Supports various time intervals and ranges
   - Returns time-series data for price, volume, and market cap

**API Key Management**:
- The CoinMarketCap API key is stored in environment variables
- A fallback key is provided for development purposes
- API responses are cached to minimize API usage

## Supported Cryptocurrencies

The application currently supports the following cryptocurrencies:

1. **PEPE** (CoinMarketCap ID: 24478)
2. **DOGE** (CoinMarketCap ID: 74)

Additional cryptocurrencies can be added by updating the `COIN_ID_MAP` in the `useChartData.ts` file.

## Troubleshooting

### Common Issues

1. **"Failed to fetch data: Historical data: Invalid API response structure"**
   - This error occurs when the CoinMarketCap API returns data in an unexpected format
   - Check the CoinMarketCap API documentation for any changes to the response structure
   - Verify that the API key has access to the historical data endpoint

2. **"No historical quotes available, using current price for all data points"**
   - This warning indicates that no historical data is available for the requested symbol
   - The chart will still display using the current price for all data points
   - Verify that the symbol is correct and that the API key has access to historical data

3. **"Invalid market data format"**
   - This error occurs when the market data response is missing required fields
   - Check the CoinMarketCap API documentation for any changes to the response structure
   - Verify that the API key has access to the latest quotes endpoint

### Debugging

For debugging issues with the price chart:

1. Check the browser console for error messages and warnings
2. Check the server logs for API request details and response structures
3. Verify that the CoinMarketCap API key is valid and has access to the required endpoints
4. Test the API endpoints directly using tools like Postman or curl

## Performance Considerations

To optimize performance and reduce API usage:

1. API responses are cached (market data: 1 minute, historical data: 5 minutes)
2. Historical data requests are limited to the last 24 hours
3. Only 8 data points are used for the chart to minimize processing
4. The chart component is only rendered when a fighter is selected

## Future Improvements

Potential improvements to the price chart functionality:

1. Add support for more cryptocurrencies
2. Implement time range selection (1h, 24h, 7d, 30d)
3. Add more chart types (candlestick, volume)
4. Implement real-time updates using WebSockets
5. Add technical indicators (moving averages, RSI, etc.)
6. Improve error recovery and retry mechanisms 