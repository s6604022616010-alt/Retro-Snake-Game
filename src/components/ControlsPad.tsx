import React from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Play, Pause, RotateCcw } from 'lucide-react';
import { Direction } from '../types';
import { sound } from '../utils/audio';

interface ControlsPadProps {
  onDirectionChange: (dir: Direction) => void;
  isPaused: boolean;
  isGameOver: boolean;
  hasGameStarted?: boolean;
  countdown?: number | null;
  onTogglePause: () => void;
  onRestart: () => void;
}

export const ControlsPad: React.FC<ControlsPadProps> = ({
  onDirectionChange,
  isPaused,
  isGameOver,
  hasGameStarted = true,
  countdown = null,
  onTogglePause,
  onRestart,
}) => {
  const handlePress = (dir: Direction) => {
    if (!hasGameStarted || countdown !== null || isPaused || isGameOver) return;
    sound.playClick();
    onDirectionChange(dir);
  };

  return (
    <div id="touch-controls-container" className="w-full flex flex-col items-center gap-3 pt-2">
      {/* Quick Action Bar (Play/Pause/Restart) */}
      <div className="flex items-center gap-2">
        <button
          id="btn-quick-pause"
          type="button"
          onClick={() => {
            sound.playClick();
            onTogglePause();
          }}
          disabled={isGameOver || !hasGameStarted || countdown !== null}
          className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-slate-200 text-xs font-arcade flex items-center gap-2 border-2 border-yellow-400/50 shadow-[0_0_10px_rgba(250,204,21,0.15)] transition disabled:opacity-40 cursor-pointer"
        >
          {isPaused ? <Play className="w-3.5 h-3.5 text-green-400" /> : <Pause className="w-3.5 h-3.5 text-yellow-400" />}
          {isPaused ? 'RESUME' : 'PAUSE'}
        </button>

        <button
          id="btn-quick-restart"
          type="button"
          onClick={() => {
            sound.playClick();
            onRestart();
          }}
          disabled={countdown !== null}
          className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-slate-200 text-xs font-arcade flex items-center gap-2 border-2 border-cyan-400/50 shadow-[0_0_10px_rgba(6,182,212,0.15)] transition disabled:opacity-40 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
          {hasGameStarted ? 'RESET (3s)' : 'START'}
        </button>
      </div>

      {/* Cross D-Pad for Mobile & Touch */}
      <div id="virtual-dpad" className="relative w-48 h-48 select-none touch-manipulation my-1">
        {/* UP */}
        <button
          id="btn-dpad-up"
          type="button"
          aria-label="Up"
          onClick={() => handlePress('UP')}
          className="absolute top-0 left-1/2 -translate-x-1/2 w-14 h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 active:bg-yellow-400 active:text-black active:scale-90 text-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.2)] border-2 border-yellow-400/60 flex items-center justify-center transition-all cursor-pointer"
        >
          <ArrowUp className="w-7 h-7 stroke-[3]" />
        </button>

        {/* LEFT */}
        <button
          id="btn-dpad-left"
          type="button"
          aria-label="Left"
          onClick={() => handlePress('LEFT')}
          className="absolute left-0 top-1/2 -translate-y-1/2 w-14 h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 active:bg-yellow-400 active:text-black active:scale-90 text-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.2)] border-2 border-yellow-400/60 flex items-center justify-center transition-all cursor-pointer"
        >
          <ArrowLeft className="w-7 h-7 stroke-[3]" />
        </button>

        {/* Center Indicator */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black border-2 border-cyan-400/80 shadow-[0_0_8px_rgba(6,182,212,0.4)] flex items-center justify-center pointer-events-none">
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-ping" />
        </div>

        {/* RIGHT */}
        <button
          id="btn-dpad-right"
          type="button"
          aria-label="Right"
          onClick={() => handlePress('RIGHT')}
          className="absolute right-0 top-1/2 -translate-y-1/2 w-14 h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 active:bg-yellow-400 active:text-black active:scale-90 text-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.2)] border-2 border-yellow-400/60 flex items-center justify-center transition-all cursor-pointer"
        >
          <ArrowRight className="w-7 h-7 stroke-[3]" />
        </button>

        {/* DOWN */}
        <button
          id="btn-dpad-down"
          type="button"
          aria-label="Down"
          onClick={() => handlePress('DOWN')}
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 active:bg-yellow-400 active:text-black active:scale-90 text-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.2)] border-2 border-yellow-400/60 flex items-center justify-center transition-all cursor-pointer"
        >
          <ArrowDown className="w-7 h-7 stroke-[3]" />
        </button>
      </div>

      <p className="text-[10px] font-arcade text-slate-400 hidden sm:block tracking-wider">
        KEYBOARD: <kbd className="px-1.5 py-0.5 bg-slate-900 border border-yellow-400/40 rounded text-yellow-300">ARROWS</kbd> OR <kbd className="px-1.5 py-0.5 bg-slate-900 border border-yellow-400/40 rounded text-yellow-300">W A S D</kbd>
      </p>
    </div>
  );
};
