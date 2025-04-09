import React from 'react';

const BetPaused: React.FC = () => {
  return (
    <div className="w-full h-[450px] bg-black/80 border-2 border-primary p-3 retro-container flex flex-col overflow-hidden">
      <h2 className="text-yellow-400 text-center text-lg mb-3">TEMPORARY PAUSE</h2>
      
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        
        <div className="text-white text-center text-sm">
          The battle has been temporarily paused due to network issues.
        </div>
        
        <div className="bg-black/50 border border-yellow-400 p-4 rounded-md text-center">
          <p className="text-yellow-200 mb-2 text-sm">Our team is working on it</p>
          <p className="text-white text-xs mt-2">
            Your bets are safe and the match will resume shortly.
          </p>
        </div>
      </div>
      
      <div className="mt-4 bg-black/50 p-2 text-center rounded-md">
        <p className="text-gray-400 text-[10px]">
          Please wait, the battle will automatically resume once the issue is resolved.
        </p>
      </div>
      
      <style jsx>{`
        .pulse-animation {
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0% {
            opacity: 1;
          }
          50% {
            opacity: 0.6;
          }
          100% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default BetPaused; 