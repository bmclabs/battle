import React, { useState } from 'react';
import { Fighter, GameMode } from '../../types';
import { formatSolAmount } from '../../utils';

interface BettingPanelProps {
  fighter1: Fighter | null;
  fighter2: Fighter | null;
  gameMode: GameMode;
  onPlaceBet: (fighterId: string, amount: number) => Promise<void>;
  walletConnected: boolean;
  walletBalance: number;
  totalBetsFighter1: number;
  totalBetsFighter2: number;
}

const BettingPanel: React.FC<BettingPanelProps> = ({
  fighter1,
  fighter2,
  gameMode,
  onPlaceBet,
  walletConnected,
  walletBalance,
  totalBetsFighter1,
  totalBetsFighter2
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
    <div className="w-full h-full bg-black border-4 border-primary p-3 pixel-border flex flex-col overflow-hidden">
      <h2 className="text-white text-center text-lg mb-2">PLACE YOUR BET</h2>
      
      {/* Fighter selection */}
      <div className="grid grid-cols-2 gap-2 mb-2">
        <button
          onClick={() => handleSelectFighter(fighter1.id)}
          className={`pixel-button ${
            selectedFighter === fighter1.id 
              ? 'bg-secondary border-white' 
              : 'bg-gray-800 border-primary'
          } py-1 px-2 ${!walletConnected || isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:border-white'}`}
          disabled={!walletConnected || isSubmitting}
        >
          {fighter1.name}
        </button>
        
        <button
          onClick={() => handleSelectFighter(fighter2.id)}
          className={`pixel-button ${
            selectedFighter === fighter2.id 
              ? 'bg-secondary border-white' 
              : 'bg-gray-800 border-secondary'
          } py-1 px-2 ${!walletConnected || isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:border-white'}`}
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
            className={`flex-1 min-w-0 bg-gray-800 text-white p-1 text-sm border-2 border-gray-700 focus:border-primary outline-none ${!walletConnected || isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!walletConnected || isSubmitting}
          />
          <button
            onClick={() => walletConnected && !isSubmitting && setBetAmount(walletBalance.toString())}
            className={`bg-gray-700 text-white px-2 text-xs whitespace-nowrap ${!walletConnected || isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-600'}`}
            disabled={!walletConnected || isSubmitting}
          >
            MAX
          </button>
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
                ${parseFloat(betAmount) === amount ? 'bg-secondary text-white' : 'bg-gray-800 text-gray-300'} 
                border border-gray-700 hover:border-secondary
                ${!walletConnected || isSubmitting || amount > walletBalance ? 'opacity-50 cursor-not-allowed' : ''}
                transition-colors
              `}
              disabled={!walletConnected || isSubmitting || amount > walletBalance}
            >
              {amount} SOL
            </button>
          ))}
        </div>
      </div>
      
      {/* Submit button */}
      <button
        onClick={handleSubmitBet}
        disabled={!walletConnected || isSubmitting || !selectedFighter || !betAmount}
        className={`w-full pixel-button py-1 ${!walletConnected || isSubmitting || !selectedFighter || !betAmount ? 'opacity-50 cursor-not-allowed' : 'hover:bg-secondary'}`}
      >
        {isSubmitting ? 'PLACING BET...' : 'PLACE BET'}
      </button>
      
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