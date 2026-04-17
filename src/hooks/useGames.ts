import { useState, useEffect, useCallback } from 'react';
import type { Game, Player } from '../types';

const STORAGE_KEY = 'score-tracker-games';

// Increment when the persisted schema changes and add a migration below.
const CURRENT_VERSION = 1;

// Used as a fallback threshold for games stored before the field existed.
const DEFAULT_THRESHOLD = 100;

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

// ─── Versioned storage envelope ──────────────────────────────────────────────

interface VersionedStorage {
  version: number;
  games: Game[];
}

// ─── v0 → v1 ─────────────────────────────────────────────────────────────────
// v0: raw Game[] written directly (no version field).
// v1: { version: 1, games: Game[] } with all required fields guaranteed.

function migratePlayerV0(raw: unknown): Player {
  const obj = (raw !== null && typeof raw === 'object') ? raw as Record<string, unknown> : {};
  return {
    id:     typeof obj.id   === 'string' ? obj.id   : generateId(),
    name:   typeof obj.name === 'string' ? obj.name : 'Player',
    scores: Array.isArray(obj.scores)
      ? obj.scores.filter((s): s is number => {
          if (typeof s === 'number') return true;
          console.warn('[migration v0→v1] Dropping invalid score entry:', s);
          return false;
        })
      : [],
  };
}

function migrateGameV0(raw: unknown): Game | null {
  if (raw === null || typeof raw !== 'object') return null;
  const obj = raw as Record<string, unknown>;
  return {
    id:        typeof obj.id        === 'string'                               ? obj.id        : generateId(),
    name:      typeof obj.name      === 'string'                               ? obj.name      : 'Unnamed Game',
    mode:      obj.mode === 'highest' || obj.mode === 'lowest'                 ? obj.mode      : 'highest',
    // Threshold must be > 0 (matches the MIN_THRESHOLD constraint in GameSetup).
    threshold: typeof obj.threshold === 'number' && obj.threshold > 0         ? obj.threshold : DEFAULT_THRESHOLD,
    createdAt: typeof obj.createdAt === 'number'                               ? obj.createdAt : Date.now(),
    players:   Array.isArray(obj.players) ? obj.players.map(migratePlayerV0)  : [],
  };
}

function migrateV0ToV1(raw: unknown): VersionedStorage {
  const items = Array.isArray(raw) ? raw : [];
  const games = items.map(migrateGameV0).filter((g): g is Game => g !== null);
  return { version: 1, games };
}

// ─── Migration runner ─────────────────────────────────────────────────────────

function applyMigrations(parsed: unknown): VersionedStorage {
  const isObj = parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed);
  const version = isObj ? (parsed as Record<string, unknown>).version : undefined;

  // Already at current version – skip all migrations.
  if (version === CURRENT_VERSION) return parsed as VersionedStorage;

  let current: unknown = parsed;

  // v0 → v1
  if (typeof version !== 'number' || version < 1) {
    current = migrateV0ToV1(current);
  }

  // v1 → v2 would go here:
  // if ((current as VersionedStorage).version < 2) {
  //   current = migrateV1ToV2(current);
  // }

  return current as VersionedStorage;
}

// ─── Load / save ──────────────────────────────────────────────────────────────

function loadGames(): Game[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];                        // Nothing stored – no migration needed.
    const parsed: unknown = JSON.parse(raw);
    const { games } = applyMigrations(parsed);  // Upgrade to current version if needed.
    return games;
  } catch {
    return [];
  }
}

function saveGames(games: Game[]): void {
  const storage: VersionedStorage = { version: CURRENT_VERSION, games };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
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
