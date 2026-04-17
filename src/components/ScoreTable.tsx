import { useState, useRef } from 'react';
import type { Game } from '../types';

interface ScoreTableProps {
  game: Game;
  onAddRound: (gameId: string, scores: Record<string, number>) => void;
  onDeleteLastRound: (gameId: string) => void;
}

function getTotal(scores: number[]): number {
  return scores.reduce((a, b) => a + b, 0);
}

function getLeaderAndWinner(game: Game): { leaderId: string | null; winnerId: string | null } {
  if (game.players.length === 0) return { leaderId: null, winnerId: null };

  const totals = game.players.map(p => ({ id: p.id, total: getTotal(p.scores) }));
  const allZero = totals.every(t => t.total === 0);
  if (allZero) return { leaderId: null, winnerId: null };

  if (game.mode === 'highest') {
    const sorted = [...totals].sort((a, b) => b.total - a.total);
    const top = sorted[0];
    const winnerId = top.total >= game.threshold ? top.id : null;
    return { winnerId, leaderId: winnerId ? null : top.id };
  } else {
    const anyAbove = totals.some(t => t.total >= game.threshold);
    const sorted = [...totals].sort((a, b) => a.total - b.total);
    const top = sorted[0];
    const winnerId = anyAbove ? top.id : null;
    return { winnerId, leaderId: winnerId ? null : top.id };
  }
}

