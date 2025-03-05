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

  // Only show in preparation mode
  if (gameMode !== GameMode.PREPARATION || !fighter1 || !fighter2) {
    return null;
  }

  const handleSelectFighter = (fighterId: string) => {
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
              ? 'bg-primary border-white' 
              : 'bg-gray-800 border-primary'
          } py-1 px-2`}
        >
          {fighter1.name}
        </button>
        
        <button
          onClick={() => handleSelectFighter(fighter2.id)}
          className={`pixel-button ${
            selectedFighter === fighter2.id 
              ? 'bg-secondary border-white' 
              : 'bg-gray-800 border-secondary'
          } py-1 px-2`}
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
            className="flex-1 min-w-0 bg-gray-800 text-white p-1 text-sm border-2 border-gray-700 focus:border-primary outline-none"
            disabled={!walletConnected || isSubmitting}
          />
          <button
            onClick={() => setBetAmount(walletBalance.toString())}
            className="bg-gray-700 text-white px-2 text-xs whitespace-nowrap"
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
      
      {/* Submit button */}
      <button
        onClick={handleSubmitBet}
        disabled={!walletConnected || isSubmitting || !selectedFighter || !betAmount}
        className="w-full pixel-button disabled:opacity-50 disabled:cursor-not-allowed py-1"
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