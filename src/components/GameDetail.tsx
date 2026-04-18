import { useState } from 'react';
import type { Game } from '../types';
import { ScoreTable } from './ScoreTable';
import { GameEditor } from './GameEditor';
import { Confetti } from './Confetti';
import { useLanguage } from '../i18n/index';
import { useHighContrast } from '../hooks/useHighContrast';

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
  const totals = game.players.map(p => p.scores.reduce((a, b) => a + b, 0));
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
  const { t } = useLanguage();
  const { highContrast } = useHighContrast();
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
    <div className="min-h-screen bg-gray-900 text-white">
      {gameOver && <Confetti />}

      {/* Sticky header */}
      <header className="sticky top-0 z-20 bg-gray-900/95 backdrop-blur border-b border-gray-800 px-4 py-3 flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 text-gray-400 hover:text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 shrink-0"
          aria-label="Back to game list"
        >
          {highContrast ? '←' : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-white truncate">{game.name}</h1>
          <p className="text-xs text-gray-400">
            {t.playersSuffix(game.players.length)} · {modeLabel} · {t.threshold} {game.threshold}
          </p>
        </div>

        {/* Edit settings button */}
        <button
          onClick={() => { setConfirmReset(false); setIsEditingSettings(true); }}
          className="p-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-400 hover:text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 shrink-0"
          aria-label={t.editSettings}
          title={t.editSettings}
        >
          {highContrast ? t.editSettings : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-1.414.586H8v-2.414a2 2 0 01.586-1.414z" />
            </svg>
          )}
        </button>

        {/* Reset button */}
        {confirmReset ? (
          <div className="flex items-center gap-2 shrink-0" role="alertdialog" aria-label="Confirm reset">
            <span className="text-sm text-gray-400 hidden sm:block">{t.resetAllScoresQuestion}</span>
            <button
              onClick={handleReset}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
              aria-label="Confirm reset all scores"
              autoFocus
            >
              {t.yesReset}
            </button>
            <button
              onClick={() => setConfirmReset(false)}
              className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
              aria-label="Cancel reset"
            >
              {t.cancelReset}
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmReset(true)}
            disabled={roundCount === 0}
            className="p-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-400 hover:text-red-400 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 shrink-0"
            aria-label={t.reset}
            title={t.reset}
          >
            {highContrast ? t.reset : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
          </button>
        )}
      </header>

      {/* Main content */}
      <main className="p-4 sm:p-6 max-w-5xl mx-auto">
        <ScoreTable
          game={game}
          onAddRound={onAddRound}
          onDeleteLastRound={onDeleteLastRound}
        />
      </main>
    </div>
  );
}
