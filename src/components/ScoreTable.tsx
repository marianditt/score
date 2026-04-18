import { useState, useRef } from 'react';
import type { Game } from '../types';
import { useLanguage } from '../i18n/index';

interface ScoreTableProps {
  game: Game;
  onAddRound: (gameId: string, scores: Record<string, number>) => void;
  onDeleteLastRound: (gameId: string) => void;
}

function getTotal(scores: number[]): number {
  return scores.reduce((a, b) => a + b, 0);
}

function getLeadersAndWinners(game: Game): { leaderIds: string[]; winnerIds: string[] } {
  if (game.players.length === 0) return { leaderIds: [], winnerIds: [] };

  // Nobody leads before any rounds are played
  const roundCount = Math.max(0, ...game.players.map(p => p.scores.length));
  if (roundCount === 0) return { leaderIds: [], winnerIds: [] };

  const totals = game.players.map(p => ({ id: p.id, total: getTotal(p.scores) }));

  if (game.mode === 'highest') {
    const maxTotal = Math.max(...totals.map(t => t.total));
    const topPlayers = totals.filter(t => t.total === maxTotal);
    if (maxTotal >= game.threshold) {
      return { leaderIds: [], winnerIds: topPlayers.map(p => p.id) };
    }
    return { leaderIds: topPlayers.map(p => p.id), winnerIds: [] };
  } else {
    const minTotal = Math.min(...totals.map(t => t.total));
    const bottomPlayers = totals.filter(t => t.total === minTotal);
    const anyAboveThreshold = totals.some(t => t.total >= game.threshold);
    if (anyAboveThreshold) {
      return { leaderIds: [], winnerIds: bottomPlayers.map(p => p.id) };
    }
    return { leaderIds: bottomPlayers.map(p => p.id), winnerIds: [] };
  }
}

export function ScoreTable({ game, onAddRound, onDeleteLastRound }: ScoreTableProps) {
  const { t } = useLanguage();
  // Use max across all players so newly added players (scores:[]) don't shrink the count
  const roundCount = Math.max(0, ...game.players.map(p => p.scores.length));
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

  const { leaderIds, winnerIds } = getLeadersAndWinners(game);
  const gameOver = winnerIds.length > 0;

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
    if (winnerIds.includes(playerId)) return 'text-yellow-300 font-bold';
    if (leaderIds.includes(playerId)) return 'text-indigo-300 font-semibold';
    return 'text-white';
  }

  function totalCellClass(playerId: string): string {
    if (winnerIds.includes(playerId)) return 'bg-yellow-900/40 border-b-2 border-yellow-500';
    if (leaderIds.includes(playerId)) return 'bg-indigo-900/30 border-b-2 border-indigo-500';
    return 'border-b-2 border-gray-700';
  }

  if (game.players.length === 0) return null;

  // Past rounds in reverse order (newest first → oldest last)
  const pastRoundIndices = Array.from({ length: roundCount }, (_, i) => roundCount - 1 - i);

  // Mobile-friendly: compact columns to fit up to 6 players without horizontal scroll.
  // Round column is sticky. Player columns use min-w that scales with player count.
  const playerCount = game.players.length;
  // ≤3 players: comfortable width; 4-6 players: compact but readable
  const playerColClass = playerCount <= 3
    ? 'min-w-[72px]'
    : playerCount <= 6
      ? 'min-w-[44px]'
      : 'min-w-[64px]';
  const cellPadding = playerCount <= 6 ? 'px-1 sm:px-3' : 'px-3';
  const inputClass = playerCount <= 6
    ? 'w-full min-w-0 bg-gray-700 border border-gray-600 text-white text-center rounded-md px-0.5 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
    : 'w-full bg-gray-700 border border-gray-600 text-white text-center rounded-lg px-2 py-1.5 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent';

  return (
    <form onSubmit={handleAddRound} aria-label={`Score tracking for ${game.name}`}>
      <div className="overflow-x-auto rounded-xl border border-gray-700" role="region" aria-label="Score table">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-800 border-b border-gray-700">
              <th scope="col" className={`text-start ${cellPadding} py-3 font-semibold text-gray-300 w-8 sm:w-24 sticky start-0 bg-gray-800 z-10`}>
                {t.round}
              </th>
              {game.players.map(player => (
                <th
                  key={player.id}
                  scope="col"
                  className={`${cellPadding} py-3 text-center font-semibold ${playerColClass} ${colClass(player.id)}`}
                >
                  <div className="flex flex-col items-center justify-center">
                    <div className="h-5 flex items-center justify-center">
                      {winnerIds.includes(player.id) && <span aria-label={t.winner} role="img">🏆</span>}
                      {leaderIds.includes(player.id) && <span aria-label={t.currentLeader} role="img">⭐</span>}
                    </div>
                    <span className="truncate max-w-[56px] sm:max-w-none">{player.name}</span>
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
                className={`${cellPadding} py-3 text-start font-bold text-gray-200 sticky start-0 bg-gray-800 z-10 border-b-2 border-gray-700`}
              >
                {t.total}
              </th>
              {game.players.map(player => (
                <td
                  key={player.id}
                  className={`${cellPadding} py-3 text-center text-lg ${totalCellClass(player.id)} ${colClass(player.id)}`}
                  aria-label={`${player.name} total: ${playerTotals[player.id]}`}
                >
                  {playerTotals[player.id]}
                </td>
              ))}
            </tr>

            {/* Current (editable) round row — hidden when game is over */}
            {!gameOver && (
              <tr className="bg-indigo-950/30 border-b border-gray-700" aria-label={`Round ${nextRound} — enter scores`}>
                <th scope="row" className={`${cellPadding} py-2.5 text-start text-indigo-300 font-semibold text-xs sticky start-0 bg-indigo-950/50 z-10 whitespace-nowrap`}>
                  R{nextRound}
                  <span className="ms-1 text-indigo-400/60 font-normal text-[10px] hidden sm:inline">{t.now}</span>
                </th>
                {game.players.map((player, idx) => (
                  <td key={player.id} className={`${cellPadding} py-1.5 sm:py-2`}>
                    <input
                      ref={idx === 0 ? firstInputRef : undefined}
                      type="number"
                      value={currentScores[player.id] ?? ''}
                      onChange={e => setCurrentScores(prev => ({ ...prev, [player.id]: e.target.value }))}
                      onKeyDown={e => handleInputKeyDown(e, idx)}
                      placeholder="0"
                      aria-label={`${player.name} score for round ${nextRound}`}
                      inputMode="numeric"
                      className={inputClass}
                    />
                  </td>
                ))}
              </tr>
            )}

            {/* Past rounds (newest first) */}
            {pastRoundIndices.map(roundIdx => {
              const roundNumber = roundIdx + 1;
              return (
                <tr
                  key={roundIdx}
                  className="border-b border-gray-700/50 hover:bg-gray-800/40 transition-colors"
                  aria-label={`Round ${roundNumber}`}
                >
                  <th scope="row" className={`${cellPadding} py-2.5 text-start text-gray-500 font-medium text-xs sticky start-0 bg-gray-900 z-10`}>
                    R{roundNumber}
                  </th>
                  {game.players.map(player => (
                    <td key={player.id} className={`${cellPadding} py-2.5 text-center text-gray-300`}>
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
          disabled={gameOver}
          className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          aria-label={gameOver ? t.saveRound(nextRound) : `Save round ${nextRound} scores`}
        >
          {t.saveRound(nextRound)}
        </button>
        <button
          type="button"
          onClick={() => onDeleteLastRound(game.id)}
          disabled={roundCount === 0}
          className="px-4 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-400 hover:text-red-400 disabled:opacity-40 disabled:cursor-not-allowed font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
          aria-label={`Undo round ${roundCount}`}
        >
          {t.undoRound(roundCount)}
        </button>
      </div>
    </form>
  );
}
