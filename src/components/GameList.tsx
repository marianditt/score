import { useState } from 'react';
import type { Game } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { LANGUAGES, type Language } from '../i18n/translations';

interface GameListProps {
  games: Game[];
  onSelectGame: (game: Game) => void;
  onNewGame: () => void;
  onDeleteGame: (id: string) => void;
}

function getTotal(scores: number[]): number {
  return scores.reduce((a, b) => a + b, 0);
}

function getGameStatus(game: Game): { leaderNames: string[]; winnerNames: string[] } {
  if (game.players.length === 0) return { leaderNames: [], winnerNames: [] };
  const roundCount = game.players[0]?.scores.length ?? 0;
  if (roundCount === 0) return { leaderNames: [], winnerNames: [] };

  const totals = game.players.map(p => ({ name: p.name, total: getTotal(p.scores) }));

  if (game.mode === 'highest') {
    const maxTotal = Math.max(...totals.map(t => t.total));
    const topNames = totals.filter(t => t.total === maxTotal).map(t => t.name);
    if (maxTotal >= game.threshold) return { leaderNames: [], winnerNames: topNames };
    return { leaderNames: topNames, winnerNames: [] };
  } else {
    const anyAbove = totals.some(t => t.total >= game.threshold);
    const minTotal = Math.min(...totals.map(t => t.total));
    const topNames = totals.filter(t => t.total === minTotal).map(t => t.name);
    if (anyAbove) return { leaderNames: [], winnerNames: topNames };
    return { leaderNames: topNames, winnerNames: [] };
  }
}

export function GameList({ games, onSelectGame, onNewGame, onDeleteGame }: GameListProps) {
  const { t, language, setLanguage } = useLanguage();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showLangMenu, setShowLangMenu] = useState(false);

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

  function handleSelectLanguage(lang: Language) {
    setLanguage(lang);
    setShowLangMenu(false);
  }

  const sortedGames = [...games].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        <header className="mb-8">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-1">{t('appTitle')}</h1>
              <p className="text-gray-400 text-sm sm:text-base">{t('appSubtitle')}</p>
            </div>

            {/* Language switcher */}
            <div className="relative shrink-0">
              <button
                onClick={() => setShowLangMenu(v => !v)}
                className="flex items-center gap-1.5 px-3 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-sm text-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label={t('language')}
                aria-expanded={showLangMenu}
                aria-haspopup="listbox"
              >
                <span>{LANGUAGES[language].flag}</span>
                <span className="hidden sm:inline">{LANGUAGES[language].name}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-3.5 w-3.5 transition-transform ${showLangMenu ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>

              {showLangMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowLangMenu(false)}
                    aria-hidden="true"
                  />
                  <ul
                    role="listbox"
                    aria-label={t('language')}
                    className="absolute end-0 mt-1 z-20 bg-gray-800 border border-gray-700 rounded-xl shadow-xl overflow-hidden min-w-[160px]"
                  >
                    {(Object.keys(LANGUAGES) as Language[]).map(lang => (
                      <li key={lang} role="option" aria-selected={lang === language}>
                        <button
                          onClick={() => handleSelectLanguage(lang)}
                          className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm text-start transition-colors hover:bg-gray-700 focus:outline-none focus:bg-gray-700 ${
                            lang === language ? 'text-indigo-400 font-medium bg-gray-750' : 'text-gray-200'
                          }`}
                        >
                          <span>{LANGUAGES[lang].flag}</span>
                          <span>{LANGUAGES[lang].name}</span>
                          {lang === language && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ms-auto text-indigo-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
        </header>

        {/* New Game button */}
        <div className="mb-6">
          <button
            onClick={onNewGame}
            className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            aria-label={t('newGame')}
          >
            {t('newGame')}
          </button>
        </div>

        {/* Game List */}
        {sortedGames.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-5xl mb-4" aria-hidden="true">🎯</p>
            <p className="text-xl font-medium mb-2 text-gray-300">{t('noGamesYet')}</p>
            <p>{t('noGamesHint')}</p>
          </div>
        ) : (
          <ul className="space-y-3" role="list" aria-label={t('appTitle')}>
            {sortedGames.map(game => {
              const roundCount = game.players[0]?.scores.length ?? 0;
              const { leaderNames, winnerNames } = getGameStatus(game);
              const playerCount = game.players.length;
              const playersLabel = `${playerCount} ${playerCount === 1 ? t('playersSingular') : t('playersPlural')}`;
              const roundsLabel = `${roundCount} ${roundCount === 1 ? t('roundSingular') : t('roundsPlural')}`;
              const modeLabel = game.mode === 'highest' ? t('highestWinsShort') : t('lowestWinsShort');
              return (
                <li key={game.id}>
                  <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 hover:border-indigo-500 rounded-xl p-3 transition-colors">
                    {/* Game info button */}
                    <button
                      className="flex-1 text-start focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg p-1 min-w-0"
                      onClick={() => onSelectGame(game)}
                      aria-label={`${t('newGame').replace('+', '').trim()}: ${game.name}`}
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base font-semibold text-white">{game.name}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-300 shrink-0">
                          {modeLabel}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-sm text-gray-400 flex-wrap">
                        <span>{playersLabel}</span>
                        {game.players.length > 0 && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>{roundsLabel}</span>
                            {winnerNames.length > 0 && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span>🏆 <span className="text-yellow-400 font-medium">{winnerNames.join(', ')}</span></span>
                              </>
                            )}
                            {leaderNames.length > 0 && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span>{t('leader')}: <span className="text-indigo-400 font-medium">{leaderNames.join(', ')}</span></span>
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
                          <span className="text-sm text-gray-400 hidden sm:block">{t('deleteConfirm')}</span>
                          <button
                            onClick={e => handleDeleteConfirm(e, game.id)}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                            aria-label={`${t('yes')} — ${game.name}`}
                            autoFocus
                          >
                            {t('yes')}
                          </button>
                          <button
                            onClick={handleDeleteCancel}
                            className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
                            aria-label={t('no')}
                          >
                            {t('no')}
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={e => handleDeleteClick(e, game.id)}
                          className="p-2 text-gray-500 hover:text-red-400 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                          aria-label={`${t('deleteConfirm')} ${game.name}`}
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

