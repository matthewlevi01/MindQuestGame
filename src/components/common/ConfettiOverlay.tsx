import React, { useEffect, useState } from 'react';

interface ConfettiOverlayProps {
  show: boolean;
  durationMs?: number;
  onComplete?: () => void;
}

interface ConfettiPiece {
  id: number;
  x: number; // percentage across screen 0-100
  color: string;
  size: number;
  delay: number;
  duration: number;
  rotation: number;
  shape: 'rect' | 'circle' | 'star';
}

const COLORS = [
  '#ffd400', // HAPPY
  '#7f27a8', // BAT
  '#53b0c9', // POND
  '#f76400', // JUICE
  '#c1008f', // HEART
  '#e885cf', // CHEEK
];

export const ConfettiOverlay: React.FC<ConfettiOverlayProps> = ({
  show,
  durationMs = 2800,
  onComplete,
}) => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (show) {
      // Generate 50 confetti pieces with staggered physics
      const newPieces: ConfettiPiece[] = Array.from({ length: 55 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: Math.random() * 10 + 8,
        delay: Math.random() * 0.4,
        duration: Math.random() * 1.5 + 1.2,
        rotation: Math.random() * 360,
        shape: i % 4 === 0 ? 'star' : i % 3 === 0 ? 'circle' : 'rect',
      }));
      setPieces(newPieces);

      const timer = setTimeout(() => {
        setPieces([]);
        if (onComplete) onComplete();
      }, durationMs);

      return () => clearTimeout(timer);
    } else {
      setPieces([]);
    }
  }, [show, durationMs, onComplete]);

  if (!show || pieces.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="absolute top-0 animate-confetti-fall"
          style={{
            left: `${p.x}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        >
          {p.shape === 'star' ? (
            <span
              style={{
                color: p.color,
                fontSize: `${p.size + 4}px`,
                transform: `rotate(${p.rotation}deg)`,
                display: 'inline-block',
              }}
            >
              ★
            </span>
          ) : p.shape === 'circle' ? (
            <div
              className="rounded-full shadow-xs"
              style={{
                width: `${p.size}px`,
                height: `${p.size}px`,
                backgroundColor: p.color,
                transform: `rotate(${p.rotation}deg)`,
              }}
            />
          ) : (
            <div
              className="rounded-xs shadow-xs"
              style={{
                width: `${p.size}px`,
                height: `${p.size * 1.5}px`,
                backgroundColor: p.color,
                transform: `rotate(${p.rotation}deg)`,
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
};
