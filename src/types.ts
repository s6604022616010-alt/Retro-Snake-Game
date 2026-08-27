export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface Position {
  x: number;
  y: number;
}

export type GameMode = 'classic' | 'speed' | 'obstacles' | 'portal';

export type FoodType = 'normal' | 'golden' | 'ice' | 'ghost';

export interface Food {
  position: Position;
  type: FoodType;
  points: number;
  expiresAt?: number; // timestamp if temporary
}

export interface Obstacle {
  x: number;
  y: number;
}

export interface LeaderboardEntry {
  id: string;
  playerName: string;
  score: number;
  mode: GameMode;
  date: string;
  snakeLength: number;
}

export type ThemeName = 'retro-green' | 'cyber-neon' | 'sunset-amber' | 'deep-ocean';

export interface GameTheme {
  id: ThemeName;
  name: string;
  boardBg: string;
  gridLine: string;
  snakeHead: string;
  snakeBody: string;
  snakeAccent: string;
  foodColor: string;
}
