"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { getTierConfig, renderStars } from "@/lib/tierUtils";
import { Share2, X } from "lucide-react";

interface Props {
  species: string;
  tier: string;
  imageUrl?: string;
  onClose: () => void;
  onShare?: () => void;
}

const ResultsDisplay: React.FC<Props> = ({
  species,
  tier,
  imageUrl,
  onClose,
  onShare,
}) => {
  const [revealed, setRevealed] = useState(false);
  const [confetti, setConfetti] = useState<
    Array<{
      id: number;
      x: number;
      y: number;
      rotation: number;
      color: string;
      size: number;
      speed: number;
    }>
  >([]);

  const config = getTierConfig(tier);
  const tierClass = `tier-${
    ["S", "A", "B", "C", "D", "X"].includes(tier) ? tier : "unknown"
  }`;
  const isNotBird = species.toUpperCase() === "NOT_BIRD";
  const isSuperRare = tier === "S" || tier === "A";

  /* ───────────  reveal + confetti  ─────────── */
  useEffect(() => {
    const timeout = setTimeout(() => {
      setRevealed(true);
      if (isSuperRare && !isNotBird) {
        // Create confetti pieces for S and A tiers
        const pieces = tier === "S" ? 100 : 50; // More for S-tier
        const colors = tier === "S" 
          ? ["#fef08a", "#facc15", "#f59e0b", "#fcd34d", "#FFFFFF"] // Yellow/gold colors
          : ["#d8b4fe", "#a855f7", "#c084fc", "#e9d5ff", "#FFFFFF"]; // Purple colors
          
        const newConfetti = Array.from({ length: pieces }, (_, i) => ({
          id: i,
          x: 50 + Math.random() * 40 - 20, // Around the center
          y: 0,
          rotation: Math.random() * 360,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 10 + 5,
          speed: Math.random() * 3 + 2,
        }));
        setConfetti(newConfetti);
      }
    }, 1000);
    return () => clearTimeout(timeout);
  }, [tier, isSuperRare, isNotBird]);

  /* ───────────  UI  ─────────── */
  return (
    <div
      className="modal-backdrop"
      onClick={revealed ? onClose : undefined}
    >
      {/* Confetti for S / A tiers */}
      {isSuperRare && revealed && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {confetti.map((piece) => (
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
                animation: `fall ${piece.speed}s linear forwards`,
              }}
            />
          ))}
        </div>
      )}

      {/* Result card */}
      <div
        className={`w-full max-w-sm rounded-xl shadow-2xl overflow-hidden transition-all duration-1000 ${
          revealed
            ? "scale-100 opacity-100 rotate-0"
            : "scale-75 opacity-90 rotate-y-180"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {revealed ? (
          <div
            className={`${tierClass} p-6 text-center relative overflow-hidden`}
          >
            {/* S-tier special effects */}
            {tier === "S" && (
              <>
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-300/30 to-transparent animate-pulse" />
                <div
                  className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.8)_0,_rgba(255,255,255,0)_70%)] animate-ping"
                  style={{ animationDuration: "3s" }}
                />
              </>
            )}

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-black/20 backdrop-blur-sm text-white/80 hover:text-white hover:bg-black/30 transition-colors"
              aria-label="Close results"
            >
              <X size={18} />
            </button>

            {/* Captured image */}
            {imageUrl && !isNotBird && (
              <div
                className={`relative mb-5 ${
                  isSuperRare ? "animate-bounce-small" : ""
                }`}
              >
                <Image
                  src={imageUrl}
                  alt={`Captured image of ${species}`}
                  width={512}
                  height={512}
                  unoptimized
                  className={`object-cover rounded-lg shadow-lg border-4 ${config.borderColor}`}
                />
                {isSuperRare && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 animate-shine" />
                )}
              </div>
            )}

            {/* Rarity header */}
            {!isNotBird && (
              <div
                className={`mb-3 inline-block transform ${
                  isSuperRare ? "animate-pulse" : ""
                }`}
              >
                <span className="text-sm font-medium uppercase tracking-wider">
                  Rarity Tier
                </span>
                <p
                  className={`text-6xl font-bold drop-shadow-lg ${
                    tier === "S"
                      ? "text-yellow-300 animate-glow"
                      : tier === "A"
                      ? config.textColor
                      : config.textColor
                  }`}
                >
                  {tier}
                </p>
              </div>
            )}

            {/* Species name */}
            <h2
              className={`text-3xl font-bold capitalize mb-4 drop-shadow-md ${
                isNotBird ? "mt-8" : ""
              }`}
            >
              {isNotBird ? "No Bird Detected" : species.replace(/_/g, " ")}
            </h2>

            {/* Stars */}
            {!isNotBird && (
              <div className="flex justify-center mb-4">
                {renderStars(tier, 20)}
              </div>
            )}

            {/* Description */}
            <p className="text-lg mt-2 opacity-90">
              {isNotBird
                ? "Please try capturing an image with a clear view of a bird."
                : tier === "S"
                ? "Incredible! An extremely rare find!"
                : tier === "A"
                ? "Amazing! A very rare bird!"
                : tier === "B"
                ? "Great! An uncommon species!"
                : tier === "C"
                ? "Nice! A moderately common bird."
                : tier === "X"
                ? "Interesting! A data deficient species!"
                : "A common species, but still beautiful!"}
            </p>

            {/* Buttons */}
            <div className="flex justify-center gap-3 mt-6">
              {onShare && (
                <button
                  onClick={onShare}
                  className="btn-secondary flex items-center gap-1.5"
                >
                  <Share2 size={18} />
                  <span>Share</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="btn-tertiary"
              >
                Continue
              </button>
            </div>

            <p className="text-xs opacity-70 mt-4">
              {!isNotBird && "Added to your collection!"}
            </p>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 h-96 flex items-center justify-center">
            <div className="text-white text-2xl font-bold animate-pulse">
              Revealing...
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsDisplay;