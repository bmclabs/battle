import React, { useState } from 'react';
import { Fighter, GameMode } from '../../types';
import { formatSolAmount } from '../../utils';
import Button from '../ui/Button';

// Fighter color map based on chart colors
const FIGHTER_COLORS: Record<string, { border: string, background: string }> = {
  doge: { border: '#BA9F33', background: 'rgba(186, 159, 51, 0.8)' },
  shiba: { border: '#F3A62F', background: 'rgba(243, 166, 47, 0.8)' },
  pepe: { border: '#4C9641', background: 'rgba(76, 150, 65, 0.8)' },
  pengu: { border: '#8CB3FE', background: 'rgba(140, 179, 254, 0.8)' },
  trump: { border: '#EAD793', background: 'rgba(234, 215, 147, 0.8)' },
  brett: { border: '#00ACDC', background: 'rgba(0, 172, 220, 0.8)' }
};

interface BettingPanelProps {
  fighter1: Fighter | null;
  fighter2: Fighter | null;
  gameMode: GameMode;
  onPlaceBet: (fighterId: string, amount: number) => Promise<void>;
  walletConnected: boolean;
  walletBalance: number;
}

const BettingPanel: React.FC<BettingPanelProps> = ({
  fighter1,
  fighter2,
  gameMode,
  onPlaceBet,
  walletConnected,
  walletBalance
}) => {
  const [selectedFighter, setSelectedFighter] = useState<string | null>(null);
  const [betAmount, setBetAmount] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Predefined bet amounts
  const betOptions = [0.1, 0.5, 1, 5, 10, 25, 50, 100];

  // Only show in preparation mode
  if (gameMode !== GameMode.PREPARATION || !fighter1 || !fighter2) {
    return null;
  }

  // Get fighter colors
  const getFighterColors = (fighterId: string) => {
    const lowerFighterId = fighterId.toLowerCase();
    return FIGHTER_COLORS[lowerFighterId] || { border: '#6C757D', background: 'rgba(108, 117, 125, 0.2)' };
  };

  const fighter1Colors = getFighterColors(fighter1.id);
  const fighter2Colors = getFighterColors(fighter2.id);

  const handleSelectFighter = (fighterId: string) => {
    if (!walletConnected || isSubmitting) return;
    setSelectedFighter(fighterId);
    setError(null);
  };

  const handleBetAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and decimals
    if (/^\d*\.?\d*$/.test(value)) {
      setBetAmount(value);
      setError(null);
    }
  };

  const handleSelectBetAmount = (amount: number) => {
    // Don't allow selecting amounts greater than wallet balance
    if (amount <= walletBalance) {
      setBetAmount(amount.toString());
      setError(null);
    } else {
      setError('Insufficient balance');
    }
  };

  const handleSubmitBet = async () => {
    if (!walletConnected) {
      setError('Please connect your wallet first');
      return;
    }

    if (!selectedFighter) {
      setError('Please select a fighter');
      return;
    }

    const amount = parseFloat(betAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (amount > walletBalance) {
      setError('Insufficient balance');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onPlaceBet(selectedFighter, amount);
      setBetAmount('');
      setSelectedFighter(null);
    } catch (err) {
      setError('Failed to place bet. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full h-full bg-black/80 border-2 border-primary p-3 retro-container flex flex-col overflow-hidden">
      <h2 className="text-white text-center text-lg mb-2">PLACE YOUR BET</h2>
      
      {/* Fighter selection */}
      <div className="grid grid-cols-2 gap-2 mb-2">
        <button
          onClick={() => handleSelectFighter(fighter1.id)}
          className={`
            py-2 px-3 
            ${selectedFighter === fighter1.id ? 'font-bold' : 'font-normal'}
            cursor-pointer
            text-white text-sm
            border-2 transition-all rounded-md
          `}
          style={{
            borderColor: fighter1Colors.border,
            backgroundColor: selectedFighter === fighter1.id ? fighter1Colors.background : 'transparent',
          }}
          disabled={!walletConnected || isSubmitting}
        >
          {fighter1.name}
        </button>
        
        <button
          onClick={() => handleSelectFighter(fighter2.id)}
          className={`
            py-2 px-3 
            ${selectedFighter === fighter2.id ? 'font-bold' : 'font-normal'}
            cursor-pointer
            text-white text-sm
            border-2 transition-all rounded-md
          `}
          style={{
            borderColor: fighter2Colors.border,
            backgroundColor: selectedFighter === fighter2.id ? fighter2Colors.background : 'transparent',
          }}
          disabled={!walletConnected || isSubmitting}
        >
          {fighter2.name}
        </button>
      </div>
      
      {/* Bet amount input */}
      <div className="mb-2">
        <label className="block text-white text-xs mb-1">
          Bet Amount (SOL)
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={betAmount}
            onChange={handleBetAmountChange}
            placeholder="0.00"
            className="retro-input flex-1 min-w-0"
            disabled={!walletConnected || isSubmitting}
          />
          <Button
            onClick={() => walletConnected && !isSubmitting && setBetAmount(walletBalance.toString())}
            variant="dark"
            size="xs"
            disabled={!walletConnected || isSubmitting}
          >
            MAX
          </Button>
        </div>
        {walletConnected && (
          <div className="text-gray-400 text-xs mt-1">
            Balance: {formatSolAmount(walletBalance)} SOL
          </div>
        )}
      </div>
      
      {/* Bet amount options */}
      <div className="mb-3">
        <label className="block text-white text-xs mb-1">
          Quick Select
        </label>
        <div className="grid grid-cols-4 gap-1">
          {betOptions.map((amount) => (
            <button
              key={amount}
              onClick={() => walletConnected && !isSubmitting && handleSelectBetAmount(amount)}
              className={`
                text-xs py-1 px-1 
                ${parseFloat(betAmount) === amount ? 'bg-[#14F195] text-black' : 'bg-black/50 text-gray-300'} 
                border border-primary
                ${!walletConnected || isSubmitting || amount > walletBalance ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-[#14F195]'}
              `}
              disabled={!walletConnected || isSubmitting || amount > walletBalance}
            >
              {amount} SOL
            </button>
          ))}
        </div>
      </div>
      
      {/* Submit button */}
      <Button
        onClick={handleSubmitBet}
        disabled={!walletConnected || isSubmitting || !selectedFighter || !betAmount}
        variant="primary"
        fullWidth
        isLoading={isSubmitting}
      >
        PLACE BET
      </Button>
      
      {/* Error message */}
      {error && (
        <div className="mt-1 text-red-500 text-xs text-center">
          {error}
        </div>
      )}
      
      {/* Connect wallet prompt */}
      {!walletConnected && (
        <div className="mt-1 text-center text-gray-400 text-xs">
          Connect your wallet to place bets
        </div>
      )}
    </div>
  );
};

export default BettingPanel; 