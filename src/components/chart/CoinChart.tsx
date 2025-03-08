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
  ChartOptions
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { ChartData, Fighter, GameMode } from '../../types';

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

// Custom candlestick plugin
const candlestickPlugin = {
  id: 'candlestick',
  beforeDatasetsDraw(chart: any) {
    const { ctx, data, chartArea, scales } = chart;
    const { top, bottom, left, right, width, height } = chartArea;
    
    if (!data.ohlc) return;
    
    ctx.save();
    
    data.ohlc.forEach((candle: any, i: number) => {
      const x = scales.x.getPixelForValue(i);
      const openY = scales.y.getPixelForValue(candle.open);
      const highY = scales.y.getPixelForValue(candle.high);
      const lowY = scales.y.getPixelForValue(candle.low);
      const closeY = scales.y.getPixelForValue(candle.close);
      
      // Draw candle body
      const candleWidth = width / data.ohlc.length * 0.8;
      const halfCandleWidth = candleWidth / 2;
      
      // Determine if bullish or bearish
      const isBullish = closeY < openY;
      
      // Set color based on bullish/bearish
      ctx.fillStyle = isBullish ? '#14F195' : '#FF4545';
      ctx.strokeStyle = isBullish ? '#14F195' : '#FF4545';
      
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
  gameMode: GameMode;
}

const CoinChart: React.FC<CoinChartProps> = ({
  fighter,
  chartData,
  loading,
  error,
  gameMode
}) => {
  // Only show in preparation mode
  if (!fighter) {
    return null;
  }

  const formatNumber = (num: number): string => {
    if (num >= 1e9) {
      return `$${(num / 1e9).toFixed(2)}B`;
    }
    if (num >= 1e6) {
      return `$${(num / 1e6).toFixed(2)}M`;
    }
    if (num >= 1e3) {
      return `$${(num / 1e3).toFixed(2)}K`;
    }
    return `$${num.toFixed(2)}`;
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
        borderColor: fighter.id === 'pepe' ? '#9945FF' : '#14F195',
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
          label: function(context: any) {
            return `Price: $${context.parsed.y.toFixed(6)}`;
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
            return '$' + Number(value).toFixed(6);
          }
        }
      }
    }
  };

  return (
    <div className="w-full h-40 bg-black border-4 border-primary p-4 pixel-border">
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
        <div className="h-full flex gap-4">
          {/* Market Info */}
          <div className="w-1/3 flex flex-col justify-between">
            <div>
              <div className="space-y-2">
                <div className="text-[10px]">
                  <p className="text-gray-400 text-[10px]">Price</p>
                  <p className="text-white text-[10px]">
                    {formatNumber(chartData.marketData?.price || 0)}
                    <span className={`ml-2 text-[10px] ${
                      (chartData.marketData?.percentChange24h || 0) >= 0 
                        ? 'text-green-500' 
                        : 'text-red-500'
                    }`}>
                      {(chartData.marketData?.percentChange24h || 0).toFixed(2)}%
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-[10px]">Market Cap</p>
                  <p className="text-white text-[10px]">
                    {formatNumber(chartData.marketData?.marketCap || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-[10px]">Volume 24h</p>
                  <p className="text-white text-[10px]">
                    {formatNumber(chartData.marketData?.volume24h || 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="w-2/3 h-full">
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
      )}
    </div>
  );
};

export default CoinChart; 