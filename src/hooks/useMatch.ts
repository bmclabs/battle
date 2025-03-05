import { useEffect, useState } from 'react';
import { fetchCurrentMatch } from '../services/api';
import { subscribeToMatchUpdates, subscribeToGameModeChanges, subscribeToMatchResults } from '../services/socket';
import { GameMode, Match } from '../types';

export const useMatch = () => {
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [gameMode, setGameMode] = useState<GameMode>(GameMode.PREPARATION);

  useEffect(() => {
    const loadMatch = async () => {
      try {
        setLoading(true);
        const matchData = await fetchCurrentMatch();
        setMatch(matchData);
        setGameMode(matchData.status as GameMode);
        setError(null);
      } catch (err) {
        setError('Failed to load match data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadMatch();

    // Subscribe to real-time updates
    subscribeToMatchUpdates((updatedMatch) => {
      setMatch(updatedMatch);
    });

    subscribeToGameModeChanges((mode) => {
      setGameMode(mode);
    });

    subscribeToMatchResults((result) => {
      setMatch((prevMatch) => {
        if (!prevMatch) return null;
        return {
          ...prevMatch,
          winner: result.winnerId,
          status: GameMode.RESULT,
          endTime: Date.now()
        };
      });
      setGameMode(GameMode.RESULT);
    });

    return () => {
      // Cleanup would happen here if needed
    };
  }, []);

  return { match, loading, error, gameMode, setGameMode };
}; 