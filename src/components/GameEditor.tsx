import { useState, useRef } from 'react';
import type { Game, Player } from '../types';
import { useLanguage } from '../i18n/index';
import { generateId } from '../hooks/useGames';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Chip from '@mui/material/Chip';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import FormLabel from '@mui/material/FormLabel';
import Alert from '@mui/material/Alert';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import CloseIcon from '@mui/icons-material/Close';
import WcIcon from '@mui/icons-material/Wc';
import ManIcon from '@mui/icons-material/Man';
import WomanIcon from '@mui/icons-material/Woman';

interface GameEditorProps {
  game?: Game;
  onSave: (name: string, players: Player[], mode: 'highest' | 'lowest', threshold: number | null) => void;
  onCancel: () => void;
}

export function GameEditor({ game, onSave, onCancel }: GameEditorProps) {
  const { t } = useLanguage();

  const isEditing = game !== undefined;

  const [gameName, setGameName] = useState(game?.name ?? '');
  const [players, setPlayers] = useState<Player[]>(game?.players ?? []);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [mode, setMode] = useState<'highest' | 'lowest'>(game?.mode ?? 'highest');
  const [threshold, setThreshold] = useState<number | ''>(game?.threshold ?? '');
  const playerInputRef = useRef<HTMLInputElement>(null);

  const canSave = gameName.trim().length > 0 && players.length > 0;

  function handleAddPlayer(e?: React.FormEvent) {
    e?.preventDefault();
    const name = newPlayerName.trim();
    if (!name) return;
    setPlayers(prev => [...prev, { id: generateId(), name, gender: 'female', scores: [] }]);
    setNewPlayerName('');
    playerInputRef.current?.focus();
  }

  function handlePlayerInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddPlayer();
    }
  }

  function handleRemovePlayer(id: string) {
    setPlayers(prev => prev.filter(p => p.id !== id));
  }

  function handleToggleGender(id: string) {
    setPlayers(prev => prev.map(p =>
      p.id === id ? { ...p, gender: p.gender === 'female' ? 'male' : 'female' } : p
    ));
  }

  function handleMoveUp(idx: number) {
    if (idx <= 0) return;
    setPlayers(prev => {
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next;
    });
  }

  function handleMoveDown(idx: number) {
    setPlayers(prev => {
      if (idx >= prev.length - 1) return prev;
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return next;
    });
  }

  function handleThresholdChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    if (raw === '') { setThreshold(''); return; }
    const val = parseFloat(raw);
    if (!isNaN(val)) setThreshold(val);
  }

  function commitSave() {
    if (!canSave) return;
    const finalPlayers = players.map(p => {
      if (isEditing) {
        const existing = game.players.find(ep => ep.id === p.id);
        return existing ? { ...existing, name: p.name, gender: p.gender } : { ...p, scores: [] };
      }
      return p;
    });
    onSave(gameName.trim(), finalPlayers, mode, threshold === '' ? null : threshold as number);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    commitSave();
  }

  function hintText(): string {
    if (!gameName.trim()) return t.enterGameNameHint;
    if (players.length === 0) return t.addPlayerHint;
    return '';
  }

  const title = isEditing ? t.gameSettings : t.newGameSetup;
  const submitLabel = isEditing ? t.saveGameSettings : t.startGame;

  return (
    <Box sx={{ minHeight: '100dvh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <AppBar position="sticky">
        <Toolbar>
          <IconButton
            edge="start"
            onClick={onCancel}
            aria-label={isEditing ? t.cancel : t.backToGameList}
            color="inherit"
            size="large"
          >
            <ArrowBackIcon sx={{ transform: 'var(--rtl-flip, none)' }} />
          </IconButton>
          <Typography variant="h6" component="h1" sx={{ marginInlineStart: 1, flex: 1 }}>
            {title}
          </Typography>
          <Button
            type="button"
            onClick={commitSave}
            disabled={!canSave}
            color="inherit"
            variant="text"
            sx={{ fontWeight: 700, ml: 1 }}
          >
            {submitLabel}
          </Button>
        </Toolbar>
      </AppBar>

      {/* Form */}
      <Box
        component="form"
        onSubmit={handleSave}
        noValidate
        sx={{ flex: 1, px: 2, pt: 2, pb: 4, maxWidth: 560, width: '100%', mx: 'auto' }}
      >
        <Stack spacing={3}>
          {/* Game Name */}
          <TextField
            id="ge-game-name"
            label={t.gameName}
            value={gameName}
            onChange={e => setGameName(e.target.value)}
            placeholder={t.gameNamePlaceholder}
            required
            slotProps={{ htmlInput: { 'aria-required': 'true' } }}
            autoFocus={!isEditing}
            fullWidth
            variant="outlined"
          />

          {/* Players */}
          <Box>
            <FormLabel sx={{ display: 'block', mb: 1, fontWeight: 600 }}>
              {t.playersSection}
              <Box component="span" sx={{ color: 'text.disabled', fontWeight: 400, ml: 0.5 }}>
                ({t.atLeastOne})
              </Box>
            </FormLabel>

            {players.length > 0 && (
              <List dense disablePadding role="list" aria-label="Player list" sx={{ mb: 1 }}>
                {players.map((player, idx) => {
                  const isNew = isEditing && !game.players.some(ep => ep.id === player.id);
                  return (
                    <ListItem
                      key={player.id}
                      disablePadding
                      sx={{
                        bgcolor: 'background.paper',
                        borderRadius: 2,
                        mb: 0.5,
                        px: 1,
                        py: 0.5,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                      }}
                    >
                      {/* Reorder */}
                      <Stack direction="column" spacing={0} aria-label={`Reorder ${player.name}`}>
                        <IconButton
                          size="small"
                          onClick={() => handleMoveUp(idx)}
                          disabled={idx === 0}
                          aria-label={`Move ${player.name} up`}
                          tabIndex={0}
                        >
                          <ArrowUpwardIcon fontSize="inherit" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleMoveDown(idx)}
                          disabled={idx === players.length - 1}
                          aria-label={`Move ${player.name} down`}
                        >
                          <ArrowDownwardIcon fontSize="inherit" />
                        </IconButton>
                      </Stack>

                      <ListItemText
                        primary={player.name}
                        slotProps={{ primary: { style: { fontWeight: 600 } } }}
                        sx={{ flex: 1 }}
                      />

                      {isNew && (
                        <Chip label="new" size="small" color="primary" variant="outlined" sx={{ marginInlineEnd: theme => theme.spacing(0.5) }} />
                      )}

                      {/* Gender toggle */}
                      <Tooltip title={player.gender === 'female' ? 'Female' : 'Male'}>
                        <IconButton
                          size="small"
                          onClick={() => handleToggleGender(player.id)}
                          aria-label={`Toggle gender for ${player.name}: currently ${player.gender}`}
                          sx={{ color: player.gender === 'female' ? 'pink' : 'lightblue' }}
                        >
                          {player.gender === 'female' ? <WomanIcon fontSize="small" /> : <ManIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>

                      {/* Remove */}
                      <IconButton
                        size="small"
                        onClick={() => handleRemovePlayer(player.id)}
                        aria-label={`Remove player ${player.name}`}
                        sx={{ color: 'text.disabled', '&:hover': { color: 'error.main' } }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </ListItem>
                  );
                })}
              </List>
            )}

            {/* Add player row */}
            <Stack direction="row" spacing={1}>
              <TextField
                value={newPlayerName}
                onChange={e => setNewPlayerName(e.target.value)}
                onKeyDown={handlePlayerInputKeyDown}
                placeholder={t.playerNamePlaceholder}
                aria-label={t.playerNamePlaceholder}
                size="small"
                fullWidth
                variant="outlined"
                slotProps={{
                  input: { startAdornment: <WcIcon sx={{ marginInlineEnd: theme => theme.spacing(1), color: 'text.disabled' }} aria-hidden="true" /> },
                  htmlInput: { ref: playerInputRef },
                }}
              />
              <Button
                type="button"
                onClick={() => handleAddPlayer()}
                disabled={!newPlayerName.trim()}
                variant="contained"
                startIcon={<PersonAddIcon />}
                sx={{ flexShrink: 0 }}
                aria-label={t.add}
              >
                {t.add}
              </Button>
            </Stack>
          </Box>

          <Divider />

          {/* Win condition */}
          <Box>
            <FormLabel sx={{ display: 'block', mb: 1, fontWeight: 600 }}>
              {t.winCondition}
            </FormLabel>
            <ToggleButtonGroup
              exclusive
              value={mode}
              onChange={(_, v) => { if (v) setMode(v); }}
              aria-label={t.winCondition}
              fullWidth
            >
              <ToggleButton value="highest" aria-pressed={mode === 'highest'}>
                {t.highestWinsButton}
              </ToggleButton>
              <ToggleButton value="lowest" aria-pressed={mode === 'lowest'}>
                {t.lowestWinsButton}
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Score threshold */}
          <TextField
            id="ge-threshold"
            label={t.scoreThreshold}
            type="number"
            value={threshold}
            onChange={handleThresholdChange}
            placeholder={t.scoreThresholdPlaceholder}
            slotProps={{ htmlInput: { min: 1, 'aria-label': 'Score threshold to end game' } }}
            variant="outlined"
            fullWidth
          />

          {/* Hint */}
          {!canSave && !isEditing && (
            <Alert severity="info" role="status" aria-live="polite">
              {hintText()}
            </Alert>
          )}
        </Stack>
      </Box>
    </Box>
  );
}

