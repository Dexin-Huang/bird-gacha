// src/components/GachaPullAnimation.tsx
import React, { useEffect, useState } from 'react';
// Removed Camera import as it was unused

/**
 * Simplified, brighter gacha pull animation with dynamic color-cycling gradient background.
 * Focuses on a large central element and vibrant effects.
 * No orbiting stars. Random color changes for the background glow effect.
 */
const GachaPullAnimation: React.FC = () => {
  const [particles, setParticles] = useState<
    Array<{
      id: number;
      x: number;
      y: number;
      size: number;
      color: string;
      speed: number;
      angle: number;
    }>
  >([]);

  // Generate random particles for background effect
  useEffect(() => {
    const particleCount = 60; // More particles for more visual noise
    const brightColors = [
      '#fde047', // yellow-300
      '#a78bfa', // violet-400
      '#67e8f9', // cyan-300
      '#f472b6', // pink-400
      '#f87171', // red-400
      '#34d399', // emerald-400
      '#60a5fa', // blue-400
    ];

    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 6 + 3,
      color: brightColors[Math.floor(Math.random() * brightColors.length)],
      speed: Math.random() * 3 + 1,
      angle: Math.random() * 360,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 overflow-hidden bg-gray-950 animated-gradient-bg">
      {/* Background particles layer */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              backgroundColor: particle.color,
              opacity: 0.8,
              transform: `rotate(${particle.angle}deg)`,
              animation: `float ${particle.speed}s ease-in-out infinite alternate`,
              filter: 'blur(1px)',
            }}
          />
        ))}
      </div>

      {/* Center content (Spinner) */}
      <div className="relative z-20 flex flex-col items-center">
        <div
          className="relative w-40 h-40 mb-12 animate-spin"
          style={{ animationDuration: '3s' }}
        >
          <div
            className="absolute inset-4 rounded-full border-8 border-white/20 border-t-white/70 animate-spin"
            style={{ animationDuration: '2s', animationDirection: 'reverse' }}
          />
          <div
            className="absolute inset-0 rounded-full border-8 border-yellow-300/50 border-t-yellow-300 animate-spin"
            style={{ animationDuration: '1.5s' }}
          />
          <div className="absolute inset-10 flex items-center justify-center rounded-full bg-gray-900/50 backdrop-blur-sm" />
        </div>
      </div>

      {/* Loading text */}
      <div className="text-center mt-8 z-20">
        <p className="text-4xl md:text-5xl font-black text-white mb-4 animate-pulse">
          PULLING RESULTS...
        </p>
      </div>

      {/* Global styles for animations */}
      <style jsx global>{`
        @keyframes float {
          0% {
            transform: translate(0, 0) rotate(0deg);
            opacity: 0.8;
          }
          50% {
            transform: translate(15px, 15px) rotate(10deg);
            opacity: 1;
          }
          100% {
            transform: translate(0, 0) rotate(0deg);
            opacity: 0.8;
          }
        }

        @keyframes simple-bright-color-cycle {
          0% {
            background-color: #fde047;
          }
          20% {
            background-color: #f87171;
          }
          40% {
            background-color: #60a5fa;
          }
          60% {
            background-color: #34d399;
          }
          80% {
            background-color: #a78bfa;
          }
          100% {
            background-color: #fde047;
          }
        }

        .animated-gradient-bg {
          animation: simple-bright-color-cycle 8s linear infinite alternate;
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.6;
          }
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default GachaPullAnimation;
