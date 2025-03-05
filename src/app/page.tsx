'use client';

import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BattleArena from '../components/battle/BattleArena';
import ChatRoom from '../components/chat/ChatRoom';
import BettingPanel from '../components/betting/BettingPanel';
import BetsList from '../components/betting/BetsList';
import CoinChart from '../components/chart/CoinChart';
import GameModeSwitcher from '../components/GameModeSwitcher';
import { useMatch } from '../hooks/useMatch';
import { useBetting } from '../hooks/useBetting';
import { useChat } from '../hooks/useChat';
import { useChartData as useChartDataHook } from '../hooks/useChartData';
import { useWallet } from '../hooks/useWallet';
import { initializeSocket, disconnectSocket } from '../services/socket';
import { GameMode } from '../types';

export default function Home() {
  // Initialize socket connection
  useEffect(() => {
    initializeSocket();
    return () => {
      disconnectSocket();
    };
  }, []);

  // Get match data
  const { match, loading: matchLoading, gameMode, setGameMode } = useMatch();

  // Get betting data
  const { 
    bets, 
    submitBet, 
    getTotalBets,
    placingBet
  } = useBetting();

  // Get chat data
  const { 
    messages, 
    sendMessage 
  } = useChat();

  // Get wallet data
  const {
    connected,
    walletAddress,
    balance,
    connecting,
    connect,
    disconnect,
    sendTransaction
  } = useWallet();

  // State for selected fighter for chart
  const [selectedChartFighter, setSelectedChartFighter] = useState<string | null>(null);

  // Get chart data for selected fighter
  const { 
    chartData: fighter1ChartData, 
    loading: fighter1ChartLoading,
    error: fighter1ChartError
  } = useChartDataHook(match?.fighter1?.id || '');

  const { 
    chartData: fighter2ChartData, 
    loading: fighter2ChartLoading,
    error: fighter2ChartError
  } = useChartDataHook(match?.fighter2?.id || '');

  // Handle placing a bet
  const handlePlaceBet = async (fighterId: string, amount: number) => {
    if (!connected) return;
    
    try {
      // Send transaction
      const success = await sendTransaction(amount);
      if (!success) throw new Error('Transaction failed');
      
      // Submit bet
      await submitBet(walletAddress, amount, fighterId);
    } catch (err) {
      console.error('Failed to place bet:', err);
      throw err;
    }
  };

  // Handle sending a chat message
  const handleSendMessage = async (message: string) => {
    if (!connected) return;
    await sendMessage(walletAddress, message);
  };

  // Handle wallet connection
  const handleConnect = async () => {
    try {
      await connect();
    } catch (err) {
      console.error('Failed to connect wallet:', err);
    }
  };

  // Handle game mode change (for demo purposes)
  const handleGameModeChange = (mode: GameMode) => {
    setGameMode(mode);
  };

  // Calculate total bets for each fighter
  const totalBetsFighter1 = match?.fighter1 ? getTotalBets(match.fighter1.id) : 0;
  const totalBetsFighter2 = match?.fighter2 ? getTotalBets(match.fighter2.id) : 0;

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Header
        connected={connected}
        walletAddress={walletAddress}
        balance={balance}
        connecting={connecting}
        onConnect={handleConnect}
        onDisconnect={disconnect}
      />
      
      <main className="flex-1 container mx-auto p-4">
        {matchLoading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-white text-xl">Loading battle...</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {/* Top section: Betting Panel (left) + Battle Arena (center) + Chat (right) */}
            <div className="grid grid-cols-12 gap-4 mb-4 h-[450px]">
              {/* Betting Panel (left) */}
              <div className="col-span-3 h-full">
                {gameMode === GameMode.PREPARATION && (
                  <div className="h-full">
                    <BettingPanel
                      fighter1={match?.fighter1 || null}
                      fighter2={match?.fighter2 || null}
                      gameMode={gameMode}
                      onPlaceBet={handlePlaceBet}
                      walletConnected={connected}
                      walletBalance={balance}
                      totalBetsFighter1={totalBetsFighter1}
                      totalBetsFighter2={totalBetsFighter2}
                    />
                  </div>
                )}
                
                {gameMode === GameMode.BATTLE && (
                  <div className="h-full">
                    <BetsList
                      bets={bets}
                      fighter1={match?.fighter1 || null}
                      fighter2={match?.fighter2 || null}
                      gameMode={gameMode}
                      totalBetsFighter1={totalBetsFighter1}
                      totalBetsFighter2={totalBetsFighter2}
                    />
                  </div>
                )}
              </div>
              
              {/* Battle Arena (center) */}
              <div className="col-span-6">
                <div className="h-[450px]">
                  <BattleArena
                    fighter1={match?.fighter1 || null}
                    fighter2={match?.fighter2 || null}
                    gameMode={gameMode}
                    winner={match?.winner || null}
                  />
                </div>
              </div>
              
              {/* Chat Room (right) */}
              <div className="col-span-3 h-[450px]">
                <ChatRoom
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  walletAddress={walletAddress}
                  connected={connected}
                />
              </div>
            </div>
            
            {/* Bottom section: Ad Banner (left) + Charts + Ad Banner (right) */}
            <div className="grid grid-cols-12 gap-4">
              {/* Left Ad Banner */}
              <div className="col-span-3">
                <div className="bg-black border-4 border-primary h-64 flex items-center justify-center pixel-border">
                  <p className="text-white text-sm pixel-pulse">AD SPACE</p>
                </div>
              </div>

              {/* Charts Section */}
              <div className="col-span-6 grid grid-cols-2 gap-4">
                {/* Fighter 1 Chart */}
                <CoinChart
                  fighter={match?.fighter1 || null}
                  chartData={fighter1ChartData}
                  loading={fighter1ChartLoading}
                  error={fighter1ChartError}
                  gameMode={gameMode}
                />
                
                {/* Fighter 2 Chart */}
                <CoinChart
                  fighter={match?.fighter2 || null}
                  chartData={fighter2ChartData}
                  loading={fighter2ChartLoading}
                  error={fighter2ChartError}
                  gameMode={gameMode}
                />
              </div>

              {/* Right Ad Banner */}
              <div className="col-span-3">
                <div className="bg-black border-4 border-primary h-64 flex items-center justify-center pixel-border">
                  <p className="text-white text-sm pixel-pulse">AD SPACE</p>
                </div>
              </div>
            </div>
            
            {/* Game Mode Switcher (for demo purposes) */}
            <div className="mt-4">
              <GameModeSwitcher
                currentMode={gameMode}
                onModeChange={handleGameModeChange}
              />
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
