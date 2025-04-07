import React from 'react';
import { Fighter, Bet } from '../../types';
import { formatSolAmount } from '../../utils';

// Fighter color map based on chart colors
const FIGHTER_COLORS: Record<string, { border: string, background: string }> = {
  doge: { border: '#BA9F33', background: 'rgba(186, 159, 51, 0.8)' },
  shiba: { border: '#F3A62F', background: 'rgba(243, 166, 47, 0.8)' },
  pepe: { border: '#4C9641', background: 'rgba(76, 150, 65, 0.8)' },
  pengu: { border: '#8CB3FE', background: 'rgba(140, 179, 254, 0.8)' },
  trump: { border: '#EAD793', background: 'rgba(234, 215, 147, 0.8)' },
  brett: { border: '#00ACDC', background: 'rgba(0, 172, 220, 0.8)' }
};

interface BetPlacedPanelProps {
  bet: Bet;
  fighter1: Fighter | null;
  fighter2: Fighter | null;
}

const BetPlacedPanel: React.FC<BetPlacedPanelProps> = ({
  bet,
  fighter1,
  fighter2
}) => {
  // Find the fighter that user bet on
  const selectedFighter = bet.fighterName.toLowerCase() === fighter1?.id.toLowerCase() 
    ? fighter1 
    : bet.fighterName.toLowerCase() === fighter2?.id.toLowerCase() 
      ? fighter2 
      : null;

  // Get fighter colors
  const getFighterColors = (fighterId: string) => {
    const lowerFighterId = fighterId.toLowerCase();
    return FIGHTER_COLORS[lowerFighterId] || { border: '#6C757D', background: 'rgba(108, 117, 125, 0.2)' };
  };

  const selectedFighterColors = selectedFighter 
    ? getFighterColors(selectedFighter.id) 
    : { border: '#6C757D', background: 'rgba(108, 117, 125, 0.2)' };

  return (
    <div className="w-full h-full bg-black/80 border-2 border-primary p-3 retro-container flex flex-col overflow-hidden">
      <h2 className="text-white text-center text-lg mb-4">BET PLACED</h2>
      
      {/* Bet Details */}
      <div className="flex flex-col items-center space-y-3 mb-4">
        <div 
          className="w-full p-4 border-2 rounded-md flex flex-col items-center"
          style={{
            borderColor: selectedFighterColors.border,
            backgroundColor: selectedFighterColors.background,
          }}
        >
          <span className="text-white text-xl font-bold mb-1">
            {selectedFighter?.name || bet.fighterName}
          </span>
          <span className="text-white text-2xl font-bold">
            {formatSolAmount(bet.amount)} SOL
          </span>
        </div>
      </div>
      
      {/* Transaction Info */}
      <div className="mb-4">
        <div className="text-white text-center text-sm mb-1">Transaction Signature</div>
        <div className="bg-black/40 p-2 rounded-md text-gray-300 text-xs text-center break-all">
          {bet.transactionSignature || 'Processing...'}
        </div>
      </div>
      
      {/* Match Status */}
      <div className="mt-auto">
        <div className="text-center text-gray-400 text-sm mb-2">
          Match Status: <span className="text-primary uppercase">Preparation</span>
        </div>
        <div className="text-center text-gray-400 text-xs">
          Battle will begin once preparation phase ends
        </div>
      </div>
    </div>
  );
};

export default BetPlacedPanel; 