import React from 'react';
import { GameMode } from '../types';
import Button from './ui/Button';

interface GameModeSwitcherProps {
  currentMode: GameMode;
  onModeChange: (mode: GameMode) => void;
}

const GameModeSwitcher: React.FC<GameModeSwitcherProps> = ({
  currentMode,
  onModeChange
}) => {
  return (
    <div className="fixed bottom-4 right-4 bg-black/80 p-2 border border-primary rounded z-50 retro-container">
      <div className="text-white text-xs mb-2 pixel-pulse">Demo Controls:</div>
      <div className="flex space-x-2">
        <Button
          onClick={() => onModeChange(GameMode.PREPARATION)}
          variant={currentMode === GameMode.PREPARATION ? 'primary' : 'dark'}
          size="xs"
        >
          Preparation
        </Button>
        <Button
          onClick={() => onModeChange(GameMode.BATTLE)}
          variant={currentMode === GameMode.BATTLE ? 'primary' : 'dark'}
          size="xs"
        >
          Battle
        </Button>
        <Button
          onClick={() => onModeChange(GameMode.RESULT)}
          variant={currentMode === GameMode.RESULT ? 'primary' : 'dark'}
          size="xs"
        >
          Result
        </Button>
      </div>
    </div>
  );
};

export default GameModeSwitcher; 