import React, { useEffect, useRef } from 'react';
import { Fighter, GameMode } from '../../types';

interface BattleArenaProps {
  fighter1: Fighter | null;
  fighter2: Fighter | null;
  gameMode: GameMode;
}

// Define more specific types for Twitch embed
type TwitchPlayer = {
  play: () => void;
  pause: () => void;
  setVolume: (volume: number) => void;
  getMuted: () => boolean;
  setMuted: (muted: boolean) => void;
  getChannel: () => string;
  setChannel: (channel: string) => void;
  setQuality: (quality: string) => void;
};

type TwitchEmbed = {
  getPlayer: () => TwitchPlayer;
  addEventListener: (event: string, callback: () => void) => void;
};

declare global {
  interface Window {
    Twitch?: {
      Embed: {
        new (elementId: string, options: TwitchEmbedOptions): TwitchEmbed;
        VIDEO_READY: string;
      };
    };
  }
}

interface TwitchEmbedOptions {
  width: number | string;
  height: number | string;
  channel: string;
  layout?: string;
  autoplay?: boolean;
  muted?: boolean;
  theme?: string;
  interactive?: boolean;
  parent: string[];
}

const BattleArena: React.FC<BattleArenaProps> = ({
  gameMode
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const embedRef = useRef<TwitchEmbed | null>(null);
  const embedContainerId = "twitch-embed-container";

  // Initialize Twitch embed when component mounts
  useEffect(() => {
    // Load Twitch embed script
    const script = document.createElement('script');
    script.src = 'https://embed.twitch.tv/embed/v1.js';
    script.async = true;
    script.onload = initTwitchEmbed;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Initialize the Twitch player
  const initTwitchEmbed = () => {
    if (!window.Twitch) return;

    // Extract the channel name from the URL in environment variable
    let channel = 'battlememecoinclub'; // Default channel
    const envUrl = process.env.NEXT_PUBLIC_BATTLE_ARENA_URL || '';
    const channelMatch = envUrl.match(/channel=([^&]+)/);
    if (channelMatch && channelMatch[1]) {
      channel = channelMatch[1];
    }

    // Get the current hostname for the parent parameter
    const hostname = window.location.hostname;
    
    // Create new Twitch Embed
    embedRef.current = new window.Twitch.Embed(embedContainerId, {
      width: '100%',
      height: '100%',
      channel: channel,
      layout: 'video',
      autoplay: true,
      muted: false,
      theme: 'dark',
      interactive: false,
      parent: [hostname, 'arena.battlememecoin.club', 'game-rose-rho.vercel.app', 'localhost'], // Include both current hostname and localhost
    });

    // Add event listener for when the player is ready
    embedRef.current.addEventListener(window.Twitch.Embed.VIDEO_READY, () => {
      console.log('The Twitch player is ready');
    });
  };

  return (
    <div ref={containerRef} className="w-full h-full bg-black/80 border-2 border-primary relative overflow-hidden retro-container">
      {/* Twitch embed container with CRT effect */}
      <div className="h-full w-full crt-effect">
        <div id={embedContainerId} className="w-full h-full"></div>
        {/* Transparent overlay to prevent interaction with the Twitch player */}
        <div className="absolute inset-0 z-10 w-full h-full" style={{ pointerEvents: 'auto' }}></div>
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