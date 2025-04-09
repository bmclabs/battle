import React, { useState } from 'react';
import { Fighter, GameMode } from '../../types';
import { formatSolAmount } from '../../utils';
import Button from '../ui/Button';
import TransactionStatus from '../TransactionStatus';
import { TransactionStatusUpdate } from '../../hooks/useBetting';

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
  onPlaceBet: (fighterId: string, amount: number, onTransactionUpdate: (update: TransactionStatusUpdate) => void) => Promise<void>;
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
  
  // New state for transaction status
  const [transactionStatus, setTransactionStatus] = useState<'idle' | 'processing' | 'confirmed' | 'cancelled' | 'failed'>('idle');
  // txSignature use in handleTransactionUpdate and UI components
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [txSignature, setTxSignature] = useState<string | undefined>(undefined);

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

  const fighter1Colors = getFighterColors(fighter1.name);
  const fighter2Colors = getFighterColors(fighter2.name);

  const handleSelectFighter = (fighterId: string) => {
    if (!walletConnected || isSubmitting) return;
    setSelectedFighter(fighterId);
    setError(null);
    // Reset transaction status when changing fighter
    if (transactionStatus !== 'idle') {
      setTransactionStatus('idle');
      setTxSignature(undefined);
    }
  };

  const handleBetAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and decimals
    if (/^\d*\.?\d*$/.test(value)) {
      setBetAmount(value);
      // Check if amount is less than minimum required
      if (value && parseFloat(value) < 0.05) {
        setError('Minimum bet is 0.05 SOL');
      } else {
        setError(null);
      }
      // Reset transaction status when changing amount
      if (transactionStatus !== 'idle') {
        setTransactionStatus('idle');
        setTxSignature(undefined);
      }
    }
  };

  const handleSelectBetAmount = (amount: number) => {
    // Check minimum bet amount
    if (amount < 0.05) {
      setBetAmount(amount.toString());
      setError('Minimum bet is 0.05 SOL');
      return;
    }
    
    // Don't allow selecting amounts greater than wallet balance
    if (amount <= walletBalance) {
      setBetAmount(amount.toString());
      setError(null);
      // Reset transaction status when changing amount
      if (transactionStatus !== 'idle') {
        setTransactionStatus('idle');
        setTxSignature(undefined);
      }
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

    if (amount < 0.05) {
      setError('Minimum bet is 0.05 SOL');
      return;
    }

    if (amount > walletBalance) {
      setError('Insufficient balance');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      
      // Update transaction status to processing
      setTransactionStatus('processing');
      
      // Define the transaction update handler to update local UI state
      const handleTransactionUpdate = (update: TransactionStatusUpdate) => {
        console.log('Transaction update:', update);
        
        // Important: This callback will be called exactly once for each state change
        // rather than repeatedly polling. The transaction states are:
        // - 'processing': Transaction is being prepared and submitted to the blockchain
        // - 'confirmed': Transaction has been sent and saved to the backend
        //                (no WebSocket polling for confirmation)
        // - 'cancelled': User cancelled the transaction
        // - 'already-bet': User has already placed a bet in this match
        if (update.status === 'cancelled') {
          setTransactionStatus('cancelled');
          setIsSubmitting(false);
          // Allow the user to submit again after cancellation
          setTimeout(() => {
            setTransactionStatus('idle');
          }, 3000);
        } else if (update.status === 'confirmed') {
          // Set signature and status only once when backend confirms
          setTxSignature(update.signature);
          setTransactionStatus('confirmed');
          
          // Reset form after successful bet
          setTimeout(() => {
            setBetAmount('');
            setSelectedFighter(null);
            setTransactionStatus('idle');
            setTxSignature(undefined);
          }, 3000);
        } else if (update.status === 'already-bet') {
          // Handle already bet error from RPC or backend
          setError('You have already placed a bet in this match');
          setTransactionStatus('failed');
          setIsSubmitting(false);
        }
      };
      
      // Call the place bet function once and wait for result
      // The transaction is confirmed in the blockchain service, avoiding multiple RPC calls
      await onPlaceBet(selectedFighter, amount, handleTransactionUpdate);
    } catch (err) {
      // Handle errors and show appropriate message
      const errorMessage = err instanceof Error ? err.message : 'Failed to place bet. Please try again.';
      
      // If the user cancelled the transaction, don't show as an error
      if (errorMessage.includes('cancelled by user') || errorMessage.includes('User rejected')) {
        console.log('User cancelled the transaction');
        // The cancelled status was already set in the handleTransactionUpdate callback
      } else if (errorMessage.includes('already placed a bet')) {
        // Handle "already bet" error
        setError('You have already placed a bet in this match');
        setTransactionStatus('failed');
      } else {
        setError(errorMessage);
        setTransactionStatus('failed');
      }
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
          onClick={() => handleSelectFighter(fighter1.name)}
          className={`
            py-2 px-3 
            ${selectedFighter === fighter1.name ? 'font-bold' : 'font-normal'}
            ${!walletConnected || isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-[#14F195]'}
            text-white text-sm
            border-2 transition-all rounded-md
          `}
          style={{
            borderColor: fighter1Colors.border,
            backgroundColor: selectedFighter === fighter1.name ? fighter1Colors.background : 'transparent',
          }}
          disabled={!walletConnected || isSubmitting}
        >
          {fighter1.name}
        </button>
        
        <button
          onClick={() => handleSelectFighter(fighter2.name)}
          className={`
            py-2 px-3 
            ${selectedFighter === fighter2.name ? 'font-bold' : 'font-normal'}
            ${!walletConnected || isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-[#14F195]'}
            text-white text-sm
            border-2 transition-all rounded-md
          `}
          style={{
            borderColor: fighter2Colors.border,
            backgroundColor: selectedFighter === fighter2.name ? fighter2Colors.background : 'transparent',
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
            className={`retro-input flex-1 min-w-0 ${!walletConnected || isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#14F195]'}`}
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
      {transactionStatus === 'idle' && (
        <Button
          onClick={handleSubmitBet}
          disabled={!walletConnected || isSubmitting || !selectedFighter || !betAmount || parseFloat(betAmount) < 0.05}
          className={`${!walletConnected || isSubmitting || !selectedFighter || !betAmount || parseFloat(betAmount) < 0.05 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-[#14F195]'}`}
        >
          Place Bet
        </Button>
      )}
      
      {/* Transaction Status */}
      <TransactionStatus
        status={transactionStatus}
        error={error || undefined}
      />
      
      {/* Error message (only show if not showing in transaction status) */}
      {error && transactionStatus === 'idle' && (
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