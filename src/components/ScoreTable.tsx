import type { Game, Player } from '../types';

interface ScoreTableProps {
  game: Game;
}

function getTotal(scores: number[]): number {
  return scores.reduce((a, b) => a + b, 0);
}

function getWinnerAndLeader(game: Game): { winnerId: string | null; leaderId: string | null } {
  if (game.players.length === 0) return { winnerId: null, leaderId: null };

  const totals = game.players.map(p => ({ id: p.id, total: getTotal(p.scores) }));

  if (game.mode === 'highest') {
    const sorted = [...totals].sort((a, b) => b.total - a.total);
    const top = sorted[0];
    const winnerId = top.total >= game.threshold ? top.id : null;
    const leaderId = winnerId ? null : top.id;
    return { winnerId, leaderId };
  } else {
    const anyAbove = totals.some(t => t.total >= game.threshold);
    const sorted = [...totals].sort((a, b) => a.total - b.total);
    const top = sorted[0];
    const winnerId = anyAbove ? top.id : null;
    const leaderId = winnerId ? null : top.id;
    return { winnerId, leaderId };
  }
}

export function ScoreTable({ game }: ScoreTableProps) {
  if (game.players.length === 0) return null;

  const maxRounds = Math.max(...game.players.map(p => p.scores.length), 0);
  const { winnerId, leaderId } = getWinnerAndLeader(game);

  const playerTotals: Record<string, number> = {};
  game.players.forEach(p => {
    playerTotals[p.id] = getTotal(p.scores);
  });

  function rowClass(player: Player): string {
    if (winnerId === player.id) return 'bg-yellow-900/30 border-yellow-600/50';
    if (leaderId === player.id) return 'bg-indigo-900/20 border-indigo-600/30';
    return 'border-transparent';
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-700">
      <table className="w-full text-sm" aria-label="Score table">
        <thead>
          <tr className="bg-gray-800 border-b border-gray-700">
            <th scope="col" className="text-left px-4 py-3 font-semibold text-gray-300 min-w-[120px]">
              Player
            </th>
            {Array.from({ length: maxRounds }, (_, i) => (
              <th key={i} scope="col" className="px-3 py-3 text-center font-medium text-gray-400 min-w-[60px]">
                R{i + 1}
              </th>
            ))}
            <th scope="col" className="px-4 py-3 text-center font-bold text-gray-200 min-w-[80px]">
              Total
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700/50">
          {game.players.map(player => (
            <tr
              key={player.id}
              className={`border-l-2 transition-colors ${rowClass(player)}`}
              aria-label={
                winnerId === player.id
                  ? `${player.name} - Winner with ${playerTotals[player.id]} points`
                  : leaderId === player.id
                  ? `${player.name} - Current leader with ${playerTotals[player.id]} points`
                  : `${player.name} - ${playerTotals[player.id]} points`
              }
            >
              <td className="px-4 py-3 font-medium text-white">
                <div className="flex items-center gap-2">
                  {winnerId === player.id && (
                    <span role="img" aria-label="Winner">🏆</span>
                  )}
                  {leaderId === player.id && (
                    <span role="img" aria-label="Current leader">⭐</span>
                  )}
                  <span>{player.name}</span>
                </div>
              </td>
              {Array.from({ length: maxRounds }, (_, i) => (
                <td key={i} className="px-3 py-3 text-center text-gray-300">
                  {player.scores[i] !== undefined ? player.scores[i] : (
                    <span className="text-gray-600">—</span>
                  )}
                </td>
              ))}
              <td className="px-4 py-3 text-center font-bold text-lg">
                <span className={
                  winnerId === player.id
                    ? 'text-yellow-400'
                    : leaderId === player.id
                    ? 'text-indigo-400'
                    : 'text-white'
                }>
                  {playerTotals[player.id]}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
