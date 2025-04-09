import React from 'react';
import { Fighter } from '../../types';

interface BetRefundFailedProps {
  fighter1: Fighter | null;
  fighter2: Fighter | null;
  userBetFighterId: string | null;
}

const BetRefundFailed: React.FC<BetRefundFailedProps> = ({
  fighter1,
  fighter2,
  userBetFighterId
}) => {
  // Get fighter the user bet on (if any)
  const userBetFighter = userBetFighterId 
    ? fighter1?.name.toLowerCase() === userBetFighterId.toLowerCase()
      ? fighter1
      : fighter2?.name.toLowerCase() === userBetFighterId.toLowerCase()
        ? fighter2
        : null
    : null;

  return (
    <div className="w-full h-[450px] bg-black/80 border-2 border-primary p-3 retro-container flex flex-col overflow-hidden">
      <h2 className="text-red-400 text-center text-base mb-3">REFUND ISSUE</h2>
      
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        
        <div className="text-white text-center">
          {userBetFighterId ? (
            <>
              There was an issue refunding your bet on <span className="text-red-400 font-bold">{userBetFighter?.name}</span>
            </>
          ) : (
            <>There was an issue with the refund process</>
          )}
        </div>
        
        <div className="bg-black/50 border border-red-400 p-4 rounded-md text-center">
          <p className="text-red-200 mb-2 text-sm">Our team has been notified</p>
          <p className="text-white text-xs">
            We&apos;re working to resolve this issue as quickly as possible.
          </p>
          <p className="text-white text-xs mt-2">
            If you don&apos;t receive your refund within 24 hours, please contact support.
          </p>
        </div>
      </div>

      <div className="text-white text-center mt-6 mb-4">
        <div className="flex items-center justify-center gap-2">
          <div
            className="w-4 h-4 bg-white rounded-full animate-wave"
            style={{ animationDelay: "0s" }}
          ></div>
          <div
            className="w-4 h-4 bg-white rounded-full animate-wave"
            style={{ animationDelay: "0.2s" }}
          ></div>
          <div
            className="w-4 h-4 bg-white rounded-full animate-wave"
            style={{ animationDelay: "0.4s" }}
          ></div>
        </div>
      </div>
      
      <div className="mt-4 bg-black/50 p-2 text-center rounded-md">
        <p className="text-gray-400 text-[10px]">
          Click <a href="https://discord.gg/Knnvu9zf5x" target="_blank" rel="noopener noreferrer" className="text-[#14F195]">here</a> to join our Discord
        </p>
      </div>
    </div>
  );
};

export default BetRefundFailed; 