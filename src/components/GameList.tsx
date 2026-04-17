import { useState } from 'react';
import type { Game } from '../types';

interface GameListProps {
  games: Game[];
  onSelectGame: (game: Game) => void;
  onNewGame: () => void;
  onDeleteGame: (id: string) => void;
}

function getTotal(scores: number[]): number {
  return scores.reduce((a, b) => a + b, 0);
}

function getLeader(game: Game): string | null {
  if (game.players.length === 0) return null;
  const allZero = game.players.every(p => p.scores.length === 0 || getTotal(p.scores) === 0);
  if (allZero) return null;
  const sorted = [...game.players].sort((a, b) => {
    const ta = getTotal(a.scores);
    const tb = getTotal(b.scores);
    return game.mode === 'highest' ? tb - ta : ta - tb;
  });
  return sorted[0].name;
}

export function GameList({ games, onSelectGame, onNewGame, onDeleteGame }: GameListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function handleDeleteClick(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    setDeletingId(id);
  }

  function handleDeleteConfirm(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    onDeleteGame(id);
    setDeletingId(null);
  }

  function handleDeleteCancel(e: React.MouseEvent) {
    e.stopPropagation();
    setDeletingId(null);
  }

  const sortedGames = [...games].sort((a, b) => b.createdAt - a.createdAt);
  const leader = (game: Game) => getLeader(game);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-1">🎲 Score Tracker</h1>
          <p className="text-gray-400">Track scores for all your board games</p>
        </header>

        {/* New Game button */}
        <div className="mb-6">
          <button
            onClick={onNewGame}
            className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            aria-label="Create a new game"
          >
            + New Game
          </button>
        </div>

        {/* Game List */}
        {sortedGames.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-5xl mb-4" aria-hidden="true">🎯</p>
            <p className="text-xl font-medium mb-2 text-gray-300">No games yet</p>
            <p>Create your first game to get started!</p>
          </div>
        ) : (
          <ul className="space-y-3" role="list" aria-label="Saved games">
            {sortedGames.map(game => {
              const roundCount = game.players[0]?.scores.length ?? 0;
              const gameLeader = leader(game);
              return (
                <li key={game.id}>
                  <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 hover:border-indigo-500 rounded-xl p-3 transition-colors">
                    {/* Game info button */}
                    <button
                      className="flex-1 text-left focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg p-1"
                      onClick={() => onSelectGame(game)}
                      aria-label={`Open game: ${game.name}`}
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base font-semibold text-white">{game.name}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-300">
                          {game.mode === 'highest' ? '↑ Highest wins' : '↓ Lowest wins'}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-sm text-gray-400 flex-wrap">
                        <span>{game.players.length} player{game.players.length !== 1 ? 's' : ''}</span>
                        {game.players.length > 0 && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>{roundCount} round{roundCount !== 1 ? 's' : ''}</span>
                            {gameLeader && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span>Leader: <span className="text-indigo-400 font-medium">{gameLeader}</span></span>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </button>

                    {/* Delete controls */}
                    <div className="flex items-center gap-2 shrink-0" onClick={e => e.stopPropagation()}>
                      {deletingId === game.id ? (
                        <>
                          <span className="text-sm text-gray-400 hidden sm:block">Delete?</span>
                          <button
                            onClick={e => handleDeleteConfirm(e, game.id)}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                            aria-label={`Confirm delete ${game.name}`}
                            autoFocus
                          >
                            Yes
                          </button>
                          <button
                            onClick={handleDeleteCancel}
                            className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
                            aria-label="Cancel delete"
                          >
                            No
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={e => handleDeleteClick(e, game.id)}
                          className="p-2 text-gray-500 hover:text-red-400 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                          aria-label={`Delete game: ${game.name}`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
