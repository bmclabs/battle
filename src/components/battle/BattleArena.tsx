import React, { useEffect, useRef } from 'react';
import { Fighter, GameMode } from '../../types';

interface BattleArenaProps {
  fighter1: Fighter | null;
  fighter2: Fighter | null;
  gameMode: GameMode;
}

const BattleArena: React.FC<BattleArenaProps> = ({
  gameMode
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Adjust iframe size when container size changes
  useEffect(() => {
    if (!containerRef.current || !iframeRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (iframeRef.current) {
          iframeRef.current.style.width = `${width}px`;
          iframeRef.current.style.height = `${height}px`;
        }
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full bg-black/80 border-2 border-primary relative overflow-hidden retro-container">
      {/* Iframe container with CRT effect */}
      <div className="h-full w-full crt-effect">
        <iframe
          ref={iframeRef}
          src={process.env.NEXT_PUBLIC_BATTLE_ARENA_URL || ''}
          className="w-full h-full border-0 pointer-events-none"
          title="Battle Memecoin Club"
          allowFullScreen
          sandbox="allow-same-origin"
          style={{ display: 'block' }}
        />
      </div>
      
      {/* Game mode indicator overlay */}
      <div className="absolute top-0.5 left-1/2 transform -translate-x-1/2 z-20 bg-black/50 px-4 py-1 border border-primary retro-container">
        <p className="text-white text-[8px] uppercase">
          {gameMode === GameMode.PREPARATION && "Preparation"}
          {gameMode === GameMode.BATTLE && "Battle"}
          {gameMode === GameMode.CLAIMING && "Claiming"}
          {gameMode === GameMode.COMPLETED && "Completed"}
          {gameMode === GameMode.REFUND && "Refund"}
          {gameMode === GameMode.REFUND_FAILED && "Refund Failed"}
          {gameMode === GameMode.PAUSED && "Game Paused"}
        </p>
      </div>
    </div>
  );
};

export default BattleArena; 