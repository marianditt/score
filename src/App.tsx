import { useState } from 'react';
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
  } = useGames();

  const { highContrast, toggleHighContrast } = useHighContrast();

  const [view, setView] = useState<AppView>({ kind: 'list' });

  const selectedGame =
    view.kind === 'game' ? games.find(g => g.id === view.gameId) ?? null : null;

  function handleNewGame() {
    setView({ kind: 'setup' });
  }

  function handleSetupStart(name: string, players: Player[], mode: 'highest' | 'lowest', threshold: number) {
    const game: Game = createGame(name, players, mode, threshold);
    setView({ kind: 'game', gameId: game.id });
  }

  function handleSelectGame(game: Game) {
    setView({ kind: 'game', gameId: game.id });
  }

  function handleBack() {
    setView({ kind: 'list' });
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
        />
      ) : (
        <GameList
          games={games}
          onSelectGame={handleSelectGame}
          onNewGame={handleNewGame}
          onDeleteGame={deleteGame}
          highContrast={highContrast}
          onToggleHighContrast={toggleHighContrast}
        />
      )}
    </ThemeProvider>
  );
}

export default App;

