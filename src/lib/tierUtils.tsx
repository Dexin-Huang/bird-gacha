// src/lib/tierUtils.ts
import { Star } from 'lucide-react';
import React from 'react';

export interface TierConfig {
  name: string;
  textColor: string;
  bgGradient: string;
  badgeClass: string;
  borderColor?: string;
  stars: number;
  confettiCount?: number;
  containerClass?: string;
  nameClass?: string;
  title?: string;
}

export function getTierConfig(tier: string): TierConfig {
  switch(tier) {
    case 'S': return {
      name: "LEGENDARY",
      stars: 5,
      textColor: "text-yellow-300",
      bgGradient: "from-yellow-500 to-orange-500",
      badgeClass: "from-yellow-500 to-orange-500",
      borderColor: "border-yellow-500",
      confettiCount: 100,
      containerClass: "bg-gradient-to-br from-yellow-900 via-orange-700 to-amber-600",
      nameClass: "bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-orange-300",
      title: "LEGENDARY"
    };
    case 'A': return {
      name: "EPIC",
      stars: 4,
      textColor: "text-purple-300",
      bgGradient: "from-purple-600 to-pink-500",
      badgeClass: "from-purple-600 to-pink-500",
      borderColor: "border-purple-500",
      confettiCount: 50,
      containerClass: "bg-gradient-to-br from-purple-900 via-purple-700 to-fuchsia-800",
      nameClass: "bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-pink-300",
      title: "EPIC"
    };
    case 'B': return {
      name: "RARE",
      stars: 3,
      textColor: "text-blue-300",
      bgGradient: "from-blue-500 to-sky-400",
      badgeClass: "from-blue-500 to-sky-400",
      borderColor: "border-blue-500",
      confettiCount: 20,
      containerClass: "bg-gradient-to-br from-blue-900 via-blue-700 to-sky-800",
      nameClass: "bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-sky-300",
      title: "RARE"
    };
    case 'C': return {
      name: "UNCOMMON",
      stars: 2,
      textColor: "text-green-300",
      bgGradient: "from-green-500 to-lime-500",
      badgeClass: "from-green-500 to-lime-500",
      borderColor: "border-green-500",
      confettiCount: 10,
      containerClass: "bg-gradient-to-br from-green-900 via-green-700 to-lime-800",
      nameClass: "bg-clip-text text-transparent bg-gradient-to-r from-green-300 to-lime-300",
      title: "UNCOMMON"
    };
    case 'X': return {
      name: "UNKNOWN",
      stars: 0,
      textColor: "text-gray-400",
      bgGradient: "from-gray-600 to-gray-500",
      badgeClass: "from-gray-600 to-gray-500",
      borderColor: "border-gray-500",
      confettiCount: 0,
      containerClass: "bg-gradient-to-br from-gray-700 via-gray-600 to-gray-700",
      nameClass: "bg-clip-text text-transparent bg-gradient-to-r from-gray-400 to-gray-300",
      title: "UNKNOWN"
    };
    default: return { // D Tier
      name: "COMMON",
      stars: 1,
      textColor: "text-gray-400",
      bgGradient: "from-gray-500 to-gray-400",
      badgeClass: "from-gray-500 to-gray-400",
      borderColor: "border-gray-500",
      confettiCount: 0,
      containerClass: "bg-gradient-to-br from-gray-800 via-gray-700 to-slate-800",
      nameClass: "bg-clip-text text-transparent bg-gradient-to-r from-gray-300 to-gray-100",
      title: "COMMON"
    };
  }
}

export function renderStars(tier: string, size: number = 16) {
  const config = getTierConfig(tier);
  return (
    <div className="flex gap-[2px]">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={size}
          fill={i < config.stars ? "currentColor" : "none"}
          stroke={i < config.stars ? "none" : "currentColor"}
          strokeWidth={1.5}
          className={i < config.stars ? "text-yellow-400" : "text-gray-500"}
        />
      ))}
    </div>
  );
}