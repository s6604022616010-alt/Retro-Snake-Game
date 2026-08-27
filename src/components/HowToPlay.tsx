import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Keyboard, Sparkles, Award } from 'lucide-react';

export const HowToPlay: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div id="how-to-play-section" className="w-full bg-slate-900/90 border-2 border-slate-700/80 rounded-2xl overflow-hidden transition shadow-lg">
      <button
        id="btn-toggle-how-to-play"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3.5 flex items-center justify-between bg-slate-900 hover:bg-slate-800 transition cursor-pointer text-left"
      >
        <div className="flex items-center gap-2 flex-wrap">
          <HelpCircle className="w-4 h-4 text-yellow-400 shrink-0" />
          <span className="font-arcade text-[11px] sm:text-xs text-yellow-300 tracking-wider">
            HOW TO PLAY &amp; RULES
          </span>
          <span className="text-xs text-slate-400 font-sans font-medium">
            (วิธีการเล่นและกติกา)
          </span>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-yellow-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>

      {isOpen && (
        <div className="p-4 pt-2 space-y-3 text-xs text-slate-300 border-t border-slate-800">
          {/* Rules & Goal */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-black/70 p-3 rounded-xl border border-cyan-500/30 flex flex-col gap-1">
              <div className="font-arcade text-[10px] text-cyan-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> MISSION GOAL
              </div>
              <p className="text-slate-300 font-retro text-sm leading-relaxed">
                บังคับงูเก็บเม็ดอาหารเพื่อเพิ่มคะแนนและความยาว หลีกเลี่ยงการชนหางตัวเองและขอบจอ
              </p>
            </div>

            <div className="bg-black/70 p-3 rounded-xl border border-yellow-500/30 flex flex-col gap-1">
              <div className="font-arcade text-[10px] text-yellow-400 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" /> POWER-UP FOOD
              </div>
              <ul className="text-slate-300 space-y-1 font-retro text-sm list-disc list-inside">
                <li><span className="text-rose-400">RED APPLE:</span> +10 PTS</li>
                <li><span className="text-yellow-300">GOLDEN DOT:</span> +50 PTS (TIMED)</li>
                <li><span className="text-cyan-300">ICE BERRY:</span> +25 PTS + SLOW MO</li>
              </ul>
            </div>

            <div className="bg-black/70 p-3 rounded-xl border border-pink-500/30 flex flex-col gap-1">
              <div className="font-arcade text-[10px] text-pink-400 flex items-center gap-1.5">
                <Keyboard className="w-3.5 h-3.5" /> CONTROLS
              </div>
              <ul className="text-slate-300 space-y-1 font-retro text-sm">
                <li>• <kbd className="px-1 bg-slate-900 border border-slate-700 rounded text-yellow-300 font-arcade text-[9px]">ARROWS</kbd> / <kbd className="px-1 bg-slate-900 border border-slate-700 rounded text-yellow-300 font-arcade text-[9px]">WASD</kbd> บังคับทิศทาง</li>
                <li>• <kbd className="px-1 bg-slate-900 border border-slate-700 rounded text-cyan-300 font-arcade text-[9px]">SPACE</kbd> พักเกม / เล่นต่อ</li>
                <li>• บนสมาร์ทโฟนใช้ <strong>D-PAD</strong> เสมือน</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

