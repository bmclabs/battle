'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '@/lib/providers/ToastProvider';

// Simplified transaction status that only tracks essential states
type TransactionStatus = 'idle' | 'processing' | 'confirmed' | 'cancelled' | 'failed';

interface TransactionStatusProps {
  status: TransactionStatus;
  error?: string;
}

/**
 * A simplified component to display the status of an ongoing transaction
 */
const TransactionStatus: React.FC<TransactionStatusProps> = ({
  status,
  error
}) => {
  const { showToast } = useToast();
  
  // Track the last toast shown to prevent duplicate toasts
  const [lastToastStatus, setLastToastStatus] = useState<TransactionStatus | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [prevStatus, setPrevStatus] = useState<TransactionStatus | null>(null);
  const isAlreadyBetErrorRef = useRef<boolean>(false);
  
  // Check if error is about already placed bet
  useEffect(() => {
    if (error && (error.includes('already placed a bet') || error.includes('already has a bet'))) {
      isAlreadyBetErrorRef.current = true;
    } else if (!error) {
      isAlreadyBetErrorRef.current = false;
    }
  }, [error]);
  
  // Track status changes to show toasts
  useEffect(() => {
    // Track the previous status to detect changes
    setPrevStatus(status);
    
    // Only show one toast per status change to avoid duplicates
    if (status !== 'idle' && lastToastStatus !== status) {
      if (status === 'processing') {
        showToast('Processing transaction...', 'info');
      } else if (status === 'confirmed') {
        showToast('Transaction confirmed!', 'success');
      } else if (status === 'cancelled') {
        showToast('Transaction cancelled', 'info');
      } else if (status === 'failed') {
        showToast(error || 'Transaction failed', 'error');
      }
      
      setLastToastStatus(status);
    }
  }, [status, error, lastToastStatus, showToast]);

  // Don't render anything in idle state
  if (status === 'idle') {
    return null;
  }

  const getStatusMessage = () => {
    if (isAlreadyBetErrorRef.current) {
      return 'You already have a bet in this match';
    }
    
    switch (status) {
      case 'processing':
        return 'Processing transaction...';
      case 'confirmed':
        return 'Bet placed successfully!';
      case 'cancelled':
        return 'Transaction cancelled';
      case 'failed':
        return error || 'Transaction failed';
      default:
        return 'Processing transaction...';
    }
  };

  const getStatusColor = () => {
    if (isAlreadyBetErrorRef.current) {
      return 'text-red-500 border-red-500 bg-red-900/30';
    }
    
    switch (status) {
      case 'confirmed':
        return 'text-green-500 border-green-500 bg-green-900/30';
      case 'failed':
        return 'text-red-500 border-red-500 bg-red-900/30';
      case 'cancelled':
        return 'text-yellow-500 border-yellow-500 bg-yellow-900/30';
      default:
        return 'text-blue-500 border-blue-500 bg-blue-900/30';
    }
  };

  const getStatusIcon = () => {
    if (isAlreadyBetErrorRef.current) {
      return '❌';
    }
    
    switch (status) {
      case 'confirmed':
        return '✅';
      case 'failed':
        return '❌';
      case 'cancelled':
        return '⚠️';
      default:
        return (
          <svg className="animate-spin h-4 w-4 text-white inline-block mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        );
    }
  };

  return (
    <div className={`mt-2 px-3 py-2 rounded border ${getStatusColor()} text-xs`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className="mr-2">{getStatusIcon()}</span>
          <span className='text-[10px]'>{getStatusMessage()}</span>
        </div>
      </div>
    </div>
  );
};

export default TransactionStatus; 