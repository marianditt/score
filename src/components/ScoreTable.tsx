import { useState, useRef, useEffect, useMemo } from 'react';
import type { Game } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

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
  const roundCount = game.players[0]?.scores.length ?? 0;
  // No marking before the first round has been played
  if (roundCount === 0) return { leaderIds: [], winnerIds: [] };

  const totals = game.players.map(p => ({ id: p.id, total: getTotal(p.scores) }));

  if (game.mode === 'highest') {
    const maxTotal = Math.max(...totals.map(t => t.total));
    const topIds = totals.filter(t => t.total === maxTotal).map(t => t.id);
    // All players tied at the top win once the threshold is reached
    if (maxTotal >= game.threshold) return { leaderIds: [], winnerIds: topIds };
    return { leaderIds: topIds, winnerIds: [] };
  } else {
    // Lowest-wins: anyone reaching the threshold triggers game over;
    // the player(s) with the lowest total win
    const anyAbove = totals.some(t => t.total >= game.threshold);
    const minTotal = Math.min(...totals.map(t => t.total));
    const topIds = totals.filter(t => t.total === minTotal).map(t => t.id);
    if (anyAbove) return { leaderIds: [], winnerIds: topIds };
    return { leaderIds: topIds, winnerIds: [] };
  }
}

/**
 * Compute compact initials for every player, breaking ties by extending the
 * first word character by character until all initials in the group are unique.
 *
 * Examples
 *   ["Alice", "Bob"]               → { Alice: "A",  Bob: "B" }
 *   ["Alice", "Aaron"]             → { Alice: "Al", Aaron: "Aa" }
 *   ["Alice Baker", "Alex Brown"]  → { "Alice Baker": "AlB", "Alex Brown": "AlBr" }
 */
function computeAllInitials(players: { id: string; name: string }[]): Record<string, string> {
  if (players.length === 0) return {};

  const basicInitials = (name: string): string =>
    name.trim().split(/\s+/).map(w => w[0] ?? '').join('').toUpperCase() ||
    name[0]?.toUpperCase() ||
    '?';

  // Group players that share the same basic initials
  const groups = new Map<string, typeof players>();
  for (const player of players) {
    const key = basicInitials(player.name);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(player);
  }

  const result: Record<string, string> = {};

  for (const [, group] of groups) {
    if (group.length === 1) {
      result[group[0].id] = basicInitials(group[0].name);
      continue;
    }

    // Collision: extend the first word one character at a time
    let resolved = false;
    for (let extraLen = 2; extraLen <= 12; extraLen++) {
      const candidates = group.map(p => {
        const words = p.name.trim().split(/\s+/);
        return (words[0] ?? '').substring(0, extraLen).toUpperCase() +
               words.slice(1).map(w => w[0] ?? '').join('').toUpperCase();
      });
      if (new Set(candidates).size === group.length) {
        group.forEach((p, i) => { result[p.id] = candidates[i]; });
        resolved = true;
        break;
      }
    }
    if (!resolved) {
      // Ultimate fallback: first character + position index
      group.forEach((p, i) => {
        result[p.id] = (p.name[0]?.toUpperCase() ?? '?') + (i + 1);
      });
    }
  }

  return result;
}

export function ScoreTable({ game, onAddRound, onDeleteLastRound }: ScoreTableProps) {
  const { t } = useLanguage();

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

  // Reset inputs when players change or game is reset
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentScores(initScores());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerIds, roundCount]);

  const { leaderIds, winnerIds } = getLeadersAndWinners(game);
  const isFinished = winnerIds.length > 0;

  const initialsMap = useMemo(
    () => computeAllInitials(game.players),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [playerIds],
  );

  const playerTotals: Record<string, number> = {};
  game.players.forEach(p => { playerTotals[p.id] = getTotal(p.scores); });

  function handleAddRound(e: React.FormEvent) {
    e.preventDefault();
    if (isFinished) return;
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

  const pastRoundIndices = Array.from({ length: roundCount }, (_, i) => roundCount - 1 - i);

  return (
    <form onSubmit={handleAddRound} aria-label={game.name}>
      <div className="overflow-x-auto rounded-xl border border-gray-700" role="region" aria-label={t('roundLabel')}>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-800 border-b border-gray-700">
              <th
                scope="col"
                className="text-start px-2 py-3 font-semibold text-gray-300 w-12 sm:w-16 sticky start-0 bg-gray-800 z-10"
              >
                {t('roundLabel')}
              </th>
              {game.players.map(player => (
                <th
                  key={player.id}
                  scope="col"
                  title={player.name}
                  className={`px-1 py-2 text-center font-semibold min-w-[44px] ${colClass(player.id)}`}
                >
                  <div className="flex flex-col items-center gap-0.5">
                    {/* Trophy / star badges */}
                    {(winnerIds.includes(player.id) || leaderIds.includes(player.id)) && (
                      <span
                        aria-label={winnerIds.includes(player.id) ? t('winnerAria') : t('currentLeaderAria')}
                        role="img"
                        className="text-sm leading-none"
                      >
                        {winnerIds.includes(player.id) ? '🏆' : '⭐'}
                      </span>
                    )}
                    {/* Initials — full name shown on hover via title */}
                    <span className="font-mono tracking-tight text-xs sm:text-sm">
                      {initialsMap[player.id] ?? player.name.substring(0, 3).toUpperCase()}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Total row */}
            <tr aria-label={t('totalLabel')}>
              <th
                scope="row"
                className="px-2 py-3 text-start font-bold text-gray-200 sticky start-0 bg-gray-800 z-10 border-b-2 border-gray-700"
              >
                {t('totalLabel')}
              </th>
              {game.players.map(player => (
                <td
                  key={player.id}
                  className={`px-1 py-3 text-center text-lg ${totalCellClass(player.id)} ${colClass(player.id)}`}
                  aria-label={`${player.name}: ${playerTotals[player.id]}`}
                >
                  {playerTotals[player.id]}
                </td>
              ))}
            </tr>

            {/* Current (editable) round row — hidden when game is finished */}
            {!isFinished && (
              <tr
                className="bg-indigo-950/30 border-b border-gray-700"
                aria-label={`${t('roundLabel')} ${nextRound}`}
              >
                <th
                  scope="row"
                  className="px-2 py-2.5 text-start text-indigo-300 font-semibold text-xs sticky start-0 bg-indigo-950/50 z-10 whitespace-nowrap"
                >
                  R{nextRound}
                  <span className="ms-1 text-indigo-400/60 font-normal text-[10px]">
                    {t('nowLabel')}
                  </span>
                </th>
                {game.players.map((player, idx) => (
                  <td key={player.id} className="px-1 py-2">
                    <input
                      ref={idx === 0 ? firstInputRef : undefined}
                      type="number"
                      value={currentScores[player.id] ?? ''}
                      onChange={e =>
                        setCurrentScores(prev => ({ ...prev, [player.id]: e.target.value }))
                      }
                      onKeyDown={e => handleInputKeyDown(e, idx)}
                      placeholder="0"
                      aria-label={`${player.name} ${t('roundLabel')} ${nextRound}`}
                      inputMode="numeric"
                      className="w-full min-w-[40px] bg-gray-700 border border-gray-600 text-white text-center rounded-lg px-1 py-2 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                  aria-label={`${t('roundLabel')} ${roundNumber}`}
                >
                  <th
                    scope="row"
                    className="px-2 py-2.5 text-start text-gray-500 font-medium text-xs sticky start-0 bg-gray-900 z-10"
                  >
                    R{roundNumber}
                  </th>
                  {game.players.map(player => (
                    <td key={player.id} className="px-1 py-2.5 text-center text-gray-300">
                      {player.scores[roundIdx] !== undefined ? (
                        player.scores[roundIdx]
                      ) : (
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
        {isFinished ? (
          /* Game over banner — no save button, undo still available */
          <div className="flex-1 py-3 text-center text-yellow-300 font-semibold rounded-lg bg-yellow-900/20 border border-yellow-700/40">
            🏆 {t('gameOver')}
          </div>
        ) : (
          <button
            type="submit"
            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            aria-label={`${t('saveRound')} ${nextRound}`}
          >
            {t('saveRound')} {nextRound}
          </button>
        )}

        {/* Undo is always available as long as there are rounds */}
        {roundCount > 0 && (
          <button
            type="button"
            onClick={() => onDeleteLastRound(game.id)}
            className="px-4 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-400 hover:text-red-400 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
            aria-label={`${t('undoRound')}${roundCount}`}
          >
            {t('undoRound')}{roundCount}
          </button>
        )}
      </div>
    </form>
  );
}

