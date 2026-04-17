import { useState, useRef } from 'react';
import type { Game } from '../types';

interface GameListProps {
  games: Game[];
  onSelectGame: (game: Game) => void;
  onCreateGame: (name: string) => void;
  onDeleteGame: (id: string) => void;
}

function getTotal(scores: number[]): number {
  return scores.reduce((a, b) => a + b, 0);
}

function getLeader(game: Game): string {
  if (game.players.length === 0) return '—';
  const sorted = [...game.players].sort((a, b) => {
    const ta = getTotal(a.scores);
    const tb = getTotal(b.scores);
    return game.mode === 'highest' ? tb - ta : ta - tb;
  });
  return sorted[0].name;
}

export function GameList({ games, onSelectGame, onCreateGame, onDeleteGame }: GameListProps) {
  const [newName, setNewName] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    onCreateGame(name);
    setNewName('');
    inputRef.current?.focus();
  }

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

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-1">🎲 Score Tracker</h1>
          <p className="text-gray-400">Track scores for all your board games</p>
        </header>

        {/* New Game Form */}
        <form onSubmit={handleCreate} className="mb-8">
          <label htmlFor="new-game-name" className="block text-sm font-medium text-gray-300 mb-2">
            New Game Name
          </label>
          <div className="flex gap-3">
            <input
              id="new-game-name"
              ref={inputRef}
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="e.g. Catan, Ticket to Ride…"
              className="flex-1 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              aria-label="New game name"
            />
            <button
              type="submit"
              disabled={!newName.trim()}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              aria-label="Create new game"
            >
              + New Game
            </button>
          </div>
        </form>

        {/* Game List */}
        {sortedGames.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-5xl mb-4">🎯</p>
            <p className="text-xl font-medium mb-2">No games yet</p>
            <p>Create your first game above to get started!</p>
          </div>
        ) : (
          <ul className="space-y-3" role="list" aria-label="Saved games">
            {sortedGames.map(game => (
              <li key={game.id}>
                <div
                  className="group flex items-center justify-between bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-indigo-500 rounded-xl p-4 cursor-pointer transition-all focus-within:ring-2 focus-within:ring-indigo-500"
                  onClick={() => onSelectGame(game)}
                >
                  <button
                    className="flex-1 text-left focus:outline-none"
                    onClick={() => onSelectGame(game)}
                    aria-label={`Open game: ${game.name}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-semibold text-white">{game.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-300">
                        {game.mode === 'highest' ? '↑ Highest wins' : '↓ Lowest wins'}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-4 text-sm text-gray-400">
                      <span>{game.players.length} player{game.players.length !== 1 ? 's' : ''}</span>
                      {game.players.length > 0 && (
                        <>
                          <span>·</span>
                          <span>
                            {game.players[0].scores.length} round{game.players[0].scores.length !== 1 ? 's' : ''}
                          </span>
                          <span>·</span>
                          <span>Leader: <span className="text-indigo-400 font-medium">{getLeader(game)}</span></span>
                        </>
                      )}
                    </div>
                  </button>

                  <div className="flex items-center gap-2 ml-4" onClick={e => e.stopPropagation()}>
                    {deletingId === game.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400">Delete?</span>
                        <button
                          onClick={e => handleDeleteConfirm(e, game.id)}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                          aria-label={`Confirm delete ${game.name}`}
                        >
                          Yes
                        </button>
                        <button
                          onClick={handleDeleteCancel}
                          className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
                          aria-label="Cancel delete"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={e => handleDeleteClick(e, game.id)}
                        className="p-2 text-gray-500 hover:text-red-400 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 opacity-0 group-hover:opacity-100 focus:opacity-100"
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
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
