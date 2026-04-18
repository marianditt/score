export interface Player {
  id: string;
  name: string;
  gender: 'male' | 'female';
  scores: number[];
}

export interface Game {
  id: string;
  name: string;
  players: Player[];
  threshold: number;
  mode: 'highest' | 'lowest';
  createdAt: number;
}