export function ScoreTable({ game, onAddRound, onDeleteLastRound }: ScoreTableProps) {
  const roundCount = game.players[0]?.scores.length ?? 0;
  const nextRound = roundCount + 1;

  const initScores = (): Record<string, string> => {
    const init: Record<string, string> = {};
    game.players.forEach(p => { init[p.id] = ''; });
    return init;
  };

  const [currentScores, setCurrentScores] = useState<Record<string, string>>(initScores);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const playerIds = game.players.map(p => p.id).join(',');

  const [prevPlayerIds, setPrevPlayerIds] = useState(playerIds);
  const [prevRoundCount, setPrevRoundCount] = useState(roundCount);
  if (prevPlayerIds !== playerIds || prevRoundCount !== roundCount) {
    setPrevPlayerIds(playerIds);
    setPrevRoundCount(roundCount);
    setCurrentScores(initScores());
  }

  const { leaderId, winnerId } = getLeaderAndWinner(game);

  const playerTotals: Record<string, number> = {};
  game.players.forEach(p => { playerTotals[p.id] = getTotal(p.scores); });

  function handleAddRound(e: React.FormEvent) {
    e.preventDefault();
    const roundScores: Record<string, number> = {};
    game.players.forEach(p => {
      roundScores[p.id] = parseFloat(currentScores[p.id] || '0') || 0;
    });
    onAddRound(game.id, roundScores);
    setCurrentScores(initScores());
    firstInputRef.current?.focus();
  }

  function handleInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>, idx: number) {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (idx < game.players.length - 1) {
        const form = e.currentTarget.form;
        if (form) {
          const inputs = Array.from(form.querySelectorAll<HTMLInputElement>('input[type="number"]'));
          inputs[idx + 1]?.focus();
        }
      } else {
        handleAddRound(e as unknown as React.FormEvent);
      }
    }
  }

  function colClass(playerId: string): string {
    if (winnerId === playerId) return 'text-yellow-300 font-bold';
    if (leaderId === playerId) return 'text-indigo-300 font-semibold';
    return 'text-white';
  }

  function totalCellClass(playerId: string): string {
    if (winnerId === playerId) return 'bg-yellow-900/40 border-b-2 border-yellow-500';
    if (leaderId === playerId) return 'bg-indigo-900/30 border-b-2 border-indigo-500';
    return 'border-b-2 border-gray-700';
  }

  if (game.players.length === 0) return null;

  // Past rounds in reverse order (newest first → oldest last)
  const pastRoundIndices = Array.from({ length: roundCount }, (_, i) => roundCount - 1 - i);

  return (
    <form onSubmit={handleAddRound} aria-label={`Score tracking for ${game.name}`}>
      <div className="overflow-x-auto rounded-xl border border-gray-700" role="region" aria-label="Score table">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-800 border-b border-gray-700">
              <th scope="col" className="text-left px-3 py-3 font-semibold text-gray-300 min-w-[80px] w-24 sticky left-0 bg-gray-800 z-10">
                Round
              </th>
              {game.players.map(player => (
                <th
                  key={player.id}
                  scope="col"
                  className={`px-3 py-3 text-center font-semibold min-w-[80px] ${colClass(player.id)}`}
                >
                  <div className="flex items-center justify-center gap-1">
                    {winnerId === player.id && <span aria-label="Winner" role="img">🏆</span>}
                    {leaderId === player.id && <span aria-label="Current leader" role="img">⭐</span>}
                    <span>{player.name}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Total row */}
            <tr aria-label="Total scores">
              <th
                scope="row"
                className="px-3 py-3 text-left font-bold text-gray-200 sticky left-0 bg-gray-800 z-10 border-b-2 border-gray-700"
              >
                Total
              </th>
              {game.players.map(player => (
                <td
                  key={player.id}
                  className={`px-3 py-3 text-center text-lg ${totalCellClass(player.id)} ${colClass(player.id)}`}
                  aria-label={`${player.name} total: ${playerTotals[player.id]}`}
                >
                  {playerTotals[player.id]}
                </td>
              ))}
            </tr>

            {/* Current (editable) round row */}
            <tr className="bg-indigo-950/30 border-b border-gray-700" aria-label={`Round ${nextRound} — enter scores`}>
              <th scope="row" className="px-3 py-2.5 text-left text-indigo-300 font-semibold text-xs sticky left-0 bg-indigo-950/50 z-10 whitespace-nowrap">
                R{nextRound}
                <span className="ml-1 text-indigo-400/60 font-normal text-[10px]">now</span>
              </th>
              {game.players.map((player, idx) => (
                <td key={player.id} className="px-2 py-2">
                  <input
                    ref={idx === 0 ? firstInputRef : undefined}
                    type="number"
                    value={currentScores[player.id] ?? ''}
                    onChange={e => setCurrentScores(prev => ({ ...prev, [player.id]: e.target.value }))}
                    onKeyDown={e => handleInputKeyDown(e, idx)}
                    placeholder="0"
                    aria-label={`${player.name} score for round ${nextRound}`}
                    inputMode="numeric"
                    className="w-full bg-gray-700 border border-gray-600 text-white text-center rounded-lg px-2 py-1.5 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </td>
              ))}
            </tr>

            {/* Past rounds (newest first) */}
            {pastRoundIndices.map(roundIdx => {
              const roundNumber = roundIdx + 1;
              return (
                <tr
                  key={roundIdx}
                  className="border-b border-gray-700/50 hover:bg-gray-800/40 transition-colors"
                  aria-label={`Round ${roundNumber}`}
                >
                  <th scope="row" className="px-3 py-2.5 text-left text-gray-500 font-medium text-xs sticky left-0 bg-gray-900 z-10">
                    R{roundNumber}
                  </th>
                  {game.players.map(player => (
                    <td key={player.id} className="px-3 py-2.5 text-center text-gray-300">
                      {player.scores[roundIdx] !== undefined ? player.scores[roundIdx] : (
                        <span className="text-gray-600" aria-hidden="true">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Action row */}
      <div className="flex gap-3 mt-3">
        <button
          type="submit"
          className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          aria-label={`Save round ${nextRound} scores`}
        >
          + Save Round {nextRound}
        </button>
        {roundCount > 0 && (
          <button
            type="button"
            onClick={() => onDeleteLastRound(game.id)}
            className="px-4 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-400 hover:text-red-400 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
            aria-label={`Undo round ${roundCount}`}
          >
            Undo R{roundCount}
          </button>
        )}
      </div>
    </form>
  );
}
