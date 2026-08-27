import React from 'react';
import { Volume2, VolumeX, User, Palette, Sliders, Gamepad2 } from 'lucide-react';
import { GameMode, ThemeName } from '../types';
import { THEMES } from '../utils/themes';
import { sound } from '../utils/audio';

interface SettingsBarProps {
  mode: GameMode;
  onSelectMode: (m: GameMode) => void;
  speedLevel: number;
  onSpeedChange: (speed: number) => void;
  themeId: ThemeName;
  onThemeChange: (id: ThemeName) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  playerName: string;
  onPlayerNameChange: (name: string) => void;
  disabled?: boolean;
}

export const SettingsBar: React.FC<SettingsBarProps> = ({
  mode,
  onSelectMode,
  speedLevel,
  onSpeedChange,
  themeId,
  onThemeChange,
  soundEnabled,
  onToggleSound,
  playerName,
  onPlayerNameChange,
  disabled = false,
}) => {
  return (
    <div id="settings-bar" className="w-full bg-slate-900/90 border-2 border-slate-700/80 rounded-2xl p-4 sm:p-5 flex flex-col gap-4 shadow-xl">
      {/* Top Row: Player Name & Theme & Sound */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        {/* Player Name Input */}
        <div className="sm:col-span-6 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center text-yellow-400 font-arcade text-xs shrink-0">
            1P
          </div>
          <input
            id="input-player-name"
            type="text"
            value={playerName}
            maxLength={18}
            placeholder="PLAYER NAME"
            onChange={(e) => onPlayerNameChange(e.target.value)}
            className="w-full bg-black border border-cyan-500/40 rounded-xl px-3 py-2 text-xs font-arcade text-yellow-300 placeholder-slate-600 focus:outline-none focus:border-yellow-400 transition"
          />
        </div>

        {/* Theme Picker */}
        <div className="sm:col-span-6 flex items-center gap-2">
          <div className="flex items-center gap-2 flex-1 bg-black border border-cyan-500/40 rounded-xl px-2.5 py-1.5 focus-within:border-yellow-400 transition">
            <Palette className="w-4 h-4 text-cyan-400 shrink-0" />
            <select
              id="select-theme"
              value={themeId}
              onChange={(e) => {
                sound.playClick();
                onThemeChange(e.target.value as ThemeName);
              }}
              className="w-full bg-transparent text-xs font-arcade text-cyan-300 focus:outline-none cursor-pointer"
            >
              {THEMES.map((th) => (
                <option key={th.id} value={th.id} className="bg-slate-900 text-slate-100 font-sans">
                  {th.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sound Toggle */}
          <button
            id="btn-toggle-sound"
            type="button"
            onClick={() => {
              onToggleSound();
              sound.playClick();
            }}
            className={`px-3 py-2 rounded-xl border-2 transition flex items-center gap-1.5 text-[10px] font-arcade whitespace-nowrap shrink-0 cursor-pointer ${
              soundEnabled
                ? 'bg-green-500/20 border-green-400 text-green-300 shadow-[0_0_10px_rgba(34,197,94,0.3)]'
                : 'bg-black border-slate-700 text-slate-500'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-green-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            <span>{soundEnabled ? 'AUDIO ON' : 'AUDIO OFF'}</span>
          </button>
        </div>
      </div>

      {/* Second Row: Mode Selector */}
      <div className="flex flex-col gap-2">
        <label className="text-[10px] sm:text-xs font-arcade text-cyan-400 flex items-center gap-1.5 tracking-wider">
          <Gamepad2 className="w-4 h-4 text-yellow-400" /> SELECT GAME MODE
        </label>
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          {/* Classic */}
          <button
            id="btn-mode-classic"
            type="button"
            disabled={disabled}
            onClick={() => {
              sound.playClick();
              onSelectMode('classic');
            }}
            className={`p-3 rounded-xl border-2 text-left transition flex items-center gap-3 cursor-pointer ${
              mode === 'classic'
                ? 'bg-green-500/20 text-green-300 border-green-400 shadow-[0_0_12px_rgba(34,197,94,0.3)]'
                : 'bg-black/60 hover:bg-slate-800 text-slate-400 border-slate-800'
            }`}
          >
            <span className="text-2xl shrink-0">🕹️</span>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] sm:text-xs font-arcade tracking-wider text-green-300 whitespace-nowrap">
                CLASSIC
              </div>
              <div className="text-[11px] font-sans text-slate-300 whitespace-nowrap mt-0.5">
                กติกามาตรฐาน
              </div>
            </div>
          </button>

          {/* Speed Rush */}
          <button
            id="btn-mode-speed"
            type="button"
            disabled={disabled}
            onClick={() => {
              sound.playClick();
              onSelectMode('speed');
            }}
            className={`p-3 rounded-xl border-2 text-left transition flex items-center gap-3 cursor-pointer ${
              mode === 'speed'
                ? 'bg-yellow-500/20 text-yellow-300 border-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.3)]'
                : 'bg-black/60 hover:bg-slate-800 text-slate-400 border-slate-800'
            }`}
          >
            <span className="text-2xl shrink-0">⚡</span>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] sm:text-xs font-arcade tracking-wider text-yellow-300 whitespace-nowrap">
                SPEED RUSH
              </div>
              <div className="text-[11px] font-sans text-slate-300 whitespace-nowrap mt-0.5">
                ยิ่งกินยิ่งเร็วขึ้น
              </div>
            </div>
          </button>

          {/* Maze Wall */}
          <button
            id="btn-mode-obstacles"
            type="button"
            disabled={disabled}
            onClick={() => {
              sound.playClick();
              onSelectMode('obstacles');
            }}
            className={`p-3 rounded-xl border-2 text-left transition flex items-center gap-3 cursor-pointer ${
              mode === 'obstacles'
                ? 'bg-rose-500/20 text-rose-300 border-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                : 'bg-black/60 hover:bg-slate-800 text-slate-400 border-slate-800'
            }`}
          >
            <span className="text-2xl shrink-0">🧱</span>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] sm:text-xs font-arcade tracking-wider text-rose-300 whitespace-nowrap">
                MAZE WALL
              </div>
              <div className="text-[11px] font-sans text-slate-300 whitespace-nowrap mt-0.5">
                กำแพงเขาวงกต
              </div>
            </div>
          </button>

          {/* Pac-Portal */}
          <button
            id="btn-mode-portal"
            type="button"
            disabled={disabled}
            onClick={() => {
              sound.playClick();
              onSelectMode('portal');
            }}
            className={`p-3 rounded-xl border-2 text-left transition flex items-center gap-3 cursor-pointer ${
              mode === 'portal'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                : 'bg-black/60 hover:bg-slate-800 text-slate-400 border-slate-800'
            }`}
          >
            <span className="text-2xl shrink-0">🌀</span>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] sm:text-xs font-arcade tracking-wider text-cyan-300 whitespace-nowrap">
                PAC-PORTAL
              </div>
              <div className="text-[11px] font-sans text-slate-300 whitespace-nowrap mt-0.5">
                ทะลุขอบจอได้
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Third Row: Speed Slider */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs text-slate-300">
          <span className="flex items-center gap-1 font-arcade text-[10px] text-yellow-400">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" /> INITIAL SPEED:
          </span>
          <span className="font-arcade text-xs text-yellow-400 arcade-glow-yellow">
            LEVEL {speedLevel} {speedLevel <= 3 ? '(SLOW)' : speedLevel <= 6 ? '(MED)' : speedLevel <= 8 ? '(FAST)' : '(INSANE 🔥)'}
          </span>
        </div>
        <input
          id="slider-speed-level"
          type="range"
          min="1"
          max="10"
          value={speedLevel}
          disabled={disabled}
          onChange={(e) => onSpeedChange(Number(e.target.value))}
          className="w-full h-2 bg-black rounded-lg appearance-none cursor-pointer accent-yellow-400 border border-slate-700"
        />
        <div className="flex justify-between text-[10px] font-retro text-slate-400 tracking-wider">
          <span>LV.1 CASUAL</span>
          <span>LV.5 ARCADE</span>
          <span>LV.10 TURBO</span>
        </div>
      </div>
    </div>
  );
};

