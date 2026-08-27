import React from 'react';
import { Trophy, Medal, Trash2, X, Calendar } from 'lucide-react';
import { LeaderboardEntry } from '../types';
import { sound } from '../utils/audio';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: LeaderboardEntry[];
  onClear: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  entries,
  onClear,
}) => {
  if (!isOpen) return null;

  return (
    <div id="leaderboard-modal" className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-slate-950 border-4 border-yellow-400 rounded-3xl w-full max-w-md p-5 shadow-[0_0_30px_rgba(250,204,21,0.3)] space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-yellow-400/40 pb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <h3 className="text-sm font-arcade text-yellow-400 arcade-glow-yellow tracking-wider">
              ARCADE HALL OF FAME
            </h3>
          </div>
          <button
            id="btn-close-leaderboard"
            type="button"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-yellow-400 hover:bg-slate-900 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Entries List */}
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {entries.length === 0 ? (
            <div className="text-center py-8 text-slate-500 font-arcade text-xs tracking-wider">
              NO RECORDS YET! PLAY TO RANK #1
            </div>
          ) : (
            entries.map((entry, index) => {
              const isTop1 = index === 0;
              const isTop2 = index === 1;
              const isTop3 = index === 2;

              return (
                <div
                  key={entry.id || `entry-${index}-${entry.score}-${entry.date}`}
                  className={`p-3 rounded-xl border-2 flex items-center justify-between transition ${
                    isTop1
                      ? 'bg-yellow-400/10 border-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.2)]'
                      : isTop2
                      ? 'bg-slate-900 border-cyan-400/60'
                      : isTop3
                      ? 'bg-slate-900 border-rose-400/60'
                      : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center font-arcade text-xs">
                      {isTop1 ? (
                        <Medal className="w-5 h-5 text-yellow-400" />
                      ) : isTop2 ? (
                        <Medal className="w-5 h-5 text-cyan-300" />
                      ) : isTop3 ? (
                        <Medal className="w-5 h-5 text-rose-400" />
                      ) : (
                        <span className="text-slate-500 font-arcade">#{index + 1}</span>
                      )}
                    </div>
                    <div>
                      <div className="font-arcade text-xs text-yellow-200">{entry.playerName || 'PLAYER'}</div>
                      <div className="text-[10px] font-retro text-slate-400 flex items-center gap-2 mt-0.5">
                        <span className="uppercase font-arcade text-[9px] px-1 py-0.2 bg-black rounded border border-cyan-500/40 text-cyan-300">
                          {entry.mode}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {entry.date}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-base font-arcade text-green-400 arcade-glow-green">{entry.score}</div>
                    <div className="text-[9px] font-arcade text-slate-400">LEN: {entry.snakeLength}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          {entries.length > 0 && (
            <button
              id="btn-clear-leaderboard"
              type="button"
              onClick={() => {
                sound.playClick();
                if (confirm('คุณต้องการล้างสถิติคะแนนทั้งหมดหรือไม่?')) {
                  onClear();
                }
              }}
              className="text-[10px] font-arcade text-rose-400 hover:text-rose-300 flex items-center gap-1 transition"
            >
              <Trash2 className="w-3.5 h-3.5" /> CLEAR ALL
            </button>
          )}

          <button
            id="btn-confirm-close-leaderboard"
            type="button"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="ml-auto px-4 py-1.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-arcade text-[10px] tracking-wider transition"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};

