// src/lib/tierUtils.tsx - Updated to match design system
import { Star } from 'lucide-react';
import React from 'react';

export interface TierConfig {
  name: string;
  textColor: string;
  bgGradient: string;
  badgeClass: string;
  borderColor: string;
  stars: number;
  confettiCount: number;
  containerClass: string;
  nameClass: string;
  title: string;
  glow: string;
}

export function getTierConfig(tier: string): TierConfig {
  switch(tier) {
    case 'S': return {
      name: "LEGENDARY",
      stars: 5,
      textColor: "text-yellow-300",
      bgGradient: "from-yellow-400 via-amber-300 to-yellow-500",
      badgeClass: "border-yellow-500",
      borderColor: "border-yellow-500",
      confettiCount: 100,
      containerClass: "bg-gradient-to-br from-yellow-900 via-amber-800 to-yellow-900",
      nameClass: "bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-amber-300",
      title: "LEGENDARY",
      glow: "shadow-[0_0_15px_5px_rgba(250,204,21,0.5)]"
    };
    case 'A': return {
      name: "EPIC",
      stars: 4,
      textColor: "text-purple-300",
      bgGradient: "from-purple-500 via-fuchsia-500 to-purple-600",
      badgeClass: "border-purple-500",
      borderColor: "border-purple-500",
      confettiCount: 50,
      containerClass: "bg-gradient-to-br from-purple-900 via-purple-800 to-fuchsia-900",
      nameClass: "bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-fuchsia-300",
      title: "EPIC",
      glow: "shadow-[0_0_12px_4px_rgba(192,132,252,0.5)]"
    };
    case 'B': return {
      name: "RARE",
      stars: 3,
      textColor: "text-blue-300",
      bgGradient: "from-blue-500 via-cyan-500 to-blue-600",
      badgeClass: "border-blue-500",
      borderColor: "border-blue-500",
      confettiCount: 20,
      containerClass: "bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-900",
      nameClass: "bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-cyan-300",
      title: "RARE",
      glow: "shadow-[0_0_10px_3px_rgba(96,165,250,0.4)]"
    };
    case 'C': return {
      name: "UNCOMMON",
      stars: 2,
      textColor: "text-emerald-300",
      bgGradient: "from-emerald-500 via-green-500 to-emerald-600",
      badgeClass: "border-emerald-500",
      borderColor: "border-emerald-500",
      confettiCount: 10,
      containerClass: "bg-gradient-to-br from-emerald-900 via-emerald-800 to-green-900",
      nameClass: "bg-clip-text text-transparent bg-gradient-to-r from-emerald-300 to-green-300",
      title: "UNCOMMON",
      glow: "shadow-[0_0_8px_2px_rgba(52,211,153,0.4)]"
    };
    case 'X': return {
      name: "UNKNOWN",
      stars: 0,
      textColor: "text-gray-300",
      bgGradient: "from-gray-600 to-gray-700",
      badgeClass: "border-gray-500",
      borderColor: "border-gray-500",
      confettiCount: 0,
      containerClass: "bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800",
      nameClass: "bg-clip-text text-transparent bg-gradient-to-r from-gray-300 to-gray-200",
      title: "UNKNOWN",
      glow: "shadow-md"
    };
    default: return { // D Tier
      name: "COMMON",
      stars: 1,
      textColor: "text-gray-200",
      bgGradient: "from-gray-500 via-slate-500 to-gray-600",
      badgeClass: "border-gray-500",
      borderColor: "border-gray-500",
      confettiCount: 0,
      containerClass: "bg-gradient-to-br from-gray-800 via-gray-700 to-slate-800",
      nameClass: "bg-clip-text text-transparent bg-gradient-to-r from-gray-300 to-gray-100",
      title: "COMMON",
      glow: "shadow-md"
    };
  }
}

// Renamed from renderStars to TierStars and made it a React component
export function TierStars({ tier, size = 16, className = "" }: { tier: string, size?: number, className?: string }) {
  const config = getTierConfig(tier);
  const tierColorMap = {
    'S': 'text-yellow-400',
    'A': 'text-purple-400',
    'B': 'text-blue-400',
    'C': 'text-emerald-400',
    'D': 'text-gray-400',
    'X': 'text-gray-400'
  };
  const tierColor = tierColorMap[tier as keyof typeof tierColorMap] || 'text-gray-400';

  return (
    <div className={`flex gap-[2px] ${className}`}>
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={size}
          fill={i < config.stars ? "currentColor" : "none"}
          stroke={i < config.stars ? "none" : "currentColor"}
          strokeWidth={1.5}
          className={i < config.stars ? tierColor : "text-gray-600"}
        />
      ))}
    </div>
  );
}

// Keep the legacy function for backwards compatibility
export function renderStars(tier: string, size: number = 16) {
  const config = getTierConfig(tier);
  const tierColorMap = {
    'S': 'text-yellow-400',
    'A': 'text-purple-400',
    'B': 'text-blue-400',
    'C': 'text-emerald-400',
    'D': 'text-gray-400',
    'X': 'text-gray-400'
  };
  const tierColor = tierColorMap[tier as keyof typeof tierColorMap] || 'text-gray-400';

  return (
    <div className="flex gap-[2px]">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={size}
          fill={i < config.stars ? "currentColor" : "none"}
          stroke={i < config.stars ? "none" : "currentColor"}
          strokeWidth={1.5}
          className={i < config.stars ? tierColor : "text-gray-600"}
        />
      ))}
    </div>
  );
}

// Utility function for tier badges
export function TierBadge({ tier, size = 'md', className = "" }: { tier: string, size?: 'sm' | 'md' | 'lg', className?: string }) {
  const config = getTierConfig(tier);
  const sizeClasses = {
    'sm': 'w-6 h-6 text-xs',
    'md': 'w-8 h-8 text-sm',
    'lg': 'w-10 h-10 text-base'
  };

  return (
    <div
      className={`${sizeClasses[size]} flex-shrink-0 rounded-md bg-gradient-to-br ${config.bgGradient} 
                 flex items-center justify-center text-white font-bold shadow-lg border border-white/20 ${className}`}
      title={`${config.name} Tier`}
    >
      {tier}
    </div>
  );
}

// Helper function for tier content sections
export function TierContentBg({ tier, children, className = '' }: {
  tier: string,
  children: React.ReactNode,
  className?: string
}) {
  const config = getTierConfig(tier);

  return (
    <div className={`${config.containerClass} ${className} p-4 rounded-lg ${config.glow}`}>
      {children}
    </div>
  );
}

// New component for tier labels
export function TierLabel({ tier, showName = true, className = '' }: {
  tier: string,
  showName?: boolean,
  className?: string
}) {
  const config = getTierConfig(tier);

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className={`font-bold ${config.textColor}`}>
        {tier}
      </span>
      {showName && (
        <span className="text-sm text-gray-300">
          ({config.name})
        </span>
      )}
    </div>
  );
}