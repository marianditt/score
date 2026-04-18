import { useState, useEffect, useCallback } from 'react';
import type { Game, Player } from '../types';

const STORAGE_KEY = 'score-tracker-games';

/** Current storage schema version. Increment this when a migration is needed. */
const CURRENT_VERSION = 2;

interface StoredState {
  version: number;
  games: Game[];
}

/**
 * Applies incremental migrations to bring stored state up to the current version.
 * Empty states and already-current states are returned unchanged.
 */
function applyMigrations(state: StoredState): StoredState {
  // v0 → v1: no structural change; version envelope was introduced
  if (state.version < 1) {
    state = { ...state, version: 1 };
  }
  // v1 → v2: add gender field to players (default 'male')
  if (state.version < 2) {
    state = {
      ...state,
      version: 2,
      games: state.games.map(g => ({
        ...g,
        players: g.players.map(p => ({
          ...p,
          gender: p.gender ?? 'male',
        })),
      })),
    };
  }
  return state;
}

function loadGames(): Game[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);

    let state: StoredState;
    if (Array.isArray(parsed)) {
      // Legacy: plain array stored without a version envelope (version 0)
      state = { version: 0, games: parsed as Game[] };
    } else if (
      typeof parsed === 'object' &&
      parsed !== null &&
      Array.isArray((parsed as Record<string, unknown>).games)
    ) {
      state = parsed as StoredState;
    } else {
      return [];
    }

    if (state.version < CURRENT_VERSION) {
      state = applyMigrations(state);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }

    return state.games;
  } catch {
    return [];
  }
}

function saveGames(games: Game[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: CURRENT_VERSION, games }));
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function useGames() {
  const [games, setGames] = useState<Game[]>(loadGames);

  useEffect(() => {
    saveGames(games);
  }, [games]);

  const createGame = useCallback((
    name: string,
    players: Player[],
    mode: 'highest' | 'lowest',
    threshold: number,
  ): Game => {
    const newGame: Game = {
      id: generateId(),
      name,
      players,
      threshold,
      mode,
      createdAt: Date.now(),
    };
    setGames(prev => [...prev, newGame]);
    return newGame;
  }, []);

  const deleteGame = useCallback((id: string) => {
    setGames(prev => prev.filter(g => g.id !== id));
  }, []);

  const updateGame = useCallback((updated: Game) => {
    setGames(prev => prev.map(g => g.id === updated.id ? updated : g));
  }, []);

  const addPlayer = useCallback((gameId: string, name: string) => {
    const player: Player = {
      id: generateId(),
      name,
      gender: 'male',
      scores: [],
    };
    setGames(prev => prev.map(g =>
      g.id === gameId
        ? { ...g, players: [...g.players, player] }
        : g
    ));
  }, []);

  const deletePlayer = useCallback((gameId: string, playerId: string) => {
    setGames(prev => prev.map(g =>
      g.id === gameId
        ? { ...g, players: g.players.filter(p => p.id !== playerId) }
        : g
    ));
  }, []);

  const movePlayerUp = useCallback((gameId: string, playerId: string) => {
    setGames(prev => prev.map(g => {
      if (g.id !== gameId) return g;
      const idx = g.players.findIndex(p => p.id === playerId);
      if (idx <= 0) return g;
      const players = [...g.players];
      [players[idx - 1], players[idx]] = [players[idx], players[idx - 1]];
      return { ...g, players };
    }));
  }, []);

  const movePlayerDown = useCallback((gameId: string, playerId: string) => {
    setGames(prev => prev.map(g => {
      if (g.id !== gameId) return g;
      const idx = g.players.findIndex(p => p.id === playerId);
      if (idx < 0 || idx >= g.players.length - 1) return g;
      const players = [...g.players];
      [players[idx], players[idx + 1]] = [players[idx + 1], players[idx]];
      return { ...g, players };
    }));
  }, []);

  const addRound = useCallback((gameId: string, roundScores: Record<string, number>) => {
    setGames(prev => prev.map(g => {
      if (g.id !== gameId) return g;
      const currentRoundCount = Math.max(0, ...g.players.map(p => p.scores.length));
      return {
        ...g,
        players: g.players.map(p => {
          const missedRounds = currentRoundCount - p.scores.length;
          const padding: null[] = missedRounds > 0 ? Array(missedRounds).fill(null) : [];
          return {
            ...p,
            scores: [...p.scores, ...padding, roundScores[p.id] ?? 0],
          };
        }),
      };
    }));
  }, []);

  const deleteLastRound = useCallback((gameId: string) => {
    setGames(prev => prev.map(g => {
      if (g.id !== gameId) return g;
      return {
        ...g,
        players: g.players.map(p => ({
          ...p,
          scores: p.scores.slice(0, -1),
        })),
      };
    }));
  }, []);

  const resetGame = useCallback((gameId: string) => {
    setGames(prev => prev.map(g => {
      if (g.id !== gameId) return g;
      return {
        ...g,
        players: g.players.map(p => ({ ...p, scores: [] })),
      };
    }));
  }, []);

  return {
    games,
    createGame,
    deleteGame,
    updateGame,
    addPlayer,
    deletePlayer,
    movePlayerUp,
    movePlayerDown,
    addRound,
    deleteLastRound,
    resetGame,
  };
}
