import React from 'react';
import Image from 'next/image';
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
    <div className={`bg-black border-4 ${isPrimary ? 'border-primary' : 'border-secondary'} p-4 pixel-border`}>
      <div className="flex items-center space-x-4">
        <div className="relative w-16 h-16 pixel-pulse">
          <Image
            src={fighter.image}
            alt={fighter.name}
            fill
            className="object-contain pixelated"
          />
        </div>
        
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