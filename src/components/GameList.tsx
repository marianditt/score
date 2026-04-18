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

function getLeader(game: Game): string | null {
  if (game.players.length === 0) return null;
  const allZero = game.players.every(p => p.scores.length === 0 || getTotal(p.scores) === 0);
  if (allZero) return null;
  const sorted = [...game.players].sort((a, b) => {
    const ta = getTotal(a.scores);
    const tb = getTotal(b.scores);
    return game.mode === 'highest' ? tb - ta : ta - tb;
  });
  return sorted[0].name;
}

export function GameList({ games, onSelectGame, onNewGame, onDeleteGame, highContrast, onToggleHighContrast }: GameListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const { t, language, setLanguage, availableLanguages, languageNames, gender, setGender, isGendered } = useLanguage();

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
            <h1 className="text-4xl font-bold text-white">🎲 {t.appTitle}</h1>
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
                  className="px-2 py-1.5 rounded-lg text-xs font-medium bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  aria-label={t.language}
                  aria-haspopup="listbox"
                  aria-expanded={showLangMenu}
                  title={t.language}
                  data-testid="language-selector"
                >
                  🌐 {languageNames[language]}
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

              {/* Gender toggle — only shown for languages that differentiate */}
              {isGendered && (
                <button
                  onClick={() => setGender(gender === 'female' ? 'male' : 'female')}
                  className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 border ${
                    gender === 'female'
                      ? 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-500'
                      : 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700'
                  }`}
                  aria-pressed={gender === 'female'}
                  aria-label={t.genderToggle}
                  title={t.genderToggle}
                  data-testid="gender-toggle"
                >
                  {gender === 'female' ? '♀' : '♂'}
                </button>
              )}
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
            <p className="text-5xl mb-4" aria-hidden="true">🎯</p>
            <p className="text-xl font-medium mb-2 text-gray-300">{t.noGamesTitle}</p>
            <p>{t.noGamesHint}</p>
          </div>
        ) : (
          <ul className="space-y-3" role="list" aria-label="Saved games">
            {sortedGames.map(game => {
              const roundCount = game.players[0]?.scores.length ?? 0;
              const gameLeader = getLeader(game);
              const modeLabel = game.mode === 'highest' ? t.highestWins : t.lowestWins;
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
                                <span>{t.leader}: <span className="text-indigo-400 font-medium">{gameLeader}</span></span>
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
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
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
