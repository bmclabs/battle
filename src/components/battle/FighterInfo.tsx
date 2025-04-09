import React from 'react';
import { Fighter } from '../../types';

interface FighterInfoProps {
  fighter: Fighter;
  totalBets: number;
  isPrimary?: boolean;
}

const FighterInfo: React.FC<FighterInfoProps> = ({
  fighter,
  totalBets,
  isPrimary = true
}) => {
  return (
    <div className={`bg-black/80 border-2 ${isPrimary ? 'border-primary' : 'border-secondary'} p-4 retro-container`}>
      <div className="flex items-center space-x-4">
        
        <div>
          <h3 className="text-white text-lg font-bold">{fighter.name}</h3>
          <p className={`${isPrimary ? 'text-primary' : 'text-secondary'} text-sm`}>
            Total Bets: {totalBets.toFixed(2)} SOL
          </p>
        </div>
      </div>
    </div>
  );
};

export default FighterInfo; 