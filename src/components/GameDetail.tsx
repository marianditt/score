import { useState, useEffect, useRef } from 'react';
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
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

interface GameDetailProps {
  game: Game;
  onBack: () => void;
  onAddRound: (gameId: string, scores: Record<string, number>) => void;
  onDeleteLastRound: (gameId: string) => void;
  onResetGame: (gameId: string) => void;
  onUpdateGame: (game: Game) => void;
  onFinishGame: (gameId: string) => void;
  onPauseTimer: (gameId: string) => void;
  onResumeTimer: (gameId: string) => void;
}

function isGameOver(game: Game): boolean {
  if (game.players.length === 0) return false;
  if (game.finishedAt) return true;
  const { threshold } = game;
  if (threshold === null) return false;
  const totals = game.players.map(p => p.scores.reduce((a: number, b) => a + (b ?? 0), 0));
  if (game.mode === 'highest') return Math.max(...totals) >= threshold;
  return totals.some(t => t >= threshold);
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  if (hours > 0) return `${hours}:${mm}:${ss}`;
  return `${mm}:${ss}`;
}

export function GameDetail({
  game,
  onBack,
  onAddRound,
  onDeleteLastRound,
  onResetGame,
  onUpdateGame,
  onFinishGame,
  onPauseTimer,
  onResumeTimer,
}: GameDetailProps) {
  const { t, isRTL } = useLanguage();
  const [confirmReset, setConfirmReset] = useState(false);
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  // Tick triggers a re-render every second while the timer is running, so the displayed time stays fresh.
  // The snapshot stores the (now, startedAt) pair captured at each tick to avoid calling Date.now() during render.
  const [timerSnapshot, setTimerSnapshot] = useState<{ now: number; startedAt: number | undefined }>({
    now: 0,
    startedAt: undefined,
  });

  const gameOver = isGameOver(game);
  const roundCount = game.players.length > 0
    ? Math.max(0, ...game.players.map(p => p.scores.length))
    : 0;

  // Track previous finishedAt to detect undo-after-finish
  const prevFinishedAt = useRef(game.finishedAt);

  // Resume timer on mount; pause on unmount
  useEffect(() => {
    if (!game.finishedAt) {
      onResumeTimer(game.id);
    }
    return () => {
      onPauseTimer(game.id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.id]);

  // Resume timer when undo clears finishedAt
  useEffect(() => {
    if (prevFinishedAt.current !== undefined && game.finishedAt === undefined) {
      onResumeTimer(game.id);
    }
    prevFinishedAt.current = game.finishedAt;
  }, [game.finishedAt, game.id, onResumeTimer]);

  // Tick every second while the timer is running so the displayed time stays current
  useEffect(() => {
    if (!game.timerStartedAt) return;
    const startedAt = game.timerStartedAt;
    const tick = () => setTimerSnapshot({ now: Date.now(), startedAt });
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [game.timerStartedAt]);

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
  const timerRunning = !!game.timerStartedAt;
  // Use the snapshot captured by the interval to avoid calling Date.now() during render.
  // When the session matches, add elapsed; otherwise show only the accumulated duration.
  const sessionElapsed =
    game.timerStartedAt && timerSnapshot.startedAt === game.timerStartedAt
      ? timerSnapshot.now - game.timerStartedAt
      : 0;
  const displayMs = (game.duration ?? 0) + sessionElapsed;

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
              {t.playersSuffix(game.players.length)} · {modeLabel}{game.threshold !== null ? ` · ${t.threshold} ${game.threshold}` : ''}
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
            {/* Timer display */}
            <Typography
              variant="caption"
              sx={{
                fontVariantNumeric: 'tabular-nums',
                color: gameOver ? 'text.disabled' : timerRunning ? 'text.primary' : 'text.secondary',
                letterSpacing: '0.05em',
                minWidth: '3.5ch',
                textAlign: 'center',
                marginInlineEnd: 0.5,
              }}
              aria-live="off"
            >
              {formatDuration(displayMs)}
            </Typography>

            {/* Pause / Resume timer */}
            {!gameOver && (
              <Tooltip title={timerRunning ? t.pauseTimer : t.resumeTimer}>
                <IconButton
                  onClick={() => timerRunning ? onPauseTimer(game.id) : onResumeTimer(game.id)}
                  aria-label={timerRunning ? t.pauseTimer : t.resumeTimer}
                  aria-pressed={!timerRunning}
                  color="inherit"
                  size="large"
                >
                  {timerRunning ? <PauseIcon /> : <PlayArrowIcon />}
                </IconButton>
              </Tooltip>
            )}

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
              <Stack direction="row" spacing={0.5} sx={{ marginInlineStart: theme => theme.spacing(0.5) }} role="alertdialog" aria-label={t.resetAllScoresQuestion}>
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
          onFinishGame={game.threshold === null ? () => onFinishGame(game.id) : undefined}
        />
      </Box>
    </Box>
  );
}

