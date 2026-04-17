import { useState } from 'react';
import { useGames } from './hooks/useGames';
import { GameList } from './components/GameList';
import { GameDetail } from './components/GameDetail';
import type { Game } from './types';

function App() {
  const {
    games,
    createGame,
    deleteGame,
    updateGame,
    addPlayer,
    deletePlayer,
    movePlayerUp,
    movePlayerDown,
    addRound,
    deleteLastRound,
  } = useGames();

  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);

  const selectedGame = selectedGameId ? games.find(g => g.id === selectedGameId) : null;

  function handleCreateGame(name: string) {
    const newGame = createGame(name);
    setSelectedGameId(newGame.id);
  }

  function handleSelectGame(game: Game) {
    setSelectedGameId(game.id);
  }

  function handleBack() {
    setSelectedGameId(null);
  }

  if (selectedGame) {
    return (
      <GameDetail
        game={selectedGame}
        onBack={handleBack}
        onUpdateGame={updateGame}
        onAddPlayer={addPlayer}
        onDeletePlayer={deletePlayer}
        onMovePlayerUp={movePlayerUp}
        onMovePlayerDown={movePlayerDown}
        onAddRound={addRound}
        onDeleteLastRound={deleteLastRound}
      />
    );
  }

  return (
    <GameList
      games={games}
      onSelectGame={handleSelectGame}
      onCreateGame={handleCreateGame}
      onDeleteGame={deleteGame}
    />
  );
}

export default App;
