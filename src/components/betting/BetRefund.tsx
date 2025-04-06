import React from 'react';
import { Fighter } from '../../types';

interface BetRefundProps {
  fighter1: Fighter | null;
  fighter2: Fighter | null;
  userBetFighterId: string | null;
}

const BetRefund: React.FC<BetRefundProps> = ({
  fighter1,
  fighter2,
  userBetFighterId
}) => {
  // Get fighter the user bet on (if any)
  const userBetFighter = userBetFighterId 
    ? fighter1?.id.toLowerCase() === userBetFighterId.toLowerCase()
      ? fighter1
      : fighter2?.id.toLowerCase() === userBetFighterId.toLowerCase()
        ? fighter2
        : null
    : null;

  return (
    <div className="w-full h-[450px] bg-black/80 border-2 border-primary p-3 retro-container flex flex-col overflow-hidden">
      <h2 className="text-white text-center text-base mb-3">MATCH REFUNDED</h2>
      
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <div className="text-white text-center">
          {userBetFighterId ? (
            <>
              Your bet on <span className="text-yellow-400 font-bold">{userBetFighter?.name}</span> has been refunded
            </>
          ) : (
            <>This match has been canceled because no one placed a bet on one of the fighters.</>
          )}
        </div>
        
        <div className="bg-black/50 border border-yellow-400 p-4 rounded-md text-center">
          <p className="text-yellow-200 mb-2">Refund process in progress</p>
          <p className="text-white text-sm">
            {userBetFighterId 
              ? "Your funds will be automatically returned to your wallet shortly." 
              : "All bets have been refunded to their respective wallets."}
          </p>
        </div>
      </div>
      
      <div className="mt-4 bg-black/50 p-2 text-center rounded-md">
        <p className="text-gray-400 text-xs">
          Refunds are being processed. This may take 1-5 minutes to complete.
        </p>
      </div>
    </div>
  );
};

export default BetRefund; 