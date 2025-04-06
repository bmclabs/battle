import React from 'react';

const BetLogo: React.FC = () => {
  return (
    <div className="w-full h-[450px] bg-black/80 border-2 border-primary p-3 retro-container flex flex-col overflow-hidden items-center justify-center">
       <img src="/logo/bmc-logo-green.png" alt="Bet Paused" className="w-24 h-24 object-contain animate-pulse " />
    </div>
  );
};

export default BetLogo; 