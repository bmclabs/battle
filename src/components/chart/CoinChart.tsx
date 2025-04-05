import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData as ChartJsData,
  Chart
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { ChartData, Fighter } from '../../types';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Define extended chart data type that includes OHLC data
interface ExtendedChartData extends ChartJsData {
  ohlc?: Array<{
    open: number;
    high: number;
    low: number;
    close: number;
  }>;
}

// Custom candlestick plugin
const candlestickPlugin = {
  id: 'candlestick',
  beforeDatasetsDraw(chart: Chart) {
    const { ctx, data, chartArea } = chart;
    
    const extendedData = data as ExtendedChartData;
    if (!extendedData.ohlc) return;
    
    ctx.save();
    
    const ohlcData = extendedData.ohlc;
    ohlcData.forEach((candle, i: number) => {
      const x = chart.scales.x.getPixelForValue(i);
      const openY = chart.scales.y.getPixelForValue(candle.open);
      const highY = chart.scales.y.getPixelForValue(candle.high);
      const lowY = chart.scales.y.getPixelForValue(candle.low);
      const closeY = chart.scales.y.getPixelForValue(candle.close);
      
      // Draw candle body
      const candleWidth = chartArea.width / ohlcData.length * 0.8;
      const halfCandleWidth = candleWidth / 2;
      
      // Determine if bullish or bearish
      const isBullish = closeY < openY;
      
      // Set color based on bullish/bearish
      ctx.fillStyle = isBullish ? '#14F195' : '#FF69B4';
      ctx.strokeStyle = isBullish ? '#14F195' : '#FF69B4';
      
      // Draw candle body
      ctx.fillRect(x - halfCandleWidth, openY, candleWidth, closeY - openY);
      
      // Draw high/low wicks
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, Math.min(openY, closeY));
      ctx.moveTo(x, Math.max(openY, closeY));
      ctx.lineTo(x, lowY);
      ctx.stroke();
    });
    
    ctx.restore();
  }
};

interface CoinChartProps {
  fighter: Fighter | null;
  chartData: ChartData | null;
  loading: boolean;
  error: string | null;
}

