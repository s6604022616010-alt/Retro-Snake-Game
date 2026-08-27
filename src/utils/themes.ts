import { GameTheme } from '../types';

export const THEMES: GameTheme[] = [
  {
    id: 'cyber-neon',
    name: 'Pac-Arcade (นีออนคลาสสิก)',
    boardBg: '#050814',
    gridLine: 'rgba(56, 189, 248, 0.12)',
    snakeHead: '#22c55e',
    snakeBody: '#15803d',
    snakeAccent: '#facc15',
    foodColor: '#f43f5e',
  },
  {
    id: 'retro-green',
    name: 'GameBoy 8-Bit (เขียวเรโทร)',
    boardBg: '#8b956d',
    gridLine: 'rgba(155, 168, 122, 0.4)',
    snakeHead: '#0f380f',
    snakeBody: '#306230',
    snakeAccent: '#8bac0f',
    foodColor: '#0f380f',
  },
  {
    id: 'sunset-amber',
    name: 'Pacman Maze (เหลือง-น้ำเงินตู้เกม)',
    boardBg: '#000000',
    gridLine: 'rgba(37, 99, 235, 0.25)',
    snakeHead: '#facc15',
    snakeBody: '#ca8a04',
    snakeAccent: '#ef4444',
    foodColor: '#ec4899',
  },
  {
    id: 'deep-ocean',
    name: 'Cyberpunk Neon (ม่วง-ฟ้าไซเบอร์)',
    boardBg: '#0b021a',
    gridLine: 'rgba(168, 85, 247, 0.18)',
    snakeHead: '#38bdf8',
    snakeBody: '#0284c7',
    snakeAccent: '#ec4899',
    foodColor: '#f59e0b',
  }
];

