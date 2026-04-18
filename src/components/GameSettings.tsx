import { useState, useRef } from 'react';
import type { Game, Player } from '../types';
import { useLanguage } from '../i18n/index';
import { generateId } from '../hooks/useGames';
import { useHighContrast } from '../hooks/useHighContrast';

interface GameSettingsProps {
  game: Game;
  onSave: (updated: Game) => void;
  onClose: () => void;
}

export function GameSettings({ game, onSave, onClose }: GameSettingsProps) {
  const { t } = useLanguage();
  const { highContrast } = useHighContrast();
  const [gameName, setGameName] = useState(game.name);
  const [mode, setMode] = useState<'highest' | 'lowest'>(game.mode);
  const [threshold, setThreshold] = useState<number | ''>(game.threshold);
  // Local copy of existing players — users can remove them
  const [players, setPlayers] = useState<Player[]>(game.players);
  const [newPlayerName, setNewPlayerName] = useState('');
  const playerInputRef = useRef<HTMLInputElement>(null);

  const thresholdValid = threshold !== '' && threshold > 0;
  const canSave = gameName.trim().length > 0 && players.length > 0 && thresholdValid;

  function handleAddPlayer(e?: React.FormEvent) {
    e?.preventDefault();
    const name = newPlayerName.trim();
    if (!name) return;
    setPlayers(prev => [...prev, { id: generateId(), name, scores: [] }]);
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

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!canSave) return;
    const updated: Game = {
      ...game,
      name: gameName.trim(),
      mode,
      threshold: threshold as number,
      // Preserve scores of existing players; new players start with scores: []
      players: players.map(p => {
        const existing = game.players.find(ep => ep.id === p.id);
        return existing ? existing : { ...p, scores: [] };
      }),
    };
    onSave(updated);
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-8">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Cancel editing settings"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-white">{t.gameSettings}</h1>
        </div>

        <form onSubmit={handleSave} noValidate>
          {/* Game Name */}
          <section className="bg-gray-800 rounded-xl border border-gray-700 p-4 mb-4" aria-labelledby="gs-section-name">
            <h2 id="gs-section-name" className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              {t.gameName}
            </h2>
            <input
              id="settings-game-name"
              type="text"
              value={gameName}
              onChange={e => setGameName(e.target.value)}
              placeholder={t.gameNamePlaceholder}
              required
              aria-required="true"
              className="w-full rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-500 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              autoFocus
            />
          </section>

          {/* Players */}
          <section className="bg-gray-800 rounded-xl border border-gray-700 p-4 mb-4" aria-labelledby="gs-section-players">
            <h2 id="gs-section-players" className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              {t.playersSection} <span className="text-gray-500 font-normal normal-case">{t.atLeastOne}</span>
            </h2>

            {players.length > 0 && (
              <ul className="space-y-2 mb-3" role="list" aria-label="Player list">
                {players.map((player, idx) => {
                  const isExisting = game.players.some(ep => ep.id === player.id);
                  return (
                    <li
                      key={player.id}
                      className="flex items-center gap-2 bg-gray-700/50 rounded-lg px-3 py-2"
                    >
                      {/* Reorder buttons */}
                      <div className="flex flex-col gap-0.5" aria-label={`Reorder ${player.name}`}>
                        <button
                          type="button"
                          onClick={() => handleMoveUp(idx)}
                          disabled={idx === 0}
                          className="p-0.5 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed rounded transition-colors focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          aria-label={`Move ${player.name} up`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveDown(idx)}
                          disabled={idx === players.length - 1}
                          className="p-0.5 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed rounded transition-colors focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          aria-label={`Move ${player.name} down`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>

                      <span className="flex-1 text-white font-medium">{player.name}</span>
                      {!isExisting && (
                        <span className="text-xs text-indigo-400 px-1.5 py-0.5 rounded bg-indigo-900/40">new</span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemovePlayer(player.id)}
                        className="p-1.5 text-gray-500 hover:text-red-400 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                        aria-label={`Remove player ${player.name}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            <div className="flex gap-2">
              <input
                ref={playerInputRef}
                type="text"
                value={newPlayerName}
                onChange={e => setNewPlayerName(e.target.value)}
                onKeyDown={handlePlayerInputKeyDown}
                placeholder={t.playerNamePlaceholder}
                aria-label="New player name"
                className="flex-1 bg-gray-700 border border-gray-600 text-white placeholder-gray-500 rounded-lg px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => handleAddPlayer()}
                disabled={!newPlayerName.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="Add player"
              >
                {t.add}
              </button>
            </div>
          </section>

          {/* Settings */}
          <section className="bg-gray-800 rounded-xl border border-gray-700 p-4 mb-6" aria-labelledby="gs-section-settings">
            <h2 id="gs-section-settings" className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              {t.gameSettings}
            </h2>
            <div className="flex flex-wrap gap-6">
              {/* Win condition */}
              <fieldset>
                <legend className="block text-sm text-gray-300 mb-1">{t.winCondition}</legend>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setMode('highest')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      mode === 'highest'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                    aria-pressed={mode === 'highest'}
                  >
                    {t.highestWinsButton}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('lowest')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      mode === 'lowest'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                    aria-pressed={mode === 'lowest'}
                  >
                    {t.lowestWinsButton}
                  </button>
                </div>
              </fieldset>

              {/* Score threshold */}
              <div>
                <label htmlFor="settings-threshold" className="block text-sm text-gray-300 mb-1">
                  {t.scoreThreshold}
                </label>
                <input
                  id="settings-threshold"
                  type="number"
                  value={threshold}
                  onChange={handleThresholdChange}
                  placeholder={t.scoreThresholdPlaceholder}
                  min={1}
                  className="w-28 bg-gray-700 border border-gray-600 text-white placeholder-gray-500 rounded-lg px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  aria-label="Score threshold to end game"
                />
              </div>
            </div>
          </section>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-gray-200 font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={!canSave}
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              {t.saveGameSettings}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
