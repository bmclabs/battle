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
    <div className="w-full h-64 bg-black border-4 border-primary p-4 pixel-border">
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
        <div className="h-full crt-effect">
          <Line 
            options={options} 
            data={chartData} 
            plugins={[candlestickPlugin]}
          />
        </div>
      )}
    </div>
  );
};

export default CoinChart; 