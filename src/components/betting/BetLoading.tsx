import React from 'react';

const BetLoading: React.FC = () => {
  return (
    <div className="w-full h-[450px] bg-black/80 border-2 border-primary p-3 retro-container flex flex-col overflow-hidden items-center justify-center">
       <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#14F195] mb-2"></div>
    </div>
  );
};

export default BetLoading; 