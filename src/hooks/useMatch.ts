import { useEffect, useState } from 'react';
import { fetchCurrentMatch } from '../services/match';
import { 
  subscribeToMatchUpdates, 
  subscribeToMatchStatusChanges, 
  subscribeToMatchResults,
  MatchData
} from '../services/socket';
import { GameMode, Match } from '../types';

export const useMatch = () => {
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [gameMode, setGameMode] = useState<GameMode>(GameMode.PREPARATION);
  const [matchAccountPubkey, setMatchAccountPubkey] = useState<string | null>(null);

  // Initial match load
  useEffect(() => {
    const loadMatch = async () => {
      try {
        setLoading(true);
        
        try {
          // Try to fetch the current match from the API
          const matchData = await fetchCurrentMatch();
          setMatch(matchData);
          setGameMode(matchData.status);
          
          // Store the match account pubkey
          if (matchData.matchAccountPubkey) {
            setMatchAccountPubkey(matchData.matchAccountPubkey);
          }
          setError(null);
        } catch (fetchError) {
          // If no active match found, use a default match
          if (fetchError instanceof Error && fetchError.message === 'No active match found') {
            // TODO: Implement wording on the UI, ensure the component like panel is showing just with the text "No active match found"
          } else {
            // Handle other errors
            throw fetchError;
          }
        }
      } catch (err) {
        setError('Failed to load match data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadMatch();
  }, []);

  // Subscribe to real-time match updates
  useEffect(() => {
    const cleanupFns: (() => void)[] = [];
    
    // Subscribe to match updates (new fighters, new match, etc)
    const unsubscribeMatchUpdates = subscribeToMatchUpdates((matchData: MatchData) => {
      console.log('Received match update:', matchData);
      
      // If we have an existing match, update it
      if (match && match.id === matchData.matchId) {
        // Update the match with new data
        setMatch(prevMatch => {
          if (!prevMatch) return prevMatch;
          
          return {
            ...prevMatch,
            // Update status if provided
            status: matchData.mode || prevMatch.status,
            // Update winner if provided
            winner: matchData.winner || prevMatch.winner,
          };
        });
        
        // Update game mode if changed
        if (matchData.mode) {
          setGameMode(matchData.mode);
        }
      } else {
        // This is a new match, we should reload the full match data
        fetchCurrentMatch()
          .then(newMatchData => {
            setMatch(newMatchData);
            setGameMode(newMatchData.status);
            if (newMatchData.matchAccountPubkey) {
              setMatchAccountPubkey(newMatchData.matchAccountPubkey);
            }
          })
          .catch(err => {
            console.error('Failed to fetch new match after update:', err);
          });
      }
    });
    cleanupFns.push(unsubscribeMatchUpdates);
    
    // Subscribe to match status changes
    const unsubscribeStatusChanges = subscribeToMatchStatusChanges(({ matchId, status }) => {
      console.log(`Match ${matchId} status changed to: ${status}`);
      
      // Only update if this is our current match
      if (match && match.id === matchId) {
        // Convert status string to GameMode enum
        const newGameMode = status as GameMode;
        setGameMode(newGameMode);
        
        // Update match status as well
        setMatch(prevMatch => {
          if (!prevMatch) return prevMatch;
          return {
            ...prevMatch,
            status: newGameMode
          };
        });
      }
    });
    cleanupFns.push(unsubscribeStatusChanges);
    
    // Subscribe to match results
    const unsubscribeMatchResults = subscribeToMatchResults(({ matchId, winner, status }) => {
      console.log(`Match ${matchId} result: winner=${winner}, status=${status}`);
      
      // Only update if this is our current match
      if (match && match.id === matchId) {
        // Convert status string to GameMode enum
        const newGameMode = status as GameMode;
        setGameMode(newGameMode);
        
        // Update match with winner and status
        setMatch(prevMatch => {
          if (!prevMatch) return prevMatch;
          return {
            ...prevMatch,
            status: newGameMode,
            winner: winner
          };
        });
      }
    });
    cleanupFns.push(unsubscribeMatchResults);
    
    // Clean up subscriptions
    return () => {
      cleanupFns.forEach(fn => fn());
    };
  }, [match]);

  return { match, loading, error, gameMode, setGameMode, matchAccountPubkey };
}; 