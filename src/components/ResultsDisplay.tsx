"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { getTierConfig, renderStars } from '@/lib/tierUtils';

interface Props {
  species: string;
  tier: string;
  imageUrl?: string;
  onClose: () => void;
  onShare?: () => void;
}

const ResultsDisplay: React.FC<Props> = ({ species, tier, imageUrl, onClose, onShare }) => {
  const [revealed, setRevealed] = useState(false);
  const [confetti, setConfetti] = useState<Array<{ id: number; x: number; y: number; rotation: number; color: string; size: number; speed: number }>>([]);

  const config = getTierConfig(tier);
  const tierClass = `tier-${['S', 'A', 'B', 'C', 'D', 'X'].includes(tier) ? tier : 'unknown'}`;
  const isNotBird = species.toUpperCase() === 'NOT_BIRD';
  const isSuperRare = tier === 'S' || tier === 'A';

  useEffect(() => {
    const timeout = setTimeout(() => {
      setRevealed(true);
      if (isSuperRare && !isNotBird) {
        const pieces = config.confettiCount || 0;
        const newConfetti = Array.from({ length: pieces }, (_, i) => ({
          id: i,
          x: 50 + Math.random() * 40 - 20,
          y: 0,
          rotation: Math.random() * 360,
          color: ['#FFD700', '#FFA500', '#FF4500', '#FF6347', '#FFFFFF'][Math.floor(Math.random() * 5)],
          size: Math.random() * 10 + 5,
          speed: Math.random() * 3 + 2
        }));
        setConfetti(newConfetti);
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, [tier, isSuperRare, isNotBird, config.confettiCount]);

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm"
      onClick={revealed ? onClose : undefined}
    >
      {isSuperRare && revealed && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {confetti.map(piece => (
            <div
              key={piece.id}
              className="absolute animate-fall"
              style={{
                left: `${piece.x}%`,
                top: `${piece.y}%`,
                width: `${piece.size}px`,
                height: `${piece.size}px`,
                backgroundColor: piece.color,
                transform: `rotate(${piece.rotation}deg)`,
                animation: `fall ${piece.speed}s linear forwards`
              }}
            />
          ))}
        </div>
      )}

      <div
        className={`w-full max-w-sm rounded-xl shadow-2xl overflow-hidden transition-all duration-1000 ${
          revealed ? 'scale-100 opacity-100 rotate-0' : 'scale-75 opacity-90 rotate-y-180'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {revealed ? (
          <div className={`${tierClass} p-6 text-center relative overflow-hidden`}>
            {tier === 'S' && (
              <>
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-300/30 to-transparent animate-pulse" />
                <div
                  className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.8)_0,_rgba(255,255,255,0)_70%)] animate-ping"
                  style={{ animationDuration: '3s' }}
                />
              </>
            )}

            <button
              onClick={onClose}
              className="absolute top-2 right-2 text-inherit opacity-70 hover:opacity-100 text-2xl font-bold"
              aria-label="Close results"
            >
              &times;
            </button>

            {imageUrl && !isNotBird && (
              <div className={`relative mb-4 ${isSuperRare ? 'animate-bounce-small' : ''}`}>
                <Image
                  src={imageUrl}
                  alt={`Captured image of ${species}`}
                  fill
                  className={`object-cover rounded-lg shadow-lg border-4 ${config.badgeClass}`}
                />
                {isSuperRare && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 animate-shine" />}
              </div>
            )}

            {!isNotBird && (
              <div className={`mb-3 inline-block transform ${isSuperRare ? 'animate-pulse' : ''}`}> 
                <span className="text-sm font-medium uppercase tracking-wider">Rarity Tier</span>
                <p className={`text-6xl font-bold drop-shadow-lg ${
                  tier === 'S' ? 'text-yellow-300 animate-glow' :
                  tier === 'A' ? 'text-blue-300' : config.textColor
                }`}>{tier}</p>
              </div>
            )}

            <h2 className={`text-3xl font-bold capitalize mb-4 drop-shadow-md ${isNotBird ? 'mt-8' : ''}`}>
              {isNotBird ? 'No Bird Detected' : species.replace(/_/g, ' ')}
            </h2>

            {!isNotBird && <div className="flex justify-center mb-4">{renderStars(tier, 20)}</div>}

            <p className="text-lg mt-2 opacity-90">
              {isNotBird
                ? 'Please try capturing an image with a clear view of a bird.'
                : tier === 'S'
                ? 'Incredible! An extremely rare find!'
                : tier === 'A'
                ? 'Amazing! A very rare bird!'
                : tier === 'B'
                ? 'Great! An uncommon species!'
                : tier === 'C'
                ? 'Nice! A moderately common bird.'
                : tier === 'X'
                ? 'Interesting! A data deficient species!'
                : 'A common species, but still beautiful!'}
            </p>

            <div className="flex justify-center gap-3 mt-6">
              {onShare && (
                <button onClick={onShare} className="px-4 py-2 bg-blue-600/80 hover:bg-blue-700 text-white rounded-lg">
                  Share
                </button>
              )}
              <button onClick={onClose} className="px-4 py-2 bg-gray-600/80 hover:bg-gray-700 text-white rounded-lg">
                Continue
              </button>
            </div>

            <p className="text-xs opacity-70 mt-4">
              {!isNotBird && 'Added to your collection!'}
            </p>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-purple-600 to-blue-700 h-96 flex items-center justify-center">
            <div className="text-white text-2xl font-bold animate-pulse">Revealing...</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsDisplay;
