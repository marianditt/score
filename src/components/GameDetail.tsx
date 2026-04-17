import { useState } from 'react';
import type { Game } from '../types';
import { ScoreTable } from './ScoreTable';
import { useLanguage } from '../i18n/LanguageContext';

interface GameDetailProps {
  game: Game;
  onBack: () => void;
  onAddRound: (gameId: string, scores: Record<string, number>) => void;
  onDeleteLastRound: (gameId: string) => void;
  onResetGame: (gameId: string) => void;
}

export function GameDetail({
  game,
  onBack,
  onAddRound,
  onDeleteLastRound,
  onResetGame,
}: GameDetailProps) {
  const { t } = useLanguage();
  const [confirmReset, setConfirmReset] = useState(false);

  function handleReset() {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    onResetGame(game.id);
    setConfirmReset(false);
  }

  const playerCount = game.players.length;
  const playersLabel = `${playerCount} ${playerCount === 1 ? t('playersSingular') : t('playersPlural')}`;
  const modeLabel = game.mode === 'highest' ? t('highestWinsShort') : t('lowestWinsShort');

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Sticky header */}
      <header className="sticky top-0 z-20 bg-gray-900/95 backdrop-blur border-b border-gray-800 px-4 py-3 flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 text-gray-400 hover:text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 shrink-0"
          aria-label={t('backToList')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-white truncate">{game.name}</h1>
          <p className="text-xs text-gray-400">
            {playersLabel} · {modeLabel} · {t('thresholdLabel')} {game.threshold}
          </p>
        </div>

        {/* Reset button */}
        {confirmReset ? (
          <div className="flex items-center gap-2 shrink-0" role="alertdialog" aria-label={t('resetAllScores')}>
            <span className="text-sm text-gray-400 hidden sm:block">{t('resetAllScores')}</span>
            <button
              onClick={handleReset}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
              aria-label={t('yesReset')}
              autoFocus
            >
              {t('yesReset')}
            </button>
            <button
              onClick={() => setConfirmReset(false)}
              className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
              aria-label={t('cancel')}
            >
              {t('cancel')}
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmReset(true)}
            className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-400 hover:text-red-400 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 shrink-0"
            aria-label={t('reset')}
          >
            {t('reset')}
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

