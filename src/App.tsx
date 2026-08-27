/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { GameStats } from './components/GameStats';
import { GameBoard } from './components/GameBoard';
import { ControlsPad } from './components/ControlsPad';
import { SettingsBar } from './components/SettingsBar';
import { HowToPlay } from './components/HowToPlay';
import { LeaderboardModal } from './components/LeaderboardModal';
import { GameOverModal } from './components/GameOverModal';
import { PacmanSnakeLogo } from './components/PacmanSnakeLogo';
import { Position, Direction, GameMode, Food, Obstacle, LeaderboardEntry, ThemeName, FoodType } from './types';
import { THEMES } from './utils/themes';
import { sound } from './utils/audio';
import { Trophy } from 'lucide-react';

const GRID_SIZE = 20;

export default function App() {
  // Game Configuration State
  const [mode, setMode] = useState<GameMode>('classic');
  const [speedLevel, setSpeedLevel] = useState<number>(5);
  const [themeId, setThemeId] = useState<ThemeName>('cyber-neon');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [playerName, setPlayerName] = useState<string>(() => {
    return localStorage.getItem('snake_player_name') || '';
  });

  // Game Engine State
  const [snake, setSnake] = useState<Position[]>([
    { x: 10, y: 10 },
    { x: 10, y: 11 },
    { x: 10, y: 12 },
  ]);
  const [direction, setDirection] = useState<Direction>('UP');
  const nextDirectionRef = useRef<Direction>('UP');

  const [food, setFood] = useState<Food | null>(null);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    return Number(localStorage.getItem('snake_high_score') || 0);
  });
  const [combo, setCombo] = useState<number>(1);
  const lastEatTimeRef = useRef<number>(0);
  const [gameTime, setGameTime] = useState<number>(0);

  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isNewHigh, setIsNewHigh] = useState<boolean>(false);
  const [isIceActive, setIsIceActive] = useState<boolean>(false);

  // Start Screen & 3-Second Countdown State
  const [hasGameStarted, setHasGameStarted] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const countdownTimerRef = useRef<number | null>(null);
  const iceTimerRef = useRef<number | null>(null);
  const lastMovedDirectionRef = useRef<Direction>('UP');
  const directionQueueRef = useRef<Direction[]>([]);

  // Leaderboard Modal State
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(() => {
    try {
      const saved = localStorage.getItem('snake_leaderboard');
      if (!saved) return [];
      const parsed: LeaderboardEntry[] = JSON.parse(saved);
      // Ensure unique IDs in case duplicates were previously stored
      const seen = new Set<string>();
      return parsed.map((item, idx) => {
        const id = item.id && !seen.has(item.id) ? item.id : `${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 9)}`;
        seen.add(id);
        return { ...item, id };
      });
    } catch {
      return [];
    }
  });

  // Current Theme object
  const currentTheme = THEMES.find((t) => t.id === themeId) || THEMES[0];

  // Sound sync
  useEffect(() => {
    sound.enabled = soundEnabled;
  }, [soundEnabled]);

  // Persist Player Name
  useEffect(() => {
    localStorage.setItem('snake_player_name', playerName);
  }, [playerName]);

  // Clean up countdown timer on unmount
  useEffect(() => {
    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    };
  }, []);

  // Generate random Position not on snake or obstacles safely without infinite loops
  const getRandomPosition = useCallback((currentSnake: Position[], currentObstacles: Obstacle[]): Position => {
    const occupied = new Set<string>();
    for (let i = 0; i < currentSnake.length; i++) {
      occupied.add(`${currentSnake[i].x},${currentSnake[i].y}`);
    }
    for (let i = 0; i < currentObstacles.length; i++) {
      occupied.add(`${currentObstacles[i].x},${currentObstacles[i].y}`);
    }

    const available: Position[] = [];
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let y = 0; y < GRID_SIZE; y++) {
        if (!occupied.has(`${x},${y}`)) {
          available.push({ x, y });
        }
      }
    }

    if (available.length === 0) {
      return { x: 0, y: 0 };
    }
    return available[Math.floor(Math.random() * available.length)];
  }, []);

  // Spawn Food
  const spawnFood = useCallback((currentSnake: Position[], currentObstacles: Obstacle[]) => {
    const pos = getRandomPosition(currentSnake, currentObstacles);
    const rand = Math.random();
    let type: FoodType = 'normal';
    let points = 10;
    let expiresAt: number | undefined;

    if (rand < 0.15) {
      type = 'golden';
      points = 50;
      expiresAt = Date.now() + 8000; // 8 seconds to grab
    } else if (rand < 0.28) {
      type = 'ice';
      points = 25;
    }

    setFood({
      position: pos,
      type,
      points,
      expiresAt,
    });
  }, [getRandomPosition]);

  // Generate Obstacles based on mode
  const initObstacles = useCallback((currentSnake: Position[]): Obstacle[] => {
    if (mode !== 'obstacles') return [];
    const obsList: Obstacle[] = [];
    const count = 8;
    for (let i = 0; i < count; i++) {
      let valid = false;
      let attempts = 0;
      while (!valid && attempts < 100) {
        attempts++;
        const ox = Math.floor(Math.random() * (GRID_SIZE - 4)) + 2;
        const oy = Math.floor(Math.random() * (GRID_SIZE - 4)) + 2;
        const hitSnake = currentSnake.some((s) => Math.abs(s.x - ox) <= 2 && Math.abs(s.y - oy) <= 2);
        const hitExisting = obsList.some((o) => o.x === ox && o.y === oy);
        if (!hitSnake && !hitExisting) {
          obsList.push({ x: ox, y: oy });
          valid = true;
        }
      }
    }
    return obsList;
  }, [mode]);

  // Initialize board setup without starting movement immediately
  const setupInitialBoard = useCallback(() => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    if (iceTimerRef.current) {
      clearTimeout(iceTimerRef.current);
      iceTimerRef.current = null;
    }
    directionQueueRef.current = [];
    lastMovedDirectionRef.current = 'UP';

    const initialSnake = [
      { x: 10, y: 10 },
      { x: 10, y: 11 },
      { x: 10, y: 12 },
    ];
    setSnake(initialSnake);
    setDirection('UP');
    nextDirectionRef.current = 'UP';
    setScore(0);
    setCombo(1);
    setGameTime(0);
    setIsPaused(false);
    setIsGameOver(false);
    setIsNewHigh(false);
    setIsIceActive(false);
    setCountdown(null);
    setHasGameStarted(false);

    const newObs = initObstacles(initialSnake);
    setObstacles(newObs);
    spawnFood(initialSnake, newObs);
  }, [initObstacles, spawnFood]);

  // Start game with 3-second countdown (3 -> 2 -> 1 -> GO!)
  const startGameWithCountdown = useCallback(() => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    if (iceTimerRef.current) {
      clearTimeout(iceTimerRef.current);
      iceTimerRef.current = null;
    }
    directionQueueRef.current = [];
    lastMovedDirectionRef.current = 'UP';

    const initialSnake = [
      { x: 10, y: 10 },
      { x: 10, y: 11 },
      { x: 10, y: 12 },
    ];
    setSnake(initialSnake);
    setDirection('UP');
    nextDirectionRef.current = 'UP';
    setScore(0);
    setCombo(1);
    setGameTime(0);
    setIsPaused(false);
    setIsGameOver(false);
    setIsNewHigh(false);
    setIsIceActive(false);

    const newObs = initObstacles(initialSnake);
    setObstacles(newObs);
    spawnFood(initialSnake, newObs);

    // Trigger Countdown sequence
    setCountdown(3);
    sound.playCountdownTick();

    let count = 3;
    countdownTimerRef.current = window.setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
        sound.playCountdownTick();
      } else if (count === 0) {
        setCountdown(0); // Display "GO!"
        sound.playCountdownGo();
      } else {
        if (countdownTimerRef.current) {
          clearInterval(countdownTimerRef.current);
          countdownTimerRef.current = null;
        }
        setCountdown(null);
        setHasGameStarted(true);
      }
    }, 1000);
  }, [initObstacles, spawnFood]);

  // Initialize board on mount
  useEffect(() => {
    setupInitialBoard();
  }, [setupInitialBoard]);

  // Clean up all timers on unmount
  useEffect(() => {
    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      if (iceTimerRef.current) clearTimeout(iceTimerRef.current);
    };
  }, []);

  // Timer interval for Game Time
  useEffect(() => {
    if (!hasGameStarted || isPaused || isGameOver || countdown !== null) return;
    const timer = setInterval(() => {
      setGameTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [hasGameStarted, isPaused, isGameOver, countdown]);

  // Direction Change Handler (Prevent 180-degree instant suicide & queue moves)
  const isOpposite = (dirA: Direction, dirB: Direction): boolean => {
    return (
      (dirA === 'UP' && dirB === 'DOWN') ||
      (dirA === 'DOWN' && dirB === 'UP') ||
      (dirA === 'LEFT' && dirB === 'RIGHT') ||
      (dirA === 'RIGHT' && dirB === 'LEFT')
    );
  };

  const handleDirectionChange = useCallback((newDir: Direction) => {
    if (!hasGameStarted || countdown !== null) return;
    
    // Determine what direction we are currently heading towards
    const lastPending = directionQueueRef.current.length > 0
      ? directionQueueRef.current[directionQueueRef.current.length - 1]
      : lastMovedDirectionRef.current;

    if (newDir === lastPending || isOpposite(newDir, lastPending)) {
      return;
    }

    if (directionQueueRef.current.length < 2) {
      directionQueueRef.current.push(newDir);
    }
    nextDirectionRef.current = newDir;
    setDirection(newDir);
  }, [hasGameStarted, countdown]);

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not capture keyboard events if the user is typing into an input, textarea, or select element
      if (e.target instanceof HTMLElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
        return;
      }

      // Prevent page scrolling on arrows or space
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      // Handle Start Game from keyboard when on start screen
      if (!hasGameStarted && !isGameOver && countdown === null) {
        if (e.key === ' ' || e.code === 'Space' || e.key === 'Enter') {
          sound.playClick();
          startGameWithCountdown();
          return;
        }
      }

      if (e.key === ' ' || e.code === 'Space') {
        if (hasGameStarted && !isGameOver && countdown === null) {
          setIsPaused((p) => !p);
          sound.playClick();
        }
        return;
      }

      if (e.key === 'Enter') {
        sound.playClick();
        startGameWithCountdown();
        return;
      }

      if (!hasGameStarted || isPaused || isGameOver || countdown !== null) return;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          handleDirectionChange('UP');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          handleDirectionChange('DOWN');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          handleDirectionChange('LEFT');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          handleDirectionChange('RIGHT');
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDirectionChange, hasGameStarted, isPaused, isGameOver, countdown, startGameWithCountdown]);

  // Handle Game Over
  const triggerGameOver = useCallback((finalScore: number, finalLength: number) => {
    setIsGameOver(true);
    sound.playGameOver();

    // Check High Score
    let isHigh = false;
    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem('snake_high_score', finalScore.toString());
      isHigh = true;
      setIsNewHigh(true);
    }

    // Save to Leaderboard if score > 0
    if (finalScore > 0) {
      const uniqueId = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

      const newEntry: LeaderboardEntry = {
        id: uniqueId,
        playerName: playerName.trim() || 'Player 1',
        score: finalScore,
        mode,
        date: new Date().toLocaleDateString('th-TH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        snakeLength: finalLength,
      };

      setLeaderboard((prev) => {
        const updated = [...prev, newEntry].sort((a, b) => b.score - a.score).slice(0, 10);
        localStorage.setItem('snake_leaderboard', JSON.stringify(updated));
        return updated;
      });
    }
  }, [highScore, mode, playerName]);

  // Main Game Tick Loop
  useEffect(() => {
    if (!hasGameStarted || isPaused || isGameOver || countdown !== null) return;

    // Calculate current speed
    // Base: 160ms - (speedLevel * 9ms). Min 40ms.
    let delay = Math.max(40, 160 - speedLevel * 9);
    if (mode === 'speed') {
      delay = Math.max(35, delay - Math.floor(score / 30) * 4);
    }
    if (isIceActive) {
      delay = delay * 1.6; // Slow motion
    }

    const interval = setInterval(() => {
      setSnake((prevSnake) => {
        // Dequeue next direction if queued
        let currentDir = nextDirectionRef.current;
        if (directionQueueRef.current.length > 0) {
          currentDir = directionQueueRef.current.shift()!;
          nextDirectionRef.current = currentDir;
          setDirection(currentDir);
        }
        lastMovedDirectionRef.current = currentDir;

        const head = { ...prevSnake[0] };

        if (currentDir === 'UP') head.y -= 1;
        if (currentDir === 'DOWN') head.y += 1;
        if (currentDir === 'LEFT') head.x -= 1;
        if (currentDir === 'RIGHT') head.x += 1;

        // Check Wall Collision
        if (mode === 'portal') {
          // Pac-man style wrap around
          if (head.x < 0) head.x = GRID_SIZE - 1;
          if (head.x >= GRID_SIZE) head.x = 0;
          if (head.y < 0) head.y = GRID_SIZE - 1;
          if (head.y >= GRID_SIZE) head.y = 0;
        } else {
          // Die on wall hit
          if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
            triggerGameOver(score, prevSnake.length);
            return prevSnake;
          }
        }

        // Check Self Collision
        const hitSelf = prevSnake.some((segment, idx) => idx !== 0 && segment.x === head.x && segment.y === head.y);
        if (hitSelf) {
          triggerGameOver(score, prevSnake.length);
          return prevSnake;
        }

        // Check Obstacle Collision
        const hitObstacle = obstacles.some((obs) => obs.x === head.x && obs.y === head.y);
        if (hitObstacle) {
          triggerGameOver(score, prevSnake.length);
          return prevSnake;
        }

        const newSnake = [head, ...prevSnake];

        // Check Food Eaten
        if (food && head.x === food.position.x && head.y === food.position.y) {
          // Calculate Combo
          const now = Date.now();
          let currentMultiplier = 1;
          if (now - lastEatTimeRef.current < 4500) {
            currentMultiplier = Math.min(5, combo + 1);
          }
          setCombo(currentMultiplier);
          lastEatTimeRef.current = now;

          const pointsEarned = food.points * currentMultiplier;
          setScore((s) => s + pointsEarned);

          // Audio
          if (food.type === 'golden') {
            sound.playSpecialEat();
          } else if (food.type === 'ice') {
            sound.playSpecialEat();
            setIsIceActive(true);
            if (iceTimerRef.current) clearTimeout(iceTimerRef.current);
            iceTimerRef.current = window.setTimeout(() => setIsIceActive(false), 5000); // 5 sec slow-mo
          } else {
            sound.playEat();
          }

          // Spawn next food
          spawnFood(newSnake, obstacles);
        } else {
          // Normal move: remove tail
          newSnake.pop();
        }

        return newSnake;
      });
    }, delay);

    return () => clearInterval(interval);
  }, [hasGameStarted, isPaused, isGameOver, countdown, speedLevel, mode, score, isIceActive, food, obstacles, combo, spawnFood, triggerGameOver]);

  return (
    <div className="min-h-screen bg-[#030712] arcade-crt-grid text-slate-100 selection:bg-yellow-400 selection:text-black p-3 sm:p-6 flex flex-col items-center justify-between">
      {/* Top Main Container */}
      <div className="w-full max-w-6xl flex flex-col items-center gap-4">
        {/* Navigation / Header Title with PacmanSnakeLogo */}
        <header className="w-full flex items-center justify-between pb-3 border-b-2 border-cyan-500/40">
          <div className="flex items-center gap-3">
            <PacmanSnakeLogo size={46} className="shrink-0" />
            <div>
              <h1 className="text-lg sm:text-2xl font-arcade tracking-wide text-yellow-400 arcade-glow-yellow flex items-center gap-2">
                PAC-SNAKE <span className="text-[10px] sm:text-xs font-arcade text-cyan-400 arcade-glow-cyan px-2 py-0.5 rounded border border-cyan-400/60 bg-cyan-950/40">ARCADE</span>
              </h1>
              <p className="text-[11px] sm:text-xs font-retro tracking-widest text-cyan-300">
                RETRO 80s ARCADE &bull; PAC-MAN FEAST &bull; CHOMP &amp; SLITHER
              </p>
            </div>
          </div>

          <button
            id="btn-open-leaderboard"
            type="button"
            onClick={() => {
              sound.playClick();
              setIsLeaderboardOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-yellow-400/10 hover:bg-yellow-400/20 active:scale-95 text-yellow-300 border border-yellow-400/50 text-xs font-arcade tracking-wider flex items-center gap-2 shadow-[0_0_12px_rgba(250,204,21,0.2)] transition cursor-pointer"
          >
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span className="hidden sm:inline">HIGH</span> SCORES
          </button>
        </header>

        {/* Real-time Game Statistics Panel */}
        <GameStats
          score={score}
          highScore={highScore}
          snakeLength={snake.length}
          combo={combo}
          gameTime={gameTime}
          mode={mode}
          speedLevel={speedLevel}
        />

        {/* Central Game Area: Board & On-Screen Controls */}
        <main className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Canvas Section */}
          <div className="lg:col-span-6 flex flex-col items-center gap-3">
            <GameBoard
              gridSize={GRID_SIZE}
              snake={snake}
              direction={direction}
              food={food}
              obstacles={obstacles}
              theme={currentTheme}
              isPaused={isPaused}
              isGameOver={isGameOver}
              hasGameStarted={hasGameStarted}
              countdown={countdown}
              onStartGame={startGameWithCountdown}
              onDirectionChange={handleDirectionChange}
              ghostActive={isIceActive}
            />

            {/* Virtual Controls for Touch / Mobile */}
            <ControlsPad
              onDirectionChange={handleDirectionChange}
              isPaused={isPaused}
              isGameOver={isGameOver}
              hasGameStarted={hasGameStarted}
              countdown={countdown}
              onTogglePause={() => setIsPaused((p) => !p)}
              onRestart={startGameWithCountdown}
            />
          </div>

          {/* Right Section: Settings & How-to-play */}
          <div className="lg:col-span-6 flex flex-col gap-4 w-full">
            <SettingsBar
              mode={mode}
              onSelectMode={(m) => {
                setMode(m);
                setupInitialBoard();
                setHasGameStarted(false);
              }}
              speedLevel={speedLevel}
              onSpeedChange={setSpeedLevel}
              themeId={themeId}
              onThemeChange={setThemeId}
              soundEnabled={soundEnabled}
              onToggleSound={() => setSoundEnabled((s) => !s)}
              playerName={playerName}
              onPlayerNameChange={setPlayerName}
              disabled={!isGameOver && score > 0 && !isPaused}
            />

            {/* Embedded How-to-play instructions & rules */}
            <HowToPlay />
          </div>
        </main>
      </div>

      {/* Footer Branding & Assignment notes */}
      <footer className="w-full max-w-6xl text-center py-4 text-slate-500 text-xs border-t border-slate-900 mt-6">
        Retro Snake Web App &bull; Built with React, Tailwind CSS &amp; Web Audio API &bull; 100% Single Page &amp; Mobile Responsive
      </footer>

      {/* Modals */}
      <GameOverModal
        isOpen={isGameOver}
        score={score}
        highScore={highScore}
        isNewHigh={isNewHigh}
        snakeLength={snake.length}
        gameTime={gameTime}
        playerName={playerName}
        onRestart={startGameWithCountdown}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
      />

      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        entries={leaderboard}
        onClear={() => {
          setLeaderboard([]);
          localStorage.removeItem('snake_leaderboard');
        }}
      />
    </div>
  );
}
