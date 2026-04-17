import { useState, useRef, useEffect } from 'react';
import type { Game } from '../types';

interface AddRoundProps {
  game: Game;
  onAddRound: (scores: Record<string, number>) => void;
}

export function AddRound({ game, onAddRound }: AddRoundProps) {
  const [scores, setScores] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    game.players.forEach(p => { init[p.id] = ''; });
    return init;
  });
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const init: Record<string, string> = {};
    game.players.forEach(p => { init[p.id] = scores[p.id] ?? ''; });
    setScores(init);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.players.length]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const roundScores: Record<string, number> = {};
    game.players.forEach(p => {
      roundScores[p.id] = parseFloat(scores[p.id] || '0') || 0;
    });
    onAddRound(roundScores);
    // Reset scores
    const reset: Record<string, string> = {};
    game.players.forEach(p => { reset[p.id] = ''; });
    setScores(reset);
    firstInputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>, idx: number) {
    if (e.key === 'Enter' && idx < game.players.length - 1) {
      e.preventDefault();
      const form = e.currentTarget.form;
      if (form) {
        const inputs = Array.from(form.querySelectorAll<HTMLInputElement>('input[type="number"]'));
        inputs[idx + 1]?.focus();
      }
    }
  }

  if (game.players.length === 0) return null;

  const roundNumber = (game.players[0]?.scores.length ?? 0) + 1;

  return (
    <form onSubmit={handleSubmit} aria-label="Add round scores">
      <h3 className="text-lg font-semibold text-gray-200 mb-3">
        Add Round {roundNumber}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {game.players.map((player, idx) => (
          <div key={player.id} className="flex items-center gap-3 bg-gray-800 rounded-lg px-4 py-3">
            <label
              htmlFor={`score-${player.id}`}
              className="flex-1 text-sm font-medium text-gray-200 truncate"
            >
              {player.name}
            </label>
            <input
              id={`score-${player.id}`}
              ref={idx === 0 ? firstInputRef : undefined}
              type="number"
              value={scores[player.id] ?? ''}
              onChange={e => setScores(prev => ({ ...prev, [player.id]: e.target.value }))}
              onKeyDown={e => handleKeyDown(e, idx)}
              placeholder="0"
              className="w-24 bg-gray-700 border border-gray-600 text-white text-right rounded-lg px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              aria-label={`Score for ${player.name} in round ${roundNumber}`}
              inputMode="numeric"
            />
          </div>
        ))}
      </div>
      <button
        type="submit"
        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900"
        aria-label={`Submit scores for round ${roundNumber}`}
      >
        Add Round {roundNumber}
      </button>
    </form>
  );
}
