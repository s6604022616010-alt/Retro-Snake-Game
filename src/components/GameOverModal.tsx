import React from 'react';
import { RotateCcw, Trophy, Skull, Award } from 'lucide-react';
import { sound } from '../utils/audio';

interface GameOverModalProps {
  isOpen: boolean;
  score: number;
  highScore: number;
  isNewHigh: boolean;
  snakeLength: number;
  gameTime: number;
  playerName: string;
  onRestart: () => void;
  onOpenLeaderboard: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  score,
  highScore,
  isNewHigh,
  snakeLength,
  gameTime,
  playerName,
  onRestart,
  onOpenLeaderboard,
}) => {
  if (!isOpen) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div id="game-over-modal" className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-slate-950 border-4 border-rose-500/80 rounded-3xl w-full max-w-sm p-6 text-center shadow-[0_0_30px_rgba(244,63,94,0.4)] space-y-4">
        {/* Icon & Title */}
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-2 border-2 border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.3)]">
            <Skull className="w-8 h-8 animate-pulse" />
          </div>
          <h2 className="text-xl sm:text-2xl font-arcade text-rose-500 arcade-glow-pink tracking-wider">
            GAME OVER
          </h2>
          <p className="text-xs font-retro tracking-widest text-slate-400 mt-1">
            {playerName ? `PLAYER: ${playerName}` : 'CONTINUE? INSERT COIN'}
          </p>
        </div>

        {/* New High Score Banner */}
        {isNewHigh && (
          <div className="bg-yellow-400/20 border-2 border-yellow-400 rounded-xl py-2 px-3 flex items-center justify-center gap-2 text-yellow-300 font-arcade text-[10px] tracking-wider shadow-[0_0_15px_rgba(250,204,21,0.4)] animate-bounce">
            <Award className="w-4 h-4 text-yellow-400" /> NEW HIGH SCORE!
          </div>
        )}

        {/* Score Summary Box */}
        <div className="bg-slate-900 border-2 border-slate-800 rounded-2xl p-4 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-arcade text-[10px] text-cyan-400">1UP SCORE:</span>
            <span className="font-arcade text-lg text-green-400 arcade-glow-green">{score}</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="font-arcade text-[10px] text-yellow-400">HIGH SCORE:</span>
            <span className="font-arcade text-sm text-yellow-400 arcade-glow-yellow">{highScore}</span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800 font-retro tracking-wider">
            <span>LENGTH: <strong className="text-cyan-300 font-arcade text-[10px]">{snakeLength}</strong></span>
            <span>TIME: <strong className="text-slate-200 font-arcade text-[10px]">{formatTime(gameTime)}</strong></span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-1">
          <button
            id="btn-modal-restart"
            type="button"
            onClick={() => {
              sound.playClick();
              onRestart();
            }}
            className="w-full py-3 px-4 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-arcade text-xs tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(250,204,21,0.4)] active:scale-95 transition cursor-pointer border-2 border-yellow-200"
          >
            <RotateCcw className="w-4 h-4" /> PLAY AGAIN (3s)
          </button>

          <button
            id="btn-modal-leaderboard"
            type="button"
            onClick={() => {
              sound.playClick();
              onOpenLeaderboard();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-yellow-300 text-[10px] font-arcade tracking-wider flex items-center justify-center gap-2 border border-yellow-500/40 transition"
          >
            <Trophy className="w-4 h-4 text-yellow-400" /> VIEW TOP SCORES
          </button>
        </div>
      </div>
    </div>
  );
};

