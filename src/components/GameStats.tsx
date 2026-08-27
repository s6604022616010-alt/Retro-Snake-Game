import React from 'react';
import { Trophy, Apple, Flame, Clock, Gauge, ShieldAlert } from 'lucide-react';
import { GameMode } from '../types';

interface GameStatsProps {
  score: number;
  highScore: number;
  snakeLength: number;
  combo: number;
  gameTime: number;
  mode: GameMode;
  speedLevel: number;
}

export const GameStats: React.FC<GameStatsProps> = ({
  score,
  highScore,
  snakeLength,
  combo,
  gameTime,
  mode,
  speedLevel,
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getModeBadge = (m: GameMode) => {
    switch (m) {
      case 'speed':
        return { label: 'Speed Rush', color: 'bg-yellow-400/20 text-yellow-300 border-yellow-400/40' };
      case 'obstacles':
        return { label: 'Maze Wall', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' };
      case 'portal':
        return { label: 'Pac-Portal', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' };
      default:
        return { label: 'Classic', color: 'bg-green-500/20 text-green-300 border-green-500/40' };
    }
  };

  const modeBadge = getModeBadge(mode);

  return (
    <div id="game-stats-panel" className="w-full grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5">
      {/* Current Score */}
      <div id="stat-score-card" className="bg-slate-900/90 border-2 border-cyan-500/50 rounded-xl p-3 flex items-center justify-between shadow-[0_0_12px_rgba(6,182,212,0.15)]">
        <div>
          <span className="text-[10px] font-arcade tracking-wider uppercase text-cyan-400">1UP SCORE</span>
          <div className="text-xl sm:text-2xl font-arcade text-green-400 arcade-glow-green tracking-tight">{score}</div>
        </div>
        <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center text-green-400 border border-green-500/30">
          <Apple className="w-5 h-5" />
        </div>
      </div>

      {/* High Score */}
      <div id="stat-highscore-card" className="bg-slate-900/90 border-2 border-yellow-500/50 rounded-xl p-3 flex items-center justify-between shadow-[0_0_12px_rgba(250,204,21,0.15)]">
        <div>
          <span className="text-[10px] font-arcade tracking-wider uppercase text-yellow-400">HIGH SCORE</span>
          <div className="text-xl sm:text-2xl font-arcade text-yellow-400 arcade-glow-yellow tracking-tight">{highScore}</div>
        </div>
        <div className="w-9 h-9 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-400 border border-yellow-500/30">
          <Trophy className="w-5 h-5" />
        </div>
      </div>

      {/* Snake Length */}
      <div id="stat-length-card" className="bg-slate-900/90 border-2 border-slate-700/80 rounded-xl p-3 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-arcade tracking-wider uppercase text-slate-400">LENGTH</span>
          <div className="text-xl font-arcade text-cyan-300 tracking-tight">{snakeLength}</div>
        </div>
        <div className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/30">
          <Gauge className="w-5 h-5" />
        </div>
      </div>

      {/* Game Time */}
      <div id="stat-time-card" className="bg-slate-900/90 border-2 border-slate-700/80 rounded-xl p-3 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-arcade tracking-wider uppercase text-slate-400">TIME</span>
          <div className="text-lg font-arcade text-slate-200 tracking-tight">{formatTime(gameTime)}</div>
        </div>
        <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-700">
          <Clock className="w-5 h-5" />
        </div>
      </div>

      {/* Combo Multiplier */}
      <div id="stat-combo-card" className={`bg-slate-900/90 border-2 rounded-xl p-3 flex items-center justify-between transition-all ${
        combo > 1 ? 'border-pink-500 shadow-[0_0_12px_rgba(236,72,153,0.3)] bg-pink-950/20' : 'border-slate-700/80'
      }`}>
        <div>
          <span className="text-[10px] font-arcade tracking-wider uppercase text-pink-400">MULTIPLIER</span>
          <div className={`text-xl font-arcade tracking-tight ${combo > 1 ? 'text-pink-400 arcade-glow-pink animate-pulse' : 'text-slate-400'}`}>
            {combo > 1 ? `x${combo}` : '1x'}
          </div>
        </div>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${combo > 1 ? 'bg-pink-500/20 text-pink-400 border-pink-500/40 animate-pulse' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>
          <Flame className="w-5 h-5" />
        </div>
      </div>

      {/* Mode & Speed */}
      <div id="stat-mode-card" className="bg-slate-900/90 border-2 border-slate-700/80 rounded-xl p-3 flex flex-col justify-center gap-1 shadow-sm">
        <span className="text-[10px] font-arcade tracking-wider uppercase text-slate-400 flex items-center gap-1">
          <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" /> MODE
        </span>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`text-[10px] font-arcade px-2 py-0.5 rounded border ${modeBadge.color}`}>
            {modeBadge.label}
          </span>
          <span className="text-[10px] font-arcade text-yellow-400 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
            S.{speedLevel}
          </span>
        </div>
      </div>
    </div>
  );
};
