import { useState, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useGames } from './hooks/useGames';
import { useHighContrast } from './hooks/useHighContrast';
import { GameList } from './components/GameList';
import { GameEditor } from './components/GameEditor';
import { GameDetail } from './components/GameDetail';
import { darkTheme, highContrastTheme } from './theme';
import type { Game, Player } from './types';

type AppView = { kind: 'list' } | { kind: 'setup' } | { kind: 'game'; gameId: string };

function App() {
  const {
    games,
    createGame,
    deleteGame,
    updateGame,
    addRound,
    deleteLastRound,
    resetGame,
    finishGame,
  } = useGames();

  const { highContrast } = useHighContrast();

  const [view, setView] = useState<AppView>({ kind: 'list' });

  // Sync browser history with in-app navigation so the browser back button/swipe works
  useEffect(() => {
    function handlePopState() {
      setView({ kind: 'list' });
    }
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const selectedGame =
    view.kind === 'game' ? games.find(g => g.id === view.gameId) ?? null : null;

  function handleNewGame() {
    window.history.pushState(null, '');
    setView({ kind: 'setup' });
  }

  function handleSetupStart(name: string, players: Player[], mode: 'highest' | 'lowest', threshold: number | null) {
    const game: Game = createGame(name, players, mode, threshold);
    // Replace the setup history entry with the game entry so back goes straight to list
    window.history.replaceState(null, '');
    setView({ kind: 'game', gameId: game.id });
  }

  function handleSelectGame(game: Game) {
    window.history.pushState(null, '');
    setView({ kind: 'game', gameId: game.id });
  }

  function handleBack() {
    // Let history.back() trigger the popstate listener, which will set the view.
    window.history.back();
  }

  const activeTheme = highContrast ? highContrastTheme : darkTheme;

  return (
    <ThemeProvider theme={activeTheme}>
      <CssBaseline />
      {view.kind === 'setup' ? (
        <GameEditor
          onSave={handleSetupStart}
          onCancel={handleBack}
        />
      ) : view.kind === 'game' && selectedGame ? (
        <GameDetail
          game={selectedGame}
          onBack={handleBack}
          onAddRound={addRound}
          onDeleteLastRound={deleteLastRound}
          onResetGame={resetGame}
          onUpdateGame={updateGame}
          onFinishGame={finishGame}
        />
      ) : (
        <GameList
          games={games}
          onSelectGame={handleSelectGame}
          onNewGame={handleNewGame}
          onDeleteGame={deleteGame}
        />
      )}
    </ThemeProvider>
  );
}

export default App;

