import { useState } from 'react';
import { useGames } from './hooks/useGames';
import { useHighContrast } from './hooks/useHighContrast';
import { GameList } from './components/GameList';
import { GameSetup } from './components/GameSetup';
import { GameDetail } from './components/GameDetail';
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

  if (view.kind === 'setup') {
    return (
      <GameSetup
        onStart={handleSetupStart}
        onCancel={handleBack}
      />
    );
  }

  if (view.kind === 'game' && selectedGame) {
    return (
      <GameDetail
        game={selectedGame}
        onBack={handleBack}
        onAddRound={addRound}
        onDeleteLastRound={deleteLastRound}
        onResetGame={resetGame}
        onUpdateGame={updateGame}
      />
    );
  }

  return (
    <GameList
      games={games}
      onSelectGame={handleSelectGame}
      onNewGame={handleNewGame}
      onDeleteGame={deleteGame}
      highContrast={highContrast}
      onToggleHighContrast={toggleHighContrast}
    />
  );
}

export default App;
