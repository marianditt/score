import { useState } from 'react';
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
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import Paper from '@mui/material/Paper';

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import LanguageIcon from '@mui/icons-material/Language';
import ContrastIcon from '@mui/icons-material/Contrast';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SportsMartialArtsIcon from '@mui/icons-material/SportsMartialArts';

interface GameListProps {
  games: Game[];
  onSelectGame: (game: Game) => void;
  onNewGame: () => void;
  onDeleteGame: (id: string) => void;
  highContrast: boolean;
  onToggleHighContrast: () => void;
}

function getTotal(scores: number[]): number {
  return scores.reduce((a, b) => a + b, 0);
}

function getLeader(game: Game): { name: string; gender: 'male' | 'female' } | null {
  if (game.players.length === 0) return null;
  const allZero = game.players.every(p => p.scores.length === 0 || getTotal(p.scores) === 0);
  if (allZero) return null;
  const sorted = [...game.players].sort((a, b) => {
    const ta = getTotal(a.scores);
    const tb = getTotal(b.scores);
    return game.mode === 'highest' ? tb - ta : ta - tb;
  });
  return { name: sorted[0].name, gender: sorted[0].gender };
}

export function GameList({ games, onSelectGame, onNewGame, onDeleteGame, highContrast, onToggleHighContrast }: GameListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [langAnchor, setLangAnchor] = useState<null | HTMLElement>(null);
  const { t, language, setLanguage, availableLanguages, languageNames, getGenderedT } = useLanguage();

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

          {/* High contrast toggle */}
          <Tooltip title={t.highContrast}>
            <IconButton
              onClick={onToggleHighContrast}
              aria-pressed={highContrast}
              aria-label={t.highContrast}
              data-testid="high-contrast-toggle"
              color={highContrast ? 'secondary' : 'inherit'}
              size="large"
            >
              <ContrastIcon />
            </IconButton>
          </Tooltip>

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
            {sortedGames.map((game, index) => {
              const roundCount = game.players[0]?.scores.length ?? 0;
              const gameLeader = getLeader(game);
              const modeLabel = game.mode === 'highest' ? t.highestWins : t.lowestWins;
              const leaderLabel = gameLeader ? getGenderedT(gameLeader.gender).leader : null;

              return (
                <ListItem
                  key={game.id}
                  role="listitem"
                  disablePadding
                  sx={{ display: 'block', mb: 1 }}
                >
                  {index > 0 && <Divider sx={{ display: 'none' }} />}
                  <Paper
                    variant="outlined"
                    sx={{
                      borderRadius: 3,
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
                            </Box>
                          }
                          secondary={
                            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mt: 0.25 }}>
                              <Typography variant="caption" color="text.secondary" component="span">
                                {t.playersSuffix(game.players.length)}
                              </Typography>
                              {game.players.length > 0 && (
                                <>
                                  <Typography variant="caption" color="text.disabled" component="span" aria-hidden="true">·</Typography>
                                  <Typography variant="caption" color="text.secondary" component="span">
                                    {roundCount} {roundCount === 1 ? t.roundSingular : t.roundPlural}
                                  </Typography>
                                  {gameLeader && (
                                    <>
                                      <Typography variant="caption" color="text.disabled" component="span" aria-hidden="true">·</Typography>
                                      <Typography variant="caption" component="span">
                                        {leaderLabel}:{' '}
                                        <Box component="span" sx={{ color: 'primary.light', fontWeight: 700 }}>
                                          {gameLeader.name}
                                        </Box>
                                      </Typography>
                                    </>
                                  )}
                                </>
                              )}
                            </Box>
                          }
                        />
                      </ListItemButton>

                      {/* Delete controls */}
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', pr: 1 }}
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
          <AddIcon sx={{ mr: 1 }} />
          {t.newGame}
        </Fab>
      </Box>
    </Box>
  );
}

