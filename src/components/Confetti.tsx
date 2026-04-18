import { useState } from 'react';
import { useHighContrast } from '../hooks/useHighContrast';

const COLORS = [
  '#f59e0b', '#ef4444', '#3b82f6', '#10b981',
  '#8b5cf6', '#ec4899', '#f97316', '#06b6d4',
];

interface Piece {
  id: number;
  left: string;
  color: string;
  delay: string;
  duration: string;
  size: number;
  isRound: boolean;
  rotate: number;
}

function makeConfetti(): Piece[] {
  return Array.from({ length: 90 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    delay: `${Math.random() * 2.5}s`,
    duration: `${2.5 + Math.random() * 2}s`,
    size: 6 + Math.floor(Math.random() * 9),
    isRound: Math.random() > 0.5,
    rotate: Math.floor(Math.random() * 360),
  }));
}

export function Confetti() {
  const { highContrast } = useHighContrast();
  const [pieces] = useState(makeConfetti);

  // Confetti is disabled in high-contrast mode to avoid distracting animations
  if (highContrast) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
      aria-hidden="true"
      data-testid="confetti"
    >
      {pieces.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            top: '-20px',
            left: p.left,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: p.isRound ? '50%' : '2px',
            animation: `confetti-fall ${p.duration} ${p.delay} ease-in forwards`,
            transform: `rotate(${p.rotate}deg)`,
          }}
        />
      ))}
    </div>
  );
}
