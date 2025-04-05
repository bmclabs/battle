import React from 'react';

const ChartPaused: React.FC = () => {
  return (
    <div className="w-full h-40 bg-black/80 border-2 border-primary p-4 retro-container flex items-center justify-center">
      <p className="text-white/70 text-xs">Chart is not available</p>
    </div>
  );
};

export default ChartPaused; 