import { useEffect, useState } from 'react';
import { fetchCurrentMatch } from '../services/match';
import { subscribeToMatchUpdates, subscribeToGameModeChanges, subscribeToMatchResults } from '../services/socket';
import { GameMode, Match } from '../types';

export const useMatch = () => {
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [gameMode, setGameMode] = useState<GameMode>(GameMode.PREPARATION);
  const [matchAccountPubkey, setMatchAccountPubkey] = useState<string | null>(null);

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

  return { match, loading, error, gameMode, setGameMode, matchAccountPubkey };
}; 