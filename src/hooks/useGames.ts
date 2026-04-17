import { useState, useEffect, useCallback } from 'react';
import type { Game, Player } from '../types';

const STORAGE_KEY = 'score-tracker-games';

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

function migratePlayer(raw: unknown): Player {
  const obj = (raw !== null && typeof raw === 'object') ? raw as Record<string, unknown> : {};
  return {
    id:     typeof obj.id     === 'string' ? obj.id     : generateId(),
    name:   typeof obj.name   === 'string' ? obj.name   : 'Player',
    scores: Array.isArray(obj.scores)
      ? obj.scores.filter((s): s is number => typeof s === 'number')
      : [],
  };
}

function migrateGame(raw: unknown): Game | null {
  if (raw === null || typeof raw !== 'object') return null;
  const obj = raw as Record<string, unknown>;
  return {
    id:        typeof obj.id        === 'string'                                  ? obj.id        : generateId(),
    name:      typeof obj.name      === 'string'                                  ? obj.name      : 'Unnamed Game',
    mode:      obj.mode === 'highest' || obj.mode === 'lowest'                    ? obj.mode      : 'highest',
    threshold: typeof obj.threshold === 'number' && obj.threshold > 0             ? obj.threshold : 100,
    createdAt: typeof obj.createdAt === 'number'                                  ? obj.createdAt : 0,
    players:   Array.isArray(obj.players) ? obj.players.map(migratePlayer)        : [],
  };
}

function loadGames(): Game[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(migrateGame).filter((g): g is Game => g !== null);
  } catch {
    return [];
  }
}

function saveGames(games: Game[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
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
      return {
        ...g,
        players: g.players.map(p => ({
          ...p,
          scores: [...p.scores, roundScores[p.id] ?? 0],
        })),
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
