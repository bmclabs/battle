import React from 'react';
import Image from 'next/image';

const BetLogo: React.FC = () => {
  return (
    <div className="w-full h-[450px] bg-black/80 border-2 border-primary p-3 retro-container flex flex-col overflow-hidden items-center justify-center">
       <Image src="/logo/bmc-logo-green.png" alt="Bet Paused" width={96} height={96} className="object-contain animate-pulse" />
    </div>
  );
};

export default BetLogo; 