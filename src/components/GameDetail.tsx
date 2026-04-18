import { useState } from 'react';
import type { Game } from '../types';
import { ScoreTable } from './ScoreTable';
import { GameEditor } from './GameEditor';
import { Confetti } from './Confetti';
import { useLanguage } from '../i18n/index';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

interface GameDetailProps {
  game: Game;
  onBack: () => void;
  onAddRound: (gameId: string, scores: Record<string, number>) => void;
  onDeleteLastRound: (gameId: string) => void;
  onResetGame: (gameId: string) => void;
  onUpdateGame: (game: Game) => void;
}

function isGameOver(game: Game): boolean {
  if (game.players.length === 0) return false;
  const totals = game.players.map(p => p.scores.reduce((a: number, b) => a + (b ?? 0), 0));
  if (game.mode === 'highest') return Math.max(...totals) >= game.threshold;
  return totals.some(t => t >= game.threshold);
}

export function GameDetail({
  game,
  onBack,
  onAddRound,
  onDeleteLastRound,
  onResetGame,
  onUpdateGame,
}: GameDetailProps) {
  const { t, isRTL } = useLanguage();
  const [confirmReset, setConfirmReset] = useState(false);
  const [isEditingSettings, setIsEditingSettings] = useState(false);

  const gameOver = isGameOver(game);
  const roundCount = game.players.length > 0
    ? Math.max(0, ...game.players.map(p => p.scores.length))
    : 0;

  function handleReset() {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    onResetGame(game.id);
    setConfirmReset(false);
  }

  if (isEditingSettings) {
    return (
      <GameEditor
        game={game}
        onSave={(name, players, mode, threshold) => {
          onUpdateGame({ ...game, name, players, mode, threshold });
          setIsEditingSettings(false);
        }}
        onCancel={() => setIsEditingSettings(false)}
      />
    );
  }

  const modeLabel = game.mode === 'highest' ? t.highestWins : t.lowestWins;

  return (
    <Box sx={{ minHeight: '100dvh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
      {gameOver && <Confetti />}

      <AppBar position="sticky">
        <Toolbar sx={{ position: 'relative' }}>
          <IconButton
            edge="start"
            onClick={onBack}
            aria-label={t.backToGameList}
            color="inherit"
            size="large"
          >
            <ArrowBackIcon sx={{ transform: 'var(--rtl-flip, none)' }} />
          </IconButton>

          <Box sx={{ flex: 1, minWidth: 0, marginInlineStart: 1, overflow: 'hidden' }}>
            <Typography variant="h6" component="h1" noWrap sx={{ fontWeight: 700 }}>
              {game.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap component="p">
              {t.playersSuffix(game.players.length)} · {modeLabel} · {t.threshold} {game.threshold}
            </Typography>
          </Box>

          {/* Controls overlay — absolutely positioned at the logical end so the title text never wraps */}
          <Box
            sx={{
              position: 'absolute',
              insetInlineEnd: 0,
              top: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              paddingInlineStart: theme => theme.spacing(6),
              paddingInlineEnd: theme => theme.spacing(1),
              background: isRTL
                ? theme => `linear-gradient(to left, transparent, ${theme.palette.background.paper} 48px)`
                : theme => `linear-gradient(to right, transparent, ${theme.palette.background.paper} 48px)`,
              // 48 px: 6 spacing overlap region for the gradient fade
            }}
          >
            {/* Edit settings */}
            <Tooltip title={t.editSettings}>
              <IconButton
                onClick={() => { setConfirmReset(false); setIsEditingSettings(true); }}
                aria-label={t.editSettings}
                color="inherit"
                size="large"
              >
                <EditIcon />
              </IconButton>
            </Tooltip>

            {/* Reset */}
            {confirmReset ? (
              <Stack direction="row" spacing={0.5} sx={{ marginInlineStart: '4px' }} role="alertdialog" aria-label={t.resetAllScoresQuestion}>
                <Button
                  size="small"
                  variant="contained"
                  color="error"
                  onClick={handleReset}
                  aria-label={t.yesReset}
                  autoFocus
                  sx={{ px: 1.5 }}
                >
                  {t.yesReset}
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setConfirmReset(false)}
                  aria-label={t.cancelReset}
                  sx={{ px: 1.5 }}
                >
                  {t.cancelReset}
                </Button>
              </Stack>
            ) : (
              <Tooltip title={t.reset}>
                <span>
                  <IconButton
                    onClick={() => setConfirmReset(true)}
                    disabled={roundCount === 0}
                    aria-label={t.reset}
                    color="inherit"
                    size="large"
                  >
                    <RestartAltIcon />
                  </IconButton>
                </span>
              </Tooltip>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main content */}
      <Box component="main" sx={{ flex: 1, p: { xs: 1.5, sm: 3 }, maxWidth: 900, width: '100%', mx: 'auto' }}>
        <ScoreTable
          game={game}
          onAddRound={onAddRound}
          onDeleteLastRound={onDeleteLastRound}
        />
      </Box>
    </Box>
  );
}

