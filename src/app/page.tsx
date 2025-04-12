'use client';

import React, { useEffect } from 'react';
import Header from '../components/Header';
import BattleArena from '../components/battle/BattleArena';
import ChatContainer from '../components/chat/ChatContainer';
import BettingPanel from '../components/betting/BettingPanel';
import BetsList from '../components/betting/BetsList';
import BetPlacedPanel from '../components/betting/BetPlacedPanel';
import CoinChart from '../components/chart/CoinChart';
import { useMatch } from '../hooks/useMatch';
import { useBetting, TransactionStatusUpdate } from '../hooks/useBetting';
import { useChartData as useChartDataHook } from '../hooks/useChartData';
import { useWalletAuth } from '@/lib/context/WalletContext';
import { initializeSocket, disconnectSocket } from '../services/socket';
import { GameMode } from '../types';
import BetPaused from '@/components/betting/BetPaused';
import ChartPaused from '@/components/chart/ChartPaused';
import BetClaiming from '@/components/betting/BetClaiming';
import BetRefund from '@/components/betting/BetRefund';
import BetRefundFailed from '@/components/betting/BetRefundFailed';
import BetLogo from '@/components/betting/BetLogo';
import BetLoading from '@/components/betting/BetLoading';
import Link from 'next/link';
import OnboardingModal from '@/components/OnboardingModal';
import useOnboarding from '@/hooks/useOnboarding';

