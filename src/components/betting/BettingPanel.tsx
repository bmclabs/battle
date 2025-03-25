import React, { useState } from 'react';
import { Fighter, GameMode } from '../../types';
import { formatSolAmount } from '../../utils';
import Button from '../ui/Button';

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
        <Button
          onClick={() => handleSelectFighter(fighter1.id)}
          variant={selectedFighter === fighter1.id ? 'secondary' : 'dark'}
          size="xs"
          disabled={!walletConnected || isSubmitting}
        >
          {fighter1.name}
        </Button>
        
        <Button
          onClick={() => handleSelectFighter(fighter2.id)}
          variant={selectedFighter === fighter2.id ? 'secondary' : 'dark'}
          size="xs"
          disabled={!walletConnected || isSubmitting}
        >
          {fighter2.name}
        </Button>
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
                ${parseFloat(betAmount) === amount ? 'bg-secondary text-white' : 'bg-black/50 text-gray-300'} 
                border border-primary
                ${!walletConnected || isSubmitting || amount > walletBalance ? 'opacity-50 cursor-not-allowed' : ''}
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
        <div className="mt-1 text-red-500 text-xs text-center pixel-glitch">
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