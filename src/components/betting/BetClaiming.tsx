import React, { useEffect, useState } from 'react';
import { Fighter } from '../../types';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

interface BetClaimingProps {
  fighter1: Fighter | null;
  fighter2: Fighter | null;
  winnerId: string | null;
  userBetFighterId: string | null;
}

const BetClaiming: React.FC<BetClaimingProps> = ({
  fighter1,
  fighter2,
  winnerId,
  userBetFighterId
}) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const { width, height } = useWindowSize();
  const userWon = userBetFighterId && winnerId && userBetFighterId.toLowerCase() === winnerId.toLowerCase();

  // Show confetti for winners
  useEffect(() => {
    if (userWon) {
      setShowConfetti(true);
      
      // Hide confetti after 10 seconds
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, [userWon]);

  // Find the winning fighter
  const winningFighter = winnerId 
    ? fighter1?.id.toLowerCase() === winnerId.toLowerCase() 
      ? fighter1 
      : fighter2 
    : null;

  return (
    <div className="w-full h-[450px] bg-black/80 border-2 border-primary p-3 retro-container flex flex-col overflow-hidden">
      {showConfetti && <Confetti width={width} height={height} recycle={false} numberOfPieces={500} />}
      
      <h2 className="text-white text-center text-base mb-3">CLAIMING IN PROGRESS</h2>
      
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        {userWon ? (
          <>
            <div className="text-[#14F195] text-center font-bold text-xl pixel-pulse">
              CONGRATULATIONS!
            </div>
            <div className="text-white text-center">
              You bet on <span className="text-green-400 font-bold">{winningFighter?.name}</span> and won!
            </div>
            <div className="bg-black/50 border border-[#14F195] p-4 rounded-md text-center">
              <p className="text-green-200 mb-2">Your winnings are being processed</p>
              <p className="text-white text-sm">Your funds will be automatically sent to your wallet shortly.</p>
            </div>
          </>
        ) : (
          <>
            {winnerId && (
              <div className="text-[#14F195] text-center font-bold text-xl">
                {winningFighter?.name}
              </div>
            )}
            {winnerId ? (
              <div className="text-white text-center">
                won the battle!
              </div>
            ) : (
              <div className="text-white text-center">
                Calculating the payout...
              </div>
            )}
            <div className="bg-black/50 border border-[#FF69B4] p-4 rounded-md text-center">
              <p className="text-white text-sm">
                {userBetFighterId 
                  ? "Better luck next match! Don't worry, every loss is a chance to learn." 
                  : "Payouts are being processed for all participants."}
              </p>
            </div>
          </>
        )}
      </div>

      <div className="mt-4 bg-black/50 p-2 text-center rounded-md">
        <p className="text-gray-400 text-xs">
          This process may take 1-5 minutes to complete.
        </p>
      </div>
    </div>
  );
};

export default BetClaiming; 