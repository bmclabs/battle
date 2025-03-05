import React from 'react';
import { GameMode } from '../types';

interface GameModeSwitcherProps {
  currentMode: GameMode;
  onModeChange: (mode: GameMode) => void;
}

const GameModeSwitcher: React.FC<GameModeSwitcherProps> = ({
  currentMode,
  onModeChange
}) => {
  return (
    <div className="fixed bottom-4 right-4 bg-black/80 p-2 border-2 border-primary rounded z-50 pixel-border">
      <div className="text-white text-xs mb-2 pixel-pulse">Demo Controls:</div>
      <div className="flex space-x-2">
        <button
          onClick={() => onModeChange(GameMode.PREPARATION)}
          className={`text-xs px-2 py-1 ${
            currentMode === GameMode.PREPARATION
              ? 'bg-primary text-white'
              : 'bg-gray-800 text-gray-300'
          } pixel-button`}
        >
          Preparation
        </button>
        <button
          onClick={() => onModeChange(GameMode.BATTLE)}
          className={`text-xs px-2 py-1 ${
            currentMode === GameMode.BATTLE
              ? 'bg-primary text-white'
              : 'bg-gray-800 text-gray-300'
          } pixel-button`}
        >
          Battle
        </button>
        <button
          onClick={() => onModeChange(GameMode.RESULT)}
          className={`text-xs px-2 py-1 ${
            currentMode === GameMode.RESULT
              ? 'bg-primary text-white'
              : 'bg-gray-800 text-gray-300'
          } pixel-button`}
        >
          Result
        </button>
      </div>
    </div>
  );
};

export default GameModeSwitcher; 