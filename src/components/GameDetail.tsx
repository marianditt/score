import { useState, useRef } from 'react';
import type { Game } from '../types';
import { ScoreTable } from './ScoreTable';
import { AddRound } from './AddRound';

interface GameDetailProps {
  game: Game;
  onBack: () => void;
  onUpdateGame: (game: Game) => void;
  onAddPlayer: (gameId: string, name: string) => void;
  onDeletePlayer: (gameId: string, playerId: string) => void;
  onMovePlayerUp: (gameId: string, playerId: string) => void;
  onMovePlayerDown: (gameId: string, playerId: string) => void;
  onAddRound: (gameId: string, scores: Record<string, number>) => void;
  onDeleteLastRound: (gameId: string) => void;
}

export function GameDetail({
  game,
  onBack,
  onUpdateGame,
  onAddPlayer,
  onDeletePlayer,
  onMovePlayerUp,
  onMovePlayerDown,
  onAddRound,
  onDeleteLastRound,
}: GameDetailProps) {
  const [newPlayerName, setNewPlayerName] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [gameName, setGameName] = useState(game.name);
  const playerInputRef = useRef<HTMLInputElement>(null);
  const gameNameRef = useRef<HTMLInputElement>(null);
  const roundCount = game.players[0]?.scores.length ?? 0;

  function handleAddPlayer(e: React.FormEvent) {
    e.preventDefault();
    const name = newPlayerName.trim();
    if (!name) return;
    onAddPlayer(game.id, name);
    setNewPlayerName('');
    playerInputRef.current?.focus();
  }

  function handleGameNameSave() {
    const name = gameName.trim();
    if (name && name !== game.name) {
      onUpdateGame({ ...game, name });
    } else {
      setGameName(game.name);
    }
    setEditingName(false);
  }

  function handleThresholdChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) {
      onUpdateGame({ ...game, threshold: val });
    }
  }

  function handleModeChange(mode: 'highest' | 'lowest') {
    onUpdateGame({ ...game, mode });
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <button
            onClick={onBack}
            className="mt-1 p-2 text-gray-400 hover:text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Back to game list"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1">
            {editingName ? (
              <input
                ref={gameNameRef}
                type="text"
                value={gameName}
                onChange={e => setGameName(e.target.value)}
                onBlur={handleGameNameSave}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleGameNameSave();
                  if (e.key === 'Escape') { setGameName(game.name); setEditingName(false); }
                }}
                className="text-3xl font-bold bg-gray-800 border border-indigo-500 text-white rounded-lg px-3 py-1 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="Edit game name"
                autoFocus
              />
            ) : (
              <button
                onClick={() => { setEditingName(true); setTimeout(() => gameNameRef.current?.select(), 0); }}
                className="text-3xl font-bold text-white hover:text-indigo-300 transition-colors text-left focus:outline-none focus:underline"
                aria-label={`Game name: ${game.name}. Click to edit.`}
              >
                {game.name}
              </button>
            )}
          </div>
        </div>

        {/* Settings */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 mb-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Game Settings</h2>
          <div className="flex flex-wrap gap-6">
            {/* Threshold */}
            <div>
              <label htmlFor="threshold" className="block text-sm text-gray-300 mb-1">
                Score Threshold
              </label>
              <input
                id="threshold"
                type="number"
                value={game.threshold}
                onChange={handleThresholdChange}
                className="w-32 bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                aria-label="Score threshold to end game"
              />
            </div>

            {/* Mode */}
            <fieldset>
              <legend className="block text-sm text-gray-300 mb-1">Win Condition</legend>
              <div className="flex gap-2" role="group" aria-label="Win condition">
                <button
                  type="button"
                  onClick={() => handleModeChange('highest')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    game.mode === 'highest'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                  aria-pressed={game.mode === 'highest'}
                >
                  ↑ Highest Wins
                </button>
                <button
                  type="button"
                  onClick={() => handleModeChange('lowest')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    game.mode === 'lowest'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                  aria-pressed={game.mode === 'lowest'}
                >
                  ↓ Lowest Wins
                </button>
              </div>
            </fieldset>
          </div>
        </div>

        {/* Players */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 mb-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Players</h2>

          {game.players.length > 0 && (
            <ul className="space-y-2 mb-4" role="list" aria-label="Player list">
              {game.players.map((player, idx) => (
                <li key={player.id} className="flex items-center gap-2 bg-gray-750 rounded-lg px-3 py-2 bg-gray-700/50">
                  <div className="flex flex-col gap-0.5" aria-label={`Reorder ${player.name}`}>
                    <button
                      onClick={() => onMovePlayerUp(game.id, player.id)}
                      disabled={idx === 0}
                      className="p-0.5 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed rounded transition-colors focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      aria-label={`Move ${player.name} up`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onMovePlayerDown(game.id, player.id)}
                      disabled={idx === game.players.length - 1}
                      className="p-0.5 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed rounded transition-colors focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      aria-label={`Move ${player.name} down`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  <span className="flex-1 text-white font-medium">{player.name}</span>
                  <button
                    onClick={() => onDeletePlayer(game.id, player.id)}
                    className="p-1.5 text-gray-500 hover:text-red-400 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                    aria-label={`Remove player ${player.name}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Add player */}
          <form onSubmit={handleAddPlayer} className="flex gap-2">
            <input
              ref={playerInputRef}
              type="text"
              value={newPlayerName}
              onChange={e => setNewPlayerName(e.target.value)}
              placeholder="Player name…"
              className="flex-1 bg-gray-700 border border-gray-600 text-white placeholder-gray-500 rounded-lg px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              aria-label="New player name"
            />
            <button
              type="submit"
              disabled={!newPlayerName.trim()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Add player"
            >
              Add
            </button>
          </form>
        </div>

        {/* Score Table */}
        {game.players.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Scores</h2>
              {roundCount > 0 && (
                <button
                  onClick={() => onDeleteLastRound(game.id)}
                  className="text-sm text-gray-500 hover:text-red-400 transition-colors focus:outline-none focus:underline"
                  aria-label="Delete last round"
                >
                  Undo last round
                </button>
              )}
            </div>
            <ScoreTable game={game} />
          </div>
        )}

        {/* Add Round */}
        {game.players.length > 0 && (
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
            <AddRound
              game={game}
              onAddRound={scores => onAddRound(game.id, scores)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
