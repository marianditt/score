import { useState, useRef } from 'react';
import type { Game } from '../types';
import { useLanguage } from '../i18n/index';

import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Fab from '@mui/material/Fab';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import AddIcon from '@mui/icons-material/Add';
import UndoIcon from '@mui/icons-material/Undo';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';

interface ScoreTableProps {
  game: Game;
  onAddRound: (gameId: string, scores: Record<string, number>) => void;
  onDeleteLastRound: (gameId: string) => void;
}

function getTotal(scores: (number | null)[]): number {
  return scores.reduce((a: number, b) => a + (b ?? 0), 0);
}

function getLeadersAndWinners(game: Game): { leaderIds: string[]; winnerIds: string[] } {
  if (game.players.length === 0) return { leaderIds: [], winnerIds: [] };

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
  const { getGenderedT } = useLanguage();
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

  const t = getGenderedT('male');

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

  if (game.players.length === 0) return null;

  const playerCount = game.players.length;
  // Compact header cell width to fit ≤6 players without horizontal scroll on mobile
  const headerMinWidth = playerCount <= 3 ? 80 : playerCount <= 6 ? 52 : 72;

  // Winner / leader colours
  function playerHeadSx(playerId: string) {
    if (winnerIds.includes(playerId)) return { color: 'secondary.main', fontWeight: 800 };
    if (leaderIds.includes(playerId)) return { color: 'primary.light', fontWeight: 700 };
    return {};
  }

  function totalCellSx(playerId: string) {
    if (winnerIds.includes(playerId)) return { bgcolor: 'rgba(255,214,0,0.12)', borderBottom: '2px solid', borderColor: 'secondary.main' };
    if (leaderIds.includes(playerId)) return { bgcolor: 'rgba(124,77,255,0.12)', borderBottom: '2px solid', borderColor: 'primary.main' };
    return { borderBottom: '2px solid', borderColor: 'divider' };
  }

  const pastRoundIndices = Array.from({ length: roundCount }, (_, i) => roundCount - 1 - i);

  return (
    <Box
      component="form"
      onSubmit={handleAddRound}
      aria-label={`Score tracking for ${game.name}`}
      sx={{ pb: 12 }}
    >
      <TableContainer
        component={Paper}
        variant="outlined"
        role="region"
        aria-label="Score table"
        sx={{ borderRadius: 3, mb: 1.5 }}
      >
        <Table size="small" sx={{ tableLayout: playerCount > 6 ? 'auto' : 'fixed', minWidth: playerCount > 6 ? 36 + playerCount * headerMinWidth : undefined }}>
          <TableHead>
            <TableRow>
              {/* Round column – sticky */}
              <TableCell
                component="th"
                scope="col"
                sx={{
                  width: 36,
                  position: 'sticky',
                  left: 0,
                  zIndex: 2,
                  bgcolor: 'background.paper',
                  fontWeight: 700,
                  color: 'text.secondary',
                  fontSize: '0.75rem',
                  borderRight: '1px solid',
                  borderColor: 'divider',
                  py: 1.5,
                  px: { xs: 1, sm: 2 },
                }}
              >
                {/* header label removed for compact display */}
              </TableCell>
              {game.players.map(player => {
                const pt = getGenderedT(player.gender);
                return (
                  <TableCell
                    key={player.id}
                    component="th"
                    scope="col"
                    align="center"
                    sx={{
                      minWidth: headerMinWidth,
                      py: 1,
                      px: { xs: 0.5, sm: 1.5 },
                      ...playerHeadSx(player.id),
                    }}
                  >
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.25 }}>
                      <Box sx={{ height: 20, display: 'flex', alignItems: 'center' }}>
                        {winnerIds.includes(player.id) && (
                          <EmojiEventsIcon
                            fontSize="small"
                            sx={{ color: 'secondary.main' }}
                            aria-label={pt.winner}
                          />
                        )}
                        {leaderIds.includes(player.id) && (
                          <StarIcon
                            fontSize="small"
                            sx={{ color: 'primary.light' }}
                            aria-label={pt.currentLeader}
                          />
                        )}
                      </Box>
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 'inherit', display: 'block', maxWidth: headerMinWidth - 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                      >
                        {player.name}
                      </Typography>
                    </Box>
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>

          <TableBody>
            {/* Total row */}
            <TableRow aria-label="Total scores">
              <TableCell
                component="th"
                scope="row"
                sx={{
                  position: 'sticky',
                  left: 0,
                  zIndex: 1,
                  bgcolor: 'background.paper',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  borderRight: '1px solid',
                  ...totalCellSx('__total__'),
                  px: { xs: 1, sm: 2 },
                }}
              >
                #
              </TableCell>
              {game.players.map(player => (
                <TableCell
                  key={player.id}
                  align="center"
                  aria-label={`${player.name} total: ${playerTotals[player.id]}`}
                  sx={{
                    fontSize: '1rem',
                    fontWeight: 700,
                    px: { xs: 0.5, sm: 1.5 },
                    ...totalCellSx(player.id),
                    ...playerHeadSx(player.id),
                  }}
                >
                  {playerTotals[player.id]}
                </TableCell>
              ))}
            </TableRow>

            {/* Current (editable) round row */}
            {!gameOver && (
              <TableRow
                aria-label={`${t.round} ${nextRound} — ${t.now}`}
                sx={{ bgcolor: 'rgba(124,77,255,0.07)' }}
              >
                <TableCell
                  component="th"
                  scope="row"
                  sx={{
                    position: 'sticky',
                    left: 0,
                    zIndex: 1,
                    bgcolor: 'rgba(124,77,255,0.12)',
                    color: 'primary.light',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    borderRight: '1px solid',
                    borderColor: 'divider',
                    whiteSpace: 'nowrap',
                    px: { xs: 1, sm: 2 },
                    py: 1,
                  }}
                >
                  R{nextRound}
                </TableCell>
                {game.players.map((player, idx) => (
                  <TableCell key={player.id} align="center" sx={{ px: { xs: 0.25, sm: 1 }, py: 0.75 }}>
                    <TextField
                      type="number"
                      value={currentScores[player.id] ?? ''}
                      onChange={e => setCurrentScores(prev => ({ ...prev, [player.id]: e.target.value }))}
                      placeholder="0"
                      aria-label={`${player.name} ${t.round} ${nextRound}`}
                      slotProps={{
                        htmlInput: {
                          ref: idx === 0 ? firstInputRef : undefined,
                          inputMode: 'numeric' as const,
                          style: { textAlign: 'center', padding: '4px 2px' },
                          onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => handleInputKeyDown(e, idx),
                        },
                      }}
                      variant="outlined"
                      size="small"
                      sx={{
                        width: '100%',
                        '& .MuiOutlinedInput-root': { borderRadius: 1.5 },
                      }}
                    />
                  </TableCell>
                ))}
              </TableRow>
            )}

            {/* Past rounds */}
            {pastRoundIndices.map(roundIdx => {
              const roundNumber = roundIdx + 1;
              return (
                <TableRow
                  key={roundIdx}
                  aria-label={`${t.round} ${roundNumber}`}
                  sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.03)' } }}
                >
                  <TableCell
                    component="th"
                    scope="row"
                    sx={{
                      position: 'sticky',
                      left: 0,
                      zIndex: 1,
                      bgcolor: 'background.default',
                      color: 'text.disabled',
                      fontWeight: 500,
                      fontSize: '0.72rem',
                      borderRight: '1px solid',
                      borderColor: 'divider',
                      px: { xs: 1, sm: 2 },
                      py: 1,
                    }}
                  >
                    R{roundNumber}
                  </TableCell>
                  {game.players.map(player => (
                    <TableCell
                      key={player.id}
                      align="center"
                      sx={{ color: 'text.secondary', px: { xs: 0.5, sm: 1.5 }, py: 1, fontSize: '0.85rem' }}
                    >
                      {player.scores[roundIdx] != null ? player.scores[roundIdx] : (
                        <Box component="span" sx={{ color: 'text.disabled' }} aria-hidden="true">—</Box>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Fixed action buttons – FAB at bottom-end (consistent with home page) */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 24,
          insetInlineEnd: 24,
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'row',
          gap: 1.5,
          alignItems: 'center',
        }}
      >
        <Tooltip title={`${t.round} ${roundCount}`}>
          <span>
            <IconButton
              type="button"
              onClick={() => onDeleteLastRound(game.id)}
              disabled={roundCount === 0}
              aria-label={`Undo ${t.round} ${roundCount}`}
              size="large"
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 3,
                bgcolor: 'background.paper',
                color: 'text.primary',
                '&.Mui-disabled': { color: 'action.disabled' },
                '&:not(.Mui-disabled):hover': { color: 'error.main', borderColor: 'error.main' },
              }}
            >
              <UndoIcon />
            </IconButton>
          </span>
        </Tooltip>
        <Fab
          type="submit"
          disabled={gameOver}
          variant="extended"
          color="primary"
          size="large"
          aria-label={`${t.round} ${nextRound}`}
        >
          <AddIcon sx={{ mr: 1 }} />
          {t.round}
        </Fab>
      </Box>
    </Box>
  );
}

