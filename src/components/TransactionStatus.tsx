'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/lib/providers/ToastProvider';

type TransactionStatus = 'idle' | 'preparing' | 'sending' | 'confirming' | 'confirmed' | 'retrying' | 'failed';

interface TransactionStatusProps {
  status: TransactionStatus;
  txSignature?: string;
  error?: string;
  retryCount?: number;
  maxRetries?: number;
}

/**
 * A component to display the status of an ongoing blockchain transaction
 * This provides users with real-time feedback during the transaction lifecycle
 */
const TransactionStatus: React.FC<TransactionStatusProps> = ({
  status,
  txSignature,
  error,
  retryCount = 0,
  maxRetries = 3
}) => {
  const { showToast } = useToast();
  const [showDetails, setShowDetails] = useState(false);
  
  // Show toast notifications for important status changes
  useEffect(() => {
    if (status === 'confirmed') {
      showToast('Transaction confirmed successfully!', 'success');
    } else if (status === 'failed' && error) {
      showToast(`Transaction failed: ${error}`, 'error');
    } else if (status === 'retrying') {
      showToast(`Retrying transaction (attempt ${retryCount}/${maxRetries})...`, 'warning');
    }
  }, [status, error, retryCount, maxRetries, showToast]);

  // Don't render anything in idle state
  if (status === 'idle') {
    return null;
  }

  const getStatusMessage = () => {
    switch (status) {
      case 'preparing':
        return 'Preparing transaction...';
      case 'sending':
        return 'Sending transaction...';
      case 'confirming':
        return 'Waiting confirmation...';
      case 'confirmed':
        return 'Transaction confirmed!';
      case 'retrying':
        return `Retrying transaction (${retryCount}/${maxRetries})...`;
      case 'failed':
        return 'Transaction failed';
      default:
        return 'Processing transaction...';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'confirmed':
        return 'text-green-500 border-green-500 bg-green-900/30';
      case 'failed':
        return 'text-red-500 border-red-500 bg-red-900/30';
      case 'retrying':
        return 'text-yellow-500 border-yellow-500 bg-yellow-900/30';
      default:
        return 'text-blue-500 border-blue-500 bg-blue-900/30';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'confirmed':
        return '✅';
      case 'failed':
        return '❌';
      case 'retrying':
        return '🔄';
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
        {(txSignature || error) && (
          <button 
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs underline focus:outline-none"
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>
        )}
      </div>

      {showDetails && (
        <div className="mt-2 pt-2 border-t border-gray-600">
          {txSignature && (
            <div className="mb-1">
              <span className="font-bold block text-xs">Transaction ID:</span>
              <span className="text-xs break-all">{txSignature}</span>
              {status === 'confirmed' && (
                <a 
                  href={`https://explorer.solana.com/tx/${txSignature}?cluster=${process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet'}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block mt-1 text-blue-400 underline text-xs"
                >
                  View on Solana Explorer
                </a>
              )}
            </div>
          )}
          
          {error && (
            <div className="mt-1">
              <span className="font-bold block text-xs">Error:</span>
              <span className="text-xs break-all">{error}</span>
            </div>
          )}
          
          {status === 'failed' && (
            <div className="mt-2 text-xs">
              <p>What to do now:</p>
              <ul className="list-disc list-inside mt-1">
                <li>Check your wallet balance</li>
                <li>Wait a few minutes and try again</li>
                <li>If the problem persists, contact support</li>
              </ul>
            </div>
          )}
        </div>
      )}
      
      {/* Warning message for ongoing transactions */}
      {(status === 'sending' || status === 'confirming' || status === 'retrying') && (
        <div className="mt-2 p-1 bg-yellow-900/20 border border-yellow-500/30 rounded text-yellow-500 text-[10px]">
          <span className="font-bold">⚠️ IMPORTANT:</span> Please do not refresh or close this page during the transaction process.
        </div>
      )}
    </div>
  );
};

export default TransactionStatus; 