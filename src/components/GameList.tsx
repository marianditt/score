import { useState, useEffect } from 'react';
import type { Game } from '../types';
import { useLanguage } from '../i18n/index';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Fab from '@mui/material/Fab';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Paper from '@mui/material/Paper';

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import LanguageIcon from '@mui/icons-material/Language';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SportsMartialArtsIcon from '@mui/icons-material/SportsMartialArts';

interface GameListProps {
  games: Game[];
  onSelectGame: (game: Game) => void;
  onNewGame: () => void;
  onDeleteGame: (id: string) => void;
}

function getTotal(scores: (number | null)[]): number {
  return scores.reduce((a: number, b) => a + (b ?? 0), 0);
}

function isGameOver(game: Game): boolean {
  if (game.finishedAt) return true;
  if (game.threshold === null || game.players.length === 0) return false;
  const totals = game.players.map(p => getTotal(p.scores));
  if (game.mode === 'highest') return Math.max(...totals) >= game.threshold;
  return totals.some(t => t >= (game.threshold as number));
}

function getPersonToShow(game: Game): { type: 'leader' | 'winner'; name: string; gender: 'male' | 'female' } | null {
  if (game.players.length === 0) return null;
  const allZero = game.players.every(p => p.scores.length === 0 || getTotal(p.scores) === 0);
  if (allZero) return null;

  const sorted = [...game.players].sort((a, b) => {
    const ta = getTotal(a.scores);
    const tb = getTotal(b.scores);
    return game.mode === 'highest' ? tb - ta : ta - tb;
  });
  const best = sorted[0];

  if (isGameOver(game)) {
    return { type: 'winner', name: best.name, gender: best.gender };
  }

  // Not finished: show leader for multi-player games with any scores
  if (game.players.length <= 1) return null;
  return { type: 'leader', name: best.name, gender: best.gender };
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

function getDisplayDuration(game: Game, nowMs: number): number {
  if (game.finishedAt) return game.duration ?? 0;
  if (game.timerStartedAt) {
    const elapsed = nowMs > game.timerStartedAt ? nowMs - game.timerStartedAt : 0;
    return (game.duration ?? 0) + elapsed;
  }
  return game.duration ?? 0; // paused – show accumulated time
}

export function GameList({ games, onSelectGame, onNewGame, onDeleteGame }: GameListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [langAnchor, setLangAnchor] = useState<null | HTMLElement>(null);
  const [nowMs, setNowMs] = useState(0);
  const { t, language, setLanguage, availableLanguages, languageNames, getGenderedT } = useLanguage();

  const hasRunningGames = games.some(g => !!g.timerStartedAt && !isGameOver(g));

  useEffect(() => {
    if (!hasRunningGames) return;
    const id = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(id);
  }, [hasRunningGames]);

  const sortedGames = [...games].sort((a, b) => b.createdAt - a.createdAt);

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

  return (
    <Box sx={{ minHeight: '100dvh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
      {/* Top App Bar */}
      <AppBar position="sticky">
        <Toolbar>
          <EmojiEventsIcon sx={{ mr: 1, color: 'primary.light' }} aria-hidden="true" />
          <Typography variant="h6" component="h1" sx={{ flexGrow: 1 }}>
            {t.appTitle}
          </Typography>

          {/* Language selector */}
          <Tooltip title={t.language}>
            <IconButton
              onClick={e => setLangAnchor(e.currentTarget)}
              aria-label={t.language}
              aria-haspopup="listbox"
              aria-expanded={Boolean(langAnchor)}
              data-testid="language-selector"
              color="inherit"
              size="large"
            >
              <LanguageIcon />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={langAnchor}
            open={Boolean(langAnchor)}
            onClose={() => setLangAnchor(null)}
            slotProps={{ list: { role: 'listbox', 'aria-label': t.language } as React.HTMLAttributes<HTMLUListElement> }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            {availableLanguages.map(lang => (
              <MenuItem
                key={lang}
                role="option"
                aria-selected={lang === language}
                selected={lang === language}
                data-testid={`lang-option-${lang}`}
                onClick={() => { setLanguage(lang); setLangAnchor(null); }}
              >
                {languageNames[lang]}
              </MenuItem>
            ))}
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Content */}
      <Box component="main" sx={{ flex: 1, px: 2, pt: 2, pb: 10, maxWidth: 600, width: '100%', mx: 'auto' }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
          {t.appSubtitle}
        </Typography>

        {sortedGames.length === 0 ? (
          <Box
            sx={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', py: 8, gap: 1,
            }}
          >
            <SportsMartialArtsIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 1 }} aria-hidden="true" />
            <Typography variant="h6" color="text.secondary">{t.noGamesTitle}</Typography>
            <Typography variant="body2" color="text.disabled">{t.noGamesHint}</Typography>
          </Box>
        ) : (
          <List role="list" aria-label="Saved games" disablePadding>
            {sortedGames.map((game) => {
              const roundCount = game.players[0]?.scores.length ?? 0;
              const person = getPersonToShow(game);
              const modeLabel = game.mode === 'highest' ? t.highestWins : t.lowestWins;
              const gameFinished = isGameOver(game);
              const isRunning = !gameFinished && !!game.timerStartedAt;
              const isPaused = !gameFinished && !game.timerStartedAt;
              const durationMs = getDisplayDuration(game, nowMs);
              const personLabel = person
                ? (person.type === 'winner' ? getGenderedT(person.gender).winner : getGenderedT(person.gender).leader)
                : null;

              return (
                <ListItem
                  key={game.id}
                  role="listitem"
                  disablePadding
                  sx={{ display: 'block', mb: 1 }}
                >
                  <Paper
                    variant="outlined"
                    sx={{
                      borderRadius: 1.5,
                      overflow: 'hidden',
                      '&:hover': { borderColor: 'primary.dark' },
                      transition: 'border-color 0.2s',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'stretch' }}>
                      {/* Main tap area */}
                      <ListItemButton
                        onClick={() => onSelectGame(game)}
                        aria-label={`${t.appTitle}: ${game.name}`}
                        sx={{ flex: 1, py: 1.5, borderRadius: 0 }}
                      >
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 700 }} component="span">
                                {game.name}
                              </Typography>
                              <Chip label={modeLabel} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                              {isRunning && (
                                <Chip label={t.running} size="small" variant="outlined" color="success" sx={{ fontSize: '0.7rem' }} />
                              )}
                              {isPaused && (
                                <Chip label={t.paused} size="small" variant="outlined" color="warning" sx={{ fontSize: '0.7rem' }} />
                              )}
                              {gameFinished && (
                                <Chip label={t.finished} size="small" variant="outlined" color="default" sx={{ fontSize: '0.7rem' }} />
                              )}
                            </Box>
                          }
                          secondary={
                            <Box component="span" sx={{ display: 'flex', flexDirection: 'column' }}>
                              <Box component="span" sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mt: 0.25 }}>
                                <Typography variant="caption" color="text.secondary" component="span">
                                  {t.playersSuffix(game.players.length)}
                                </Typography>
                                {game.players.length > 0 && (
                                  <>
                                    <Typography variant="caption" color="text.disabled" component="span" aria-hidden="true">·</Typography>
                                    <Typography variant="caption" color="text.secondary" component="span">
                                      {roundCount} {roundCount === 1 ? t.roundSingular : t.roundPlural}
                                    </Typography>
                                    <Typography variant="caption" color="text.disabled" component="span" aria-hidden="true">·</Typography>
                                    <Typography variant="caption" color="text.secondary" component="span">
                                      {formatDuration(durationMs)}
                                    </Typography>
                                  </>
                                )}
                              </Box>
                              {person && personLabel && (
                                <Box component="span" sx={{ mt: 0.25 }}>
                                  <Typography variant="caption" color="text.secondary" component="span">
                                    {personLabel}:{' '}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    component="span"
                                    sx={{
                                      color: person.type === 'winner' ? 'secondary.main' : 'primary.light',
                                      fontWeight: 700,
                                    }}
                                  >
                                    {person.name}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          }
                        />
                      </ListItemButton>

                      {/* Delete controls */}
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', paddingInlineEnd: 1 }}
                        onClick={e => e.stopPropagation()}
                      >
                        {deletingId === game.id ? (
                          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                            <Button
                              size="small"
                              variant="contained"
                              color="error"
                              onClick={e => handleDeleteConfirm(e, game.id)}
                              aria-label={`${t.yes} – ${game.name}`}
                              autoFocus
                              sx={{ minWidth: 0, px: 1.5, py: 0.75 }}
                            >
                              {t.yes}
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={handleDeleteCancel}
                              aria-label={t.no}
                              sx={{ minWidth: 0, px: 1.5, py: 0.75 }}
                            >
                              {t.no}
                            </Button>
                          </Stack>
                        ) : (
                          <Tooltip title={`${t.deleteConfirm} ${game.name}`}>
                            <IconButton
                              onClick={e => handleDeleteClick(e, game.id)}
                              aria-label={`${t.deleteConfirm} ${game.name}`}
                              size="medium"
                              color="default"
                              sx={{ color: 'text.disabled', '&:hover': { color: 'error.main' } }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </Box>
                  </Paper>
                </ListItem>
              );
            })}
          </List>
        )}
      </Box>

      {/* FAB – New Game */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 24,
          insetInlineEnd: 24,
          zIndex: 1000,
        }}
      >
        <Fab
          onClick={onNewGame}
          aria-label={t.newGame}
          variant="extended"
          color="primary"
          size="large"
        >
          <AddIcon sx={{ marginInlineEnd: theme => theme.spacing(1) }} />
          {t.newGame}
        </Fab>
      </Box>
    </Box>
  );
}