export default function Home() {
  // Initialize socket connection
  useEffect(() => {
    initializeSocket();
    
    // Cleanup - disconnect socket
    return () => {
      disconnectSocket();
    };
  }, []);
  
  // Get wallet connection status
  const { connected, isAuthenticated, walletAddress, balance, user } = useWalletAuth();
  
  // Get onboarding status
  const { showOnboarding, completeOnboarding } = useOnboarding();

  // Match data and loading state
  const { match, loading: matchLoading, gameMode } = useMatch();
  
  // Betting data
  const { 
    matchBets, 
    loading: bettingLoading, 
    submitBet,
    userBets,
  } = useBetting({ 
    matchId: match?.matchId || '',
    gameMode: gameMode
  });

  // Get chart data for selected fighter
  const { 
    chartData: fighter1ChartData, 
    loading: fighter1ChartLoading,
    error: fighter1ChartError
  } = useChartDataHook(match?.fighter1 || '', match?.matchId || '');

  const { 
    chartData: fighter2ChartData, 
    loading: fighter2ChartLoading,
    error: fighter2ChartError
  } = useChartDataHook(match?.fighter2 || '', match?.matchId || '');

  // Check if user has a placed bet
  const userPlacedBet = userBets.find(bet => bet.status === 'placed');

  // Effect to ensure bet data is cleared when user disconnects
  useEffect(() => {
    if (!connected) {
      console.log('User disconnected, ensuring bet data is cleared');
      // The userBets array should be empty at this point due to the useBetting hook
      // This is a safety check to ensure the UI updates correctly
    }
  }, [connected]);

  // Handle placing a bet
  const handlePlaceBet = async (fighterId: string, amount: number, onTransactionUpdate?: (update: TransactionStatusUpdate) => void) => {
    if (!connected || !isAuthenticated) {
      console.error("User not authenticated");
      return;
    }
    
    if (!user?.id) {
      console.error("User not authenticated");
      return;
    }
    
    if (!match?.matchId) {
      console.error("No active match");
      return;
    }
    
    if (!match?.matchAccountPubkey) {
      console.error("Match account public key not available");
      return;
    }
    
    try {
      // Place bet using on-chain transaction first, then save to backend
      console.log(`Creating bet for fighter ${fighterId} with amount ${amount} SOL`);
      
      // Trigger bet submission with transaction status update callback
      await submitBet(
        walletAddress || '', 
        amount, 
        fighterId, 
        match.matchAccountPubkey,
        onTransactionUpdate
      );
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      
      // Silent handling of user cancellation and already placed bet errors
      // These are handled in the UI via the transaction status callbacks
      if (errorMessage.includes('cancelled by user') || 
          errorMessage.includes('User rejected') ||
          errorMessage.includes('already placed a bet')) {
        return;
      }
      
      console.error('Failed to place bet:', errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative desktop-only-app">
      <Header />
      
      <main className="flex-1 container mx-auto p-4 z-10">
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
                {/* CASE 0: Show BetLogo during completed state */}
              {gameMode === GameMode.COMPLETED && (
                  <div className="h-full">
                    <BetLogo />
                  </div>
                )}

                {/* CASE 1: Show BetLoading during loading state */}
                {bettingLoading && (
                  <div className="h-full">
                    <BetLoading />
                  </div>
                )}

                {/* CASE 2: Show Paused Bet panel when in paused mode or loading */}
                {(gameMode === GameMode.PAUSED) && (
                    <div className="h-full">
                      <BetPaused />
                    </div>
                )}

                {/* CASE 3: Show BetPlacedPanel when user has a bet and not loading */}
                {gameMode === GameMode.PREPARATION && 
                 connected &&
                 userPlacedBet && 
                 !bettingLoading && (
                    <div className="h-full">
                      <BetPlacedPanel
                        bet={userPlacedBet}
                        fighter1={match?.fighters.find(fighter => fighter.name === match?.fighter1) || null}
                        fighter2={match?.fighters.find(fighter => fighter.name === match?.fighter2) || null}
                      />
                    </div>
                )}

                {/* CASE 4: Show BettingPanel when in preparation, no bet, and not loading */}
                {gameMode === GameMode.PREPARATION && 
                 !userPlacedBet && 
                 !bettingLoading && (
                  <BettingPanel
                    fighter1={match?.fighters.find(fighter => fighter.name === match?.fighter1) || null}
                    fighter2={match?.fighters.find(fighter => fighter.name === match?.fighter2) || null}
                    gameMode={gameMode}
                    onPlaceBet={handlePlaceBet}
                    walletConnected={connected}
                    walletBalance={balance}
                  />
                )}
                
                {/* CASE 5: Show BetsList during battle */}
                {gameMode === GameMode.BATTLE && !bettingLoading && (
                  <div className="h-full">
                    <BetsList
                      bets={matchBets || null}
                      fighter1={match?.fighters.find(fighter => fighter.name === match?.fighter1) || null}
                      fighter2={match?.fighters.find(fighter => fighter.name === match?.fighter2) || null}
                      gameMode={gameMode}
                    />
                  </div>
                )}

                {/* CASE 6: Show BetClaiming during claiming state */}
                {gameMode === GameMode.CLAIMING && !bettingLoading && (
                  <div className="h-full">
                    <BetClaiming
                      fighter1={match?.fighters.find(fighter => fighter.name === match?.fighter1) || null}
                      fighter2={match?.fighters.find(fighter => fighter.name === match?.fighter2) || null}
                      winnerId={match?.winner || null}
                      userBetFighterId={userPlacedBet?.fighterId || null}
                    />
                  </div>
                )}

                {/* CASE 7: Show BetRefund during refund state */}
                {gameMode === GameMode.REFUND && !bettingLoading && (
                  <div className="h-full">
                    <BetRefund
                      fighter1={match?.fighters.find(fighter => fighter.name === match?.fighter1) || null}
                      fighter2={match?.fighters.find(fighter => fighter.name === match?.fighter2) || null}
                      userBetFighterId={userPlacedBet?.fighterId || null}
                    />
                  </div>
                )}

                {/* CASE 8: Show BetRefundFailed during refund failed state */}
                {gameMode === GameMode.REFUND_FAILED && !bettingLoading && (
                  <div className="h-full">
                    <BetRefundFailed
                      fighter1={match?.fighters.find(fighter => fighter.name === match?.fighter1) || null}
                      fighter2={match?.fighters.find(fighter => fighter.name === match?.fighter2) || null}
                      userBetFighterId={userPlacedBet?.fighterId || null}
                    />
                  </div>
                )}
              </div>
              
              {/* Battle Arena (center) */}
              <div className="col-span-6 h-full">
                <BattleArena 
                  fighter1={match?.fighters.find(fighter => fighter.name === match?.fighter1) || null}
                  fighter2={match?.fighters.find(fighter => fighter.name === match?.fighter2) || null}
                  gameMode={gameMode}
                />
              </div>
              
              {/* Chat Container (right) */}
              <div className="col-span-3 h-full">
                <ChatContainer
                  walletAddress={walletAddress || ''}
                  connected={connected}
                  userId={user?.id || ''}
                />
              </div>
            </div>
            
            {/* Bottom section: Ad Banner (left) + Charts + Ad Banner (right) */}
            <div className="grid grid-cols-12 gap-4">
              {/* Left Ad Banner */}
              <div className="col-span-3">
                <div className="col-span-3">
                  <Link href="https://discord.gg/Knnvu9zf5x" className="bg-black/50 border-2 border-primary h-40 flex items-center justify-center retro-container hover:bg-primary/50 transition-all duration-300" target="_blank" rel="noopener noreferrer">
                      <p className="text-white/70 text-sm pixel-pulse">SPACE AVAILABLE</p>
                  </Link>
                </div>
              </div>

              {/* Charts Section */}
              <div className="col-span-6 grid grid-cols-2 gap-4">
                {gameMode !== GameMode.PREPARATION && gameMode !== GameMode.BATTLE && (
                    <ChartPaused />
                )}

                {gameMode !== GameMode.PREPARATION && gameMode !== GameMode.BATTLE && (
                    <ChartPaused />
                )}
                
                {/* Fighter 1 Chart */}
                {(gameMode === GameMode.PREPARATION || gameMode === GameMode.BATTLE) && (
                  <CoinChart
                    fighter={match?.fighters.find(fighter => fighter.name === match?.fighter1) || null}
                    chartData={fighter1ChartData}
                    loading={fighter1ChartLoading}
                    error={fighter1ChartError}
                  />
                )}
                
                {/* Fighter 2 Chart */}
                {(gameMode === GameMode.PREPARATION || gameMode === GameMode.BATTLE) && (
                  <CoinChart
                    fighter={match?.fighters.find(fighter => fighter.name === match?.fighter2) || null}
                    chartData={fighter2ChartData}
                    loading={fighter2ChartLoading}
                    error={fighter2ChartError}
                  />
                )}   
              </div>

              {/* Right Ad Banner */}
              <div className="col-span-3">
                <Link href="https://discord.gg/Knnvu9zf5x" className="bg-black/50 border-2 border-primary h-40 flex items-center justify-center retro-container hover:bg-primary/50 transition-all duration-300" target="_blank" rel="noopener noreferrer">
                    <p className="text-white/70 text-sm pixel-pulse">SPACE AVAILABLE</p>
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
      
      {/* Onboarding modal for first-time users */}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={completeOnboarding}
      />
    </div>
  );
}
