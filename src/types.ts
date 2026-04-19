export interface Player {
  id: string;
  name: string;
  gender: 'male' | 'female';
  scores: (number | null)[];
}

export interface Game {
  id: string;
  name: string;
  players: Player[];
  threshold: number | null;
  mode: 'highest' | 'lowest';
  createdAt: number;
  finishedAt?: number;
  /** Accumulated play-time in milliseconds (paused or stopped portions). */
  duration?: number;
  /** Timestamp (ms since epoch) when the timer was last resumed; undefined when paused. */
  timerStartedAt?: number;
}
