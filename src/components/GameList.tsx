import { useState } from 'react';
import type { Game } from '../types';
import { useLanguage } from '../i18n/index';

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
  const [showLangMenu, setShowLangMenu] = useState(false);
  const { t, language, setLanguage, availableLanguages, languageNames, getGenderedT } = useLanguage();

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

  const sortedGames = [...games].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        <header className="mb-8">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h1 className="text-4xl font-bold text-white flex items-center gap-2">
              {/* Dice icon */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9 text-indigo-400" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M5 3a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2H5zm3 4a1 1 0 110 2 1 1 0 010-2zm8 0a1 1 0 110 2 1 1 0 010-2zm-4 4a1 1 0 110 2 1 1 0 010-2zM8 15a1 1 0 110 2 1 1 0 010-2zm8 0a1 1 0 110 2 1 1 0 010-2z"/>
              </svg>
              {t.appTitle}
            </h1>
            {/* Accessibility and language controls */}
            <div className="flex items-center gap-2 mt-1 shrink-0 relative">
              {/* High contrast toggle */}
              <button
                onClick={onToggleHighContrast}
                className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 border ${
                  highContrast
                    ? 'bg-yellow-400 text-black border-yellow-400 hover:bg-yellow-300'
                    : 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700'
                }`}
                aria-pressed={highContrast}
                aria-label={t.highContrast}
                title={t.highContrast}
                data-testid="high-contrast-toggle"
              >
                ◑
              </button>

              {/* Language selector */}
              <div className="relative">
                <button
                  onClick={() => setShowLangMenu(v => !v)}
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  aria-label={t.language}
                  aria-haspopup="listbox"
                  aria-expanded={showLangMenu}
                  title={t.language}
                  data-testid="language-selector"
                >
                  {/* Globe icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm6.918 6h-2.833c-.24-1.408-.63-2.674-1.144-3.72A8.027 8.027 0 0118.918 8zM12 4c.74 0 1.717 1.348 2.315 4H9.685C10.283 5.348 11.26 4 12 4zM4.082 14a8.1 8.1 0 010-4H7.1a18.1 18.1 0 000 4H4.082zm.999 2H7.9c.24 1.408.63 2.674 1.143 3.72A8.027 8.027 0 015.081 16zm2.82-8H5.081a8.027 8.027 0 014.861-3.72C9.428 5.326 9.04 6.592 8.8 8H7.9zM12 20c-.74 0-1.717-1.348-2.315-4h4.63C13.717 18.652 12.74 20 12 20zm2.9-6H9.1a16.1 16.1 0 010-4h5.8a16.1 16.1 0 010 4zm.258 6c.514-1.046.904-2.312 1.143-3.72h2.82A8.027 8.027 0 0115.158 20zm1.742-8a18.1 18.1 0 000-4h3.018a8.1 8.1 0 010 4h-3.018z"/>
                  </svg>
                  {languageNames[language]}
                </button>
                {showLangMenu && (
                  <ul
                    role="listbox"
                    aria-label={t.language}
                    className="absolute end-0 top-full mt-1 z-50 bg-gray-800 border border-gray-600 rounded-lg shadow-xl py-1 min-w-[140px]"
                  >
                    {availableLanguages.map(lang => (
                      <li key={lang} role="option" aria-selected={lang === language}>
                        <button
                          onClick={() => { setLanguage(lang); setShowLangMenu(false); }}
                          className={`w-full text-start px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 ${
                            lang === language
                              ? 'bg-indigo-600 text-white font-medium'
                              : 'text-gray-200 hover:bg-gray-700'
                          }`}
                          data-testid={`lang-option-${lang}`}
                        >
                          {languageNames[lang]}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
          <p className="text-gray-400">{t.appSubtitle}</p>
        </header>

        {/* New Game button */}
        <div className="mb-6">
          <button
            onClick={onNewGame}
            className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            aria-label="Create a new game"
          >
            {t.newGame}
          </button>
        </div>

        {/* Game List */}
        {sortedGames.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            {/* Target/bullseye icon */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/>
              <circle cx="12" cy="12" r="6"/>
              <circle cx="12" cy="12" r="2"/>
            </svg>
            <p className="text-xl font-medium mb-2 text-gray-300">{t.noGamesTitle}</p>
            <p>{t.noGamesHint}</p>
          </div>
        ) : (
          <ul className="space-y-3" role="list" aria-label="Saved games">
            {sortedGames.map(game => {
              const roundCount = game.players[0]?.scores.length ?? 0;
              const gameLeader = getLeader(game);
              const modeLabel = game.mode === 'highest' ? t.highestWins : t.lowestWins;
              const leaderLabel = gameLeader ? getGenderedT(gameLeader.gender).leader : null;
              return (
                <li key={game.id}>
                  <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 hover:border-indigo-500 rounded-xl p-3 transition-colors">
                    {/* Game info button */}
                    <button
                      className="flex-1 text-start focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg p-1"
                      onClick={() => onSelectGame(game)}
                      aria-label={`Open game: ${game.name}`}
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base font-semibold text-white">{game.name}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-300">
                          {modeLabel}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-sm text-gray-400 flex-wrap">
                        <span>{t.playersSuffix(game.players.length)}</span>
                        {game.players.length > 0 && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>{roundCount} {roundCount === 1 ? t.roundSingular : t.roundPlural}</span>
                            {gameLeader && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span>{leaderLabel}: <span className="text-indigo-400 font-medium">{gameLeader.name}</span></span>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </button>

                    {/* Delete controls */}
                    <div className="flex items-center gap-2 shrink-0" onClick={e => e.stopPropagation()}>
                      {deletingId === game.id ? (
                        <>
                          <span className="text-sm text-gray-400 hidden sm:block">{t.deleteConfirm}</span>
                          <button
                            onClick={e => handleDeleteConfirm(e, game.id)}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                            aria-label={`Confirm delete ${game.name}`}
                            autoFocus
                          >
                            {t.yes}
                          </button>
                          <button
                            onClick={handleDeleteCancel}
                            className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
                            aria-label="Cancel delete"
                          >
                            {t.no}
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={e => handleDeleteClick(e, game.id)}
                          className="p-2 text-gray-500 hover:text-red-400 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                          aria-label={`Delete game: ${game.name}`}
                        >
                          {highContrast ? '×' : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