const CoinChart: React.FC<CoinChartProps> = ({
  fighter,
  chartData,
  loading,
  error
}) => {
  // Only show if fighter exists
  if (!fighter) {
    return null;
  }

  const formatNumber = (num: number): string => {
    // For very small numbers, count zeros after decimal and use as exponent
    if (num > 0 && num < 0.01) {
      // Convert to string and count leading zeros after decimal point
      const numStr = num.toString();
      const decimalParts = numStr.split('.');
      
      if (decimalParts.length === 2) {
        const decimalPart = decimalParts[1];
        let leadingZeros = 0;
        
        // Count leading zeros
        for (let i = 0; i < decimalPart.length; i++) {
          if (decimalPart[i] === '0') {
            leadingZeros++;
          } else {
            break;
          }
        }
        
        // If we have at least 5 leading zeros, use the exponent format
        if (leadingZeros >= 5) {
          // Get the significant digits after the zeros (limit to 4 digits)
          const significantDigits = decimalPart.substring(leadingZeros, leadingZeros + 4);
          
          // Use superscript for the exponent
          const superscriptMap: Record<string, string> = {
            '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', 
            '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹'
          };
          
          let superscriptExponent = '';
          const exponentStr = leadingZeros.toString();
          for (let i = 0; i < exponentStr.length; i++) {
            superscriptExponent += superscriptMap[exponentStr[i]] || exponentStr[i];
          }
          
          // Format as $0.0⁵1234
          return `$0.0${superscriptExponent}${significantDigits}`;
        }
      }
    }
    
    // For larger numbers, use standard formatting
    if (num >= 1e9) {
      return `$${(num / 1e9).toFixed(2)}B`;
    }
    if (num >= 1e6) {
      return `$${(num / 1e6).toFixed(2)}M`;
    }
    if (num >= 1e3) {
      return `$${(num / 1e3).toFixed(2)}K`;
    }
    
    // For regular small numbers (not requiring exponent notation)
    // Limit to 4 decimal places for better readability
    return `$${num.toFixed(4)}`;
  };

  // Chart options
  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#ffffff',
          font: {
            family: '"Press Start 2P", cursive',
            size: 10
          }
        }
      },
      title: {
        display: true,
        text: `${fighter.name} - Price Chart`,
        color: '#ffffff',
        font: {
          family: '"Press Start 2P", cursive',
          size: 12
        }
      },
      tooltip: {
        backgroundColor: '#000000',
        borderColor: fighter.id === 'pepe' ? '#FF69B4' : '#14F195',
        borderWidth: 2,
        titleFont: {
          family: '"Press Start 2P", cursive',
          size: 10
        },
        bodyFont: {
          family: '"Press Start 2P", cursive',
          size: 10
        },
        callbacks: {
          label: function(context: {parsed: {y: number}}) {
            const value = context.parsed.y;
            
            // Format the price using the same exponent notation
            if (value > 0 && value < 0.01) {
              // Convert to string and count leading zeros after decimal point
              const numStr = value.toString();
              const decimalParts = numStr.split('.');
              
              if (decimalParts.length === 2) {
                const decimalPart = decimalParts[1];
                let leadingZeros = 0;
                
                // Count leading zeros
                for (let i = 0; i < decimalPart.length; i++) {
                  if (decimalPart[i] === '0') {
                    leadingZeros++;
                  } else {
                    break;
                  }
                }
                
                // If we have at least 5 leading zeros, use the exponent format
                if (leadingZeros >= 5) {
                  // Get the significant digits after the zeros (limit to 4 digits)
                  const significantDigits = decimalPart.substring(leadingZeros, leadingZeros + 4);
                  
                  // Use superscript for the exponent
                  const superscriptMap: Record<string, string> = {
                    '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', 
                    '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹'
                  };
                  
                  let superscriptExponent = '';
                  const exponentStr = leadingZeros.toString();
                  for (let i = 0; i < exponentStr.length; i++) {
                    superscriptExponent += superscriptMap[exponentStr[i]] || exponentStr[i];
                  }
                  
                  // Format as Price: $0.0⁵1234
                  return `Price: $0.0${superscriptExponent}${significantDigits}`;
                }
              }
            }
            
            // For regular numbers
            return `Price: $${value.toFixed(4)}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          display: false,
          color: '#ffffff',
          font: {
            family: '"Press Start 2P", cursive',
            size: 8
          },
          maxRotation: 45,
          minRotation: 45
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: '#ffffff',
          font: {
            family: '"Press Start 2P", cursive',
            size: 8
          },
          callback: function(value) {
            // For very small numbers, count zeros after decimal and use as exponent
            if (typeof value === 'number' && value > 0 && value < 0.01) {
              // Convert to string and count leading zeros after decimal point
              const numStr = value.toString();
              const decimalParts = numStr.split('.');
              
              if (decimalParts.length === 2) {
                const decimalPart = decimalParts[1];
                let leadingZeros = 0;
                
                // Count leading zeros
                for (let i = 0; i < decimalPart.length; i++) {
                  if (decimalPart[i] === '0') {
                    leadingZeros++;
                  } else {
                    break;
                  }
                }
                
                // If we have at least 5 leading zeros, use the exponent format
                if (leadingZeros >= 5) {
                  // Get the significant digits after the zeros (limit to 3 digits for axis)
                  const significantDigits = decimalPart.substring(leadingZeros, leadingZeros + 3);
                  
                  // Use superscript for the exponent
                  const superscriptMap: Record<string, string> = {
                    '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', 
                    '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹'
                  };
                  
                  let superscriptExponent = '';
                  const exponentStr = leadingZeros.toString();
                  for (let i = 0; i < exponentStr.length; i++) {
                    superscriptExponent += superscriptMap[exponentStr[i]] || exponentStr[i];
                  }
                  
                  // Format as $0.0⁵123 (include $ for axis labels)
                  return `$0.0${superscriptExponent}${significantDigits}`;
                }
              }
            }
            
            // For regular numbers, limit to 4 decimal places
            return '$' + Number(value).toFixed(4);
          }
        }
      }
    }
  };

  return (
    <div className="w-full h-40 bg-black/80 border-2 border-primary p-4 retro-container">
      {loading ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-white text-xs">Loading chart data...</p>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-red-500 text-xs">{error}</p>
        </div>
      ) : !chartData ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-white text-xs">No chart data available</p>
        </div>
      ) : (
        <div className="h-full flex flex-col">
          {/* Time Range Info */}
          {chartData.timeRange && (
            <div className="text-[8px] text-gray-400 mb-1 text-center">
              24h Period: {formatTimeRange(chartData.timeRange.start, chartData.timeRange.end)}
            </div>
          )}
          
          <div className="flex gap-4 flex-1 overflow-hidden">
            {/* Market Info */}
            <div className="w-1/3 flex flex-col justify-between">
              <div>
                <div className="space-y-2">
                  <div className="text-[10px]">
                    <p className="text-gray-400 text-[8px]">Price</p>
                    <p className="text-white text-[7px]">
                      {formatNumber(chartData.marketData?.price || 0)}
                      <span className={`ml-1 text-[7px] ${
                        (chartData.marketData?.percentChange24h || 0) >= 0 
                          ? 'text-green-500' 
                          : 'text-red-500'
                      }`}>
                        {(chartData.marketData?.percentChange24h || 0).toFixed(2)}%
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-[7px]">Market Cap</p>
                    <p className="text-white text-[7px]">
                      {formatNumber(chartData.marketData?.marketCap || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-[7px]">Volume 24h</p>
                    <p className="text-white text-[7px]">
                      {formatNumber(chartData.marketData?.volume24h || 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="w-2/3 h-full overflow-hidden">
              <Line 
                options={{
                  ...options,
                  maintainAspectRatio: false,
                  plugins: {
                    ...options.plugins,
                    legend: {
                      display: false
                    }
                  }
                }} 
                data={chartData} 
                plugins={[candlestickPlugin]}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to format time range for display
const formatTimeRange = (startIso: string, endIso: string): string => {
  const start = new Date(startIso);
  const end = new Date(endIso);
  
  const formatTime = (date: Date) => {
    return `${date.getUTCHours().toString().padStart(2, '0')}:00`;
  };
  
  const formatDate = (date: Date) => {
    return `${date.getUTCDate().toString().padStart(2, '0')}/${(date.getUTCMonth() + 1).toString().padStart(2, '0')}`;
  };
  
  // If same day, just show date with start and end times
  if (start.getUTCDate() === end.getUTCDate() && 
      start.getUTCMonth() === end.getUTCMonth() && 
      start.getUTCFullYear() === end.getUTCFullYear()) {
    return `${formatDate(start)} ${formatTime(start)} - ${formatTime(end)} UTC`;
  }
  
  // Different days
  return `${formatDate(start)} ${formatTime(start)} - ${formatDate(end)} ${formatTime(end)} UTC`;
};

export default CoinChart; 