import React, { useEffect, useRef } from 'react';
import { Position, Food, Obstacle, GameTheme, Direction } from '../types';
import { Play } from 'lucide-react';
import { sound } from '../utils/audio';
import { PacmanSnakeLogo } from './PacmanSnakeLogo';

interface GameBoardProps {
  gridSize: number;
  snake: Position[];
  direction: Direction;
  food: Food | null;
  obstacles: Obstacle[];
  theme: GameTheme;
  isPaused: boolean;
  isGameOver: boolean;
  hasGameStarted: boolean;
  countdown: number | null;
  onStartGame: () => void;
  onDirectionChange?: (dir: Direction) => void;
  ghostActive?: boolean;
}

// Helper to draw rounded rectangle safely on any browser
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const r = Math.max(0, Math.min(radius, width / 2, height / 2));
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, width, height, r);
  } else {
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + width, y, x + width, y + height, r);
    ctx.arcTo(x + width, y + height, x, y + height, r);
    ctx.arcTo(x, y + height, x, y, r);
    ctx.arcTo(x, y, x + width, y, r);
    ctx.closePath();
  }
}

export const GameBoard: React.FC<GameBoardProps> = ({
  gridSize,
  snake,
  direction,
  food,
  obstacles,
  theme,
  isPaused,
  isGameOver,
  hasGameStarted,
  countdown,
  onStartGame,
  onDirectionChange,
  ghostActive = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || !onDirectionChange || e.changedTouches.length === 0) return;
    const startX = touchStartRef.current.x;
    const startY = touchStartRef.current.y;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;

    const dx = endX - startX;
    const dy = endY - startY;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    // Minimum swipe threshold
    if (Math.max(absDx, absDy) > 20) {
      if (absDx > absDy) {
        if (dx > 0) onDirectionChange('RIGHT');
        else onDirectionChange('LEFT');
      } else {
        if (dy > 0) onDirectionChange('DOWN');
        else onDirectionChange('UP');
      }
    }
    touchStartRef.current = null;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cellSize = canvas.width / gridSize;

    // 1. Draw Board Background
    ctx.fillStyle = theme.boardBg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Draw Subtle Grid Lines
    ctx.strokeStyle = theme.gridLine;
    ctx.lineWidth = 1;
    for (let i = 0; i <= gridSize; i++) {
      // vertical
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, canvas.height);
      ctx.stroke();
      // horizontal
      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(canvas.width, i * cellSize);
      ctx.stroke();
    }

    // 3. Draw Obstacles (if any)
    obstacles.forEach((obs) => {
      ctx.fillStyle = '#64748b'; // slate-500
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      const x = obs.x * cellSize;
      const y = obs.y * cellSize;
      const r = 4;
      
      ctx.beginPath();
      drawRoundedRect(ctx, x + 2, y + 2, cellSize - 4, cellSize - 4, r);
      ctx.fill();
      ctx.stroke();

      // Brick pattern diagonal line
      ctx.strokeStyle = '#475569';
      ctx.beginPath();
      ctx.moveTo(x + 4, y + cellSize - 4);
      ctx.lineTo(x + cellSize - 4, y + 4);
      ctx.stroke();
    });

    // 4. Draw Food with glow
    if (food) {
      const fx = food.position.x * cellSize + cellSize / 2;
      const fy = food.position.y * cellSize + cellSize / 2;
      const radius = Math.max(1, (cellSize / 2) * 0.78);

      ctx.save();
      if (food.type === 'golden') {
        // Golden Apple
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 14;
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(fx, fy, radius, 0, Math.PI * 2);
        ctx.fill();

        // Inner star highlight
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(fx - radius * 0.3, fy - radius * 0.3, radius * 0.3, 0, Math.PI * 2);
        ctx.fill();
      } else if (food.type === 'ice') {
        // Ice Berry (Slow Motion)
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 12;
        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        drawRoundedRect(ctx, fx - radius, fy - radius, radius * 2, radius * 2, 4);
        ctx.fill();

        ctx.fillStyle = '#e0f2fe';
        ctx.beginPath();
        ctx.arc(fx, fy, radius * 0.4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Normal Apple
        ctx.shadowColor = theme.foodColor;
        ctx.shadowBlur = 8;
        ctx.fillStyle = theme.foodColor;
        ctx.beginPath();
        ctx.arc(fx, fy, radius, 0, Math.PI * 2);
        ctx.fill();

        // Leaf on top
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.ellipse(fx + 2, fy - radius * 0.85, 3, 5, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // 5. Draw Realistic Snake Body & Head
    const snakeLen = snake.length;

    // Draw snake body segments from tail to head
    for (let index = snakeLen - 1; index >= 0; index--) {
      const segment = snake[index];
      const sx = segment.x * cellSize;
      const sy = segment.y * cellSize;
      const cx = sx + cellSize / 2;
      const cy = sy + cellSize / 2;
      const isHead = index === 0;
      const isTail = index === snakeLen - 1;

      ctx.save();
      if (ghostActive) {
        ctx.globalAlpha = 0.55;
      }

      if (isHead) {
        // === REALISTIC SNAKE HEAD WITH PAC-MAN / SERPENT SHAPING ===
        ctx.fillStyle = theme.snakeHead;
        ctx.shadowColor = theme.snakeAccent;
        ctx.shadowBlur = 12;

        // Determine angle of head based on direction
        let headAngle = 0;
        if (direction === 'RIGHT') headAngle = 0;
        else if (direction === 'DOWN') headAngle = Math.PI / 2;
        else if (direction === 'LEFT') headAngle = Math.PI;
        else if (direction === 'UP') headAngle = -Math.PI / 2;

        ctx.translate(cx, cy);
        ctx.rotate(headAngle);

        const r = cellSize * 0.46;

        // Serpent rounded snout/head
        ctx.beginPath();
        ctx.ellipse(0, 0, r * 1.05, r * 0.88, 0, 0, Math.PI * 2);
        ctx.fill();

        // Forked tongue flicking in front of snout
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = Math.max(1.8, cellSize * 0.08);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        const tongueStart = r * 0.85;
        const tongueMid = r * 1.5;
        const tongueFork = r * 1.85;
        ctx.moveTo(tongueStart, 0);
        ctx.lineTo(tongueMid, 0);
        // Top fork
        ctx.lineTo(tongueFork, -r * 0.28);
        // Bottom fork
        ctx.moveTo(tongueMid, 0);
        ctx.lineTo(tongueFork, r * 0.28);
        ctx.stroke();

        // Reptile Eyes with vertical slits (placed on sides of serpent head)
        const eyeX = r * 0.2;
        const eyeY = r * 0.52;
        const eyeRadiusX = r * 0.3;
        const eyeRadiusY = r * 0.22;

        // Left Eye (top in rotated frame)
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(eyeX, -eyeY, eyeRadiusX, eyeRadiusY, 0, 0, Math.PI * 2);
        ctx.fill();
        // Right Eye (bottom in rotated frame)
        ctx.beginPath();
        ctx.ellipse(eyeX, eyeY, eyeRadiusX, eyeRadiusY, 0, 0, Math.PI * 2);
        ctx.fill();

        // Dark Vertical Slit Pupils (Classic Viper / Serpent look)
        ctx.fillStyle = '#09090b';
        ctx.beginPath();
        ctx.ellipse(eyeX + 1, -eyeY, eyeRadiusX * 0.35, eyeRadiusY * 0.9, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(eyeX + 1, eyeY, eyeRadiusX * 0.35, eyeRadiusY * 0.9, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eye highlights (shiny glint)
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(eyeX - 1, -eyeY - 1, eyeRadiusX * 0.25, 0, Math.PI * 2);
        ctx.arc(eyeX - 1, eyeY - 1, eyeRadiusX * 0.25, 0, Math.PI * 2);
        ctx.fill();

        // Head scale patterns (reptile brow ridges)
        ctx.fillStyle = theme.snakeAccent;
        ctx.beginPath();
        ctx.arc(-r * 0.35, 0, r * 0.22, 0, Math.PI * 2);
        ctx.fill();

      } else {
        // === ORGANIC CONNECTED SNAKE BODY & SCALES ===
        // Smooth scaling: Body tapers gently near tail
        const progress = index / Math.max(1, snakeLen - 1);
        // Radius between 0.44 (near head) down to 0.26 (tail tip)
        const radius = isTail ? cellSize * 0.28 : cellSize * (0.44 - progress * 0.12);

        ctx.fillStyle = theme.snakeBody;
        ctx.shadowColor = theme.snakeAccent;
        ctx.shadowBlur = index < 3 ? 4 : 0;

        // Draw connecting link to previous segment for continuous smooth snake body
        const prevSeg = snake[index - 1];
        if (prevSeg) {
          const pcx = prevSeg.x * cellSize + cellSize / 2;
          const pcy = prevSeg.y * cellSize + cellSize / 2;

          // Check if not wrapping through portal
          const dx = Math.abs(segment.x - prevSeg.x);
          const dy = Math.abs(segment.y - prevSeg.y);
          if (dx <= 1 && dy <= 1) {
            ctx.strokeStyle = theme.snakeBody;
            ctx.lineWidth = radius * 2;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(pcx, pcy);
            ctx.stroke();
          }
        }

        // Segment circle
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();

        // Decorative Diamond Scales / Snake Patterns on spine
        if (index % 2 === 0 && !isTail) {
          ctx.fillStyle = theme.snakeAccent;
          const scaleSize = Math.max(2, radius * 0.45);
          ctx.beginPath();
          ctx.ellipse(cx, cy, scaleSize, scaleSize * 0.65, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (index % 2 === 1 && !isTail) {
          // Subtle dorsal ridge dot
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(cx, cy, Math.max(1.2, radius * 0.22), 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    }

  }, [gridSize, snake, direction, food, obstacles, theme, isPaused, isGameOver, ghostActive]);

  return (
    <div
      id="game-canvas-wrapper"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative w-full max-w-[480px] aspect-square mx-auto rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(6,182,212,0.25)] border-4 border-cyan-500/80 bg-black flex items-center justify-center touch-none select-none"
    >
      <canvas
        id="snake-canvas"
        ref={canvasRef}
        width={480}
        height={480}
        className="w-full h-full block"
      />

      {/* 1. Overlay for Initial Start Screen */}
      {!hasGameStarted && !isGameOver && countdown === null && (
        <div id="start-screen-overlay" className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center text-white z-20 p-6 text-center animate-fadeIn">
          <div className="mb-3 transform hover:scale-105 transition">
            <PacmanSnakeLogo size={70} />
          </div>

          <h2 className="text-xl sm:text-2xl font-arcade text-yellow-400 arcade-glow-yellow mb-2 tracking-wider">
            PAC-SNAKE
          </h2>
          <div className="text-[12px] font-retro text-cyan-300 tracking-widest uppercase mb-5">
            ★ INSERT COIN TO PLAY ★
          </div>

          <button
            id="btn-start-game-main"
            type="button"
            onClick={() => {
              sound.playClick();
              onStartGame();
            }}
            className="px-6 py-3 rounded-xl bg-yellow-400 hover:bg-yellow-300 active:scale-95 text-black font-arcade text-xs tracking-wider flex items-center gap-2.5 shadow-[0_0_20px_rgba(250,204,21,0.5)] border-2 border-yellow-200 transition cursor-pointer"
          >
            <Play className="w-4 h-4 fill-black" /> START GAME
          </button>

          <p className="text-[12px] font-retro text-slate-400 mt-5 tracking-wide">
            PRESS <kbd className="px-2 py-0.5 bg-slate-900 border border-cyan-500/40 rounded text-cyan-300 font-arcade text-[9px]">SPACE</kbd> OR <kbd className="px-2 py-0.5 bg-slate-900 border border-cyan-500/40 rounded text-cyan-300 font-arcade text-[9px]">ENTER</kbd>
          </p>
        </div>
      )}

      {/* 2. Overlay for 3-Second Countdown */}
      {countdown !== null && (
        <div id="countdown-overlay" className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center text-white z-20 select-none animate-fadeIn">
          <div className="flex flex-col items-center justify-center">
            <div className="text-xs font-arcade uppercase tracking-widest text-cyan-400 arcade-glow-cyan mb-4">
              READY!
            </div>
            <div
              key={countdown}
              className={`font-arcade tracking-tight transition-all transform scale-110 animate-pulse ${
                countdown === 0
                  ? 'text-5xl sm:text-6xl text-green-400 arcade-glow-green'
                  : countdown === 1
                  ? 'text-6xl sm:text-7xl text-yellow-400 arcade-glow-yellow'
                  : countdown === 2
                  ? 'text-6xl sm:text-7xl text-cyan-400 arcade-glow-cyan'
                  : 'text-6xl sm:text-7xl text-pink-500 arcade-glow-pink'
              }`}
            >
              {countdown === 0 ? 'GO!' : countdown}
            </div>
            <p className="text-sm font-retro text-slate-300 mt-5 tracking-widest">
              {countdown === 0 ? 'CHOMP THE FOOD!' : 'GET READY TO SLITHER!'}
            </p>
          </div>
        </div>
      )}

      {/* 3. Overlay for Pause */}
      {isPaused && !isGameOver && hasGameStarted && countdown === null && (
        <div id="pause-overlay" className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center text-white z-10 transition-all">
          <div className="text-2xl sm:text-3xl font-arcade tracking-widest text-yellow-400 arcade-glow-yellow mb-3 animate-pulse">
            PAUSED
          </div>
          <p className="text-cyan-300 text-sm font-retro tracking-widest">PRESS SPACEBAR TO RESUME</p>
        </div>
      )}
    </div>
  );
};
