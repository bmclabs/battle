import React from 'react';
import Image from 'next/image';
import { formatSolAmount } from '@/utils';

interface SolAmountProps {
  amount: number;
  className?: string;
  iconSize?: number;
  textSize?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Component to display a SOL amount with the SOL icon
 */
const SolAmount: React.FC<SolAmountProps> = ({ 
  amount, 
  className = '', 
  iconSize = 16,
}) => {
  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
        <Image
            src="/icons/sol-full-color-optimized.png"
            width={iconSize}
            height={iconSize}
            alt="SOL"
            className="ml-1"
            priority
        />
      {formatSolAmount(amount)} 
    </span>
  );
};

export default SolAmount; 