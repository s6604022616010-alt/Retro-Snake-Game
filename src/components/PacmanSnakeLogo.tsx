import React from 'react';

interface PacmanSnakeLogoProps {
  className?: string;
  size?: number;
}

export const PacmanSnakeLogo: React.FC<PacmanSnakeLogoProps> = ({
  className = '',
  size = 44,
}) => {
  return (
    <div
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
      title="Pac-Snake Arcade"
    >
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className="overflow-visible filter drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]"
      >
        {/* Glow backdrop circle */}
        <circle cx="50" cy="50" r="46" fill="#0f172a" stroke="#facc15" strokeWidth="3" className="stroke-yellow-400" />

        {/* Trail dots (Pac-man dots / snake food dots) */}
        <circle cx="78" cy="50" r="4.5" fill="#f43f5e" className="animate-pulse" />
        <circle cx="90" cy="50" r="3.5" fill="#38bdf8" />

        {/* Snake body coils behind Pac-Head */}
        <path
          d="M 20 62 C 14 55, 14 42, 24 35 C 32 30, 40 38, 48 42"
          fill="none"
          stroke="#22c55e"
          strokeWidth="11"
          strokeLinecap="round"
        />
        {/* Snake scales texture on coil */}
        <circle cx="20" cy="48" r="2.5" fill="#86efac" />
        <circle cx="32" cy="36" r="2.5" fill="#86efac" />

        {/* Pac-Snake Head (Pacman shape with chomp mouth and reptile eye + tongue) */}
        {/* Yellow chomping Pac-Head */}
        <path
          d="M 52 50 L 74 33 A 24 24 0 1 0 74 67 Z"
          fill="#facc15"
        />

        {/* Reptile snake eye with slit pupil inside pac head */}
        <circle cx="48" cy="37" r="4.5" fill="#ffffff" />
        <ellipse cx="48.5" cy="37" rx="1.8" ry="3.8" fill="#000000" />
        <circle cx="47.5" cy="35.5" r="1" fill="#ffffff" />

        {/* Cute Snake Forked Tongue flicking out from the Pac-mouth */}
        <path
          d="M 64 50 L 78 50 M 78 50 L 84 45 M 78 50 L 84 55"
          fill="none"
          stroke="#ef4444"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};
