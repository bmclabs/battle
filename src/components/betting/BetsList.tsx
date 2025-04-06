import React from 'react';
import { Fighter, GameMode, MatchBettingSummary } from '../../types';
import { formatWalletAddress, formatSolAmount } from '../../utils';

// Individual bet type for display
interface BetDisplay {
  walletAddress: string;
  fighterName: string;
  amount: string;
  timestamp?: number;
}

interface BetsListProps {
  bets: MatchBettingSummary | null;
  fighter1: Fighter | null;
  fighter2: Fighter | null;
  gameMode: GameMode;
}

// Function to get fighter color based on ID
const getFighterColor = (fighterId: string): string => {
  const lowerFighterId = fighterId.toLowerCase();
  
  if (lowerFighterId === 'doge') {
    return '#BA9F33';
  } else if (lowerFighterId === 'shiba') {
    return '#F3A62F';
  } else if (lowerFighterId === 'pepe') {
    return '#4C9641';
  } else if (lowerFighterId === 'pengu') {
    return '#8CB3FE';
  } else if (lowerFighterId === 'trump') {
    return '#EAD793';
  } else if (lowerFighterId === 'brett') {
    return '#00ACDC';
  }
  
  // Default colors if fighter not found
  return '#ffffff';
};

const BetsList: React.FC<BetsListProps> = ({
  bets,
  fighter1,
  fighter2,
  gameMode
}) => {
  // Only show in battle mode
  if (gameMode !== GameMode.BATTLE || !fighter1 || !fighter2) {
    return null;
  }
  
  // Sort user bets by amount (descending)
  const sortedUserBets = bets?.userBets ? [...bets.userBets].sort((a, b) => {
    const amountA = parseFloat(a.amount);
    const amountB = parseFloat(b.amount);
    return amountB - amountA;
  }) : [];
  
  // Get colors for fighters
  const fighter1Color = getFighterColor(fighter1.id);
  const fighter2Color = getFighterColor(fighter2.id);
  
  return (
    <div className="w-full h-[450px] bg-black/80 border-2 border-primary p-3 retro-container flex flex-col overflow-hidden">
      <h2 className="text-white text-center text-lg mb-2">ACTIVE BETS</h2>
      
      {/* Bets summary */}
      {fighter1 && fighter2 && (
        <div className="grid grid-cols-2 gap-2 mb-2 text-center">
          <div>
            <p style={{ color: fighter1Color }} className="text-xs">{fighter1.name}</p>
            <p className="text-white text-xs">
              {formatSolAmount(bets?.fighters?.[fighter1.name.toUpperCase()]?.totalAmount || 0)} SOL
            </p>
          </div>
          <div>
            <p style={{ color: fighter2Color }} className="text-xs">{fighter2.name}</p>
            <p className="text-white text-xs">
              {formatSolAmount(bets?.fighters?.[fighter2.name.toUpperCase()]?.totalAmount || 0)} SOL
            </p>
          </div>
        </div>
      )}
      
      {/* Bets list - Scrollable */}
      <div className="flex-1 overflow-y-auto pixel-scrollbar max-h-[calc(100%-80px)]">
        {!bets || (!sortedUserBets.length && (!bets.fighters || Object.keys(bets.fighters).length === 0)) ? (
          <div className="text-gray-400 text-center text-xs py-4">
            No bets placed yet
          </div>
        ) : (
          <div className="space-y-1 pr-1">
            {/* Display sorted user bets */}
            {sortedUserBets.length > 0 && (
              sortedUserBets.map((bet, index) => {
                const isFighter1 = fighter1 && bet.fighterName.toLowerCase() === fighter1.id.toLowerCase();
                const fighterColor = isFighter1 ? fighter1Color : fighter2Color;
                
                return (
                  <div 
                    key={`${bet.walletAddress}-${index}`}
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
                      <span style={{ color: fighterColor }}>
                        {bet.fighterName.toUpperCase()}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
            
            {/* If no user bets, show summary data */}
            {!sortedUserBets.length && bets.fighters && Object.entries(bets.fighters).map(([fighterName, data]) => {
              const isFighter1 = fighter1 && fighterName.toLowerCase() === fighter1.id.toLowerCase();
              const fighterColor = isFighter1 ? fighter1Color : fighter2Color;
              
              return (
                <div 
                  key={`${fighterName}-${data.totalBets}`}
                  className={`p-1 border ${isFighter1 ? 'border-primary' : 'border-secondary'} bg-black/80`}
                >
                  <div className="flex justify-between items-center">
                    <div className="text-gray-300 text-xs">
                      {data.totalBets} bets
                    </div>
                    <div className="text-white text-xs">
                      {formatSolAmount(data.totalAmount)} SOL
                    </div>
                  </div>
                  <div className="text-xs">
                    <span style={{ color: fighterColor }}>
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