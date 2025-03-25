import React from 'react';
import { Bet, Fighter, GameMode } from '../../types';
import { formatWalletAddress, formatSolAmount } from '../../utils';

interface BetsListProps {
  bets: Bet[];
  fighter1: Fighter | null;
  fighter2: Fighter | null;
  gameMode: GameMode;
  totalBetsFighter1: number;
  totalBetsFighter2: number;
}

const BetsList: React.FC<BetsListProps> = ({
  bets,
  fighter1,
  fighter2,
  gameMode,
  totalBetsFighter1,
  totalBetsFighter2
}) => {
  // Sort bets by timestamp (newest first)
  const sortedBets = [...bets].sort((a, b) => b.timestamp - a.timestamp);
  
  // Only show in battle mode
  if (gameMode !== GameMode.BATTLE || !fighter1 || !fighter2) {
    return null;
  }
  
  return (
    <div className="w-full h-full bg-black/80 border-2 border-primary p-3 retro-container flex flex-col overflow-hidden">
      <h2 className="text-white text-center text-lg mb-2">ACTIVE BETS</h2>
      
      {/* Bets summary */}
      {fighter1 && fighter2 && (
        <div className="grid grid-cols-2 gap-2 mb-2 text-center">
          <div>
            <p className="text-primary text-xs">{fighter1.name}</p>
            <p className="text-white text-xs">{formatSolAmount(totalBetsFighter1)} SOL</p>
          </div>
          <div>
            <p className="text-secondary text-xs">{fighter2.name}</p>
            <p className="text-white text-xs">{formatSolAmount(totalBetsFighter2)} SOL</p>
          </div>
        </div>
      )}
      
      {/* Bets list - Scrollable */}
      <div className="flex-1 overflow-y-auto pixel-scrollbar">
        {sortedBets.length === 0 ? (
          <div className="text-gray-400 text-center text-xs py-4">
            No bets placed yet
          </div>
        ) : (
          <div className="space-y-1 pr-1">
            {sortedBets.map((bet) => {
              const isFighter1 = fighter1 && bet.fighterId === fighter1.id;
              const fighterName = isFighter1 
                ? fighter1?.name 
                : fighter2?.name;
              
              return (
                <div 
                  key={`${bet.walletAddress}-${bet.timestamp}`}
                  className={`p-1 border ${isFighter1 ? 'border-primary' : 'border-secondary'} bg-black/80`}
                >
                  <div className="flex justify-between items-center">
                    <div className="text-gray-300 text-xs">
                      {formatWalletAddress(bet.walletAddress)}
                    </div>
                    <div className="text-white text-xs">
                      {formatSolAmount(bet.amount)} SOL
                    </div>
                  </div>
                  <div className="text-xs">
                    <span className={isFighter1 ? 'text-primary' : 'text-secondary'}>
                      {fighterName}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BetsList; 