// src/components/TierComponents.tsx
import React from 'react';
import { Star } from 'lucide-react';
import { getTierConfig } from '@/lib/tierUtils';

interface TierBadgeProps {
  tier: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * A badge that displays the tier letter with appropriate styling
 */
export const TierBadge: React.FC<TierBadgeProps> = ({
  tier,
  size = 'md',
  className = ''
}) => {
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
};

interface TierLabelProps {
  tier: string;
  showName?: boolean;
  className?: string;
}

/**
 * A label that displays the tier name with appropriate styling
 */
export const TierLabel: React.FC<TierLabelProps> = ({
  tier,
  showName = true,
  className = ''
}) => {
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
};

interface TierStarsProps {
  tier: string;
  size?: number;
  className?: string;
}

/**
 * Stars that represent the tier rating
 */
export const TierStars: React.FC<TierStarsProps> = ({
  tier,
  size = 16,
  className = ''
}) => {
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
};

interface TierCardProps {
  tier: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * A card with tier-appropriate styling
 */
export const TierCard: React.FC<TierCardProps> = ({
  tier,
  children,
  className = ''
}) => {
  const config = getTierConfig(tier);

  return (
    <div className={`card p-4 ${config.containerClass} ${config.glow} ${className}`}>
      {children}
    </div>
  );
};

/**
 * Component that shows all tiers for reference
 */
export const TierReferenceGuide: React.FC = () => {
  const tiers = ['S', 'A', 'B', 'C', 'D', 'X'];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-100 mb-3">Bird Tiers</h2>

      <div className="grid gap-3">
        {tiers.map(tier => {
          const config = getTierConfig(tier);
          return (
            <div key={tier} className="card p-3 flex items-center gap-3">
              <TierBadge tier={tier} />

              <div className="flex-grow">
                <div className="flex justify-between items-center">
                  <span className={`font-bold ${config.textColor}`}>{config.name}</span>
                  <span className="text-xs text-gray-300 bg-black/30 px-2 py-0.5 rounded-full">
                    {tier === 'S' ? '5.0%' :
                     tier === 'A' ? '14.8%' :
                     tier === 'B' ? '31.9%' :
                     tier === 'C' ? '29.3%' :
                     tier === 'D' ? '18.9%' :
                     'Unknown'}
                  </span>
                </div>

                <TierStars tier={tier} className="mt-1" />
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-sm text-gray-400 text-center">
        Rarity represents observed frequency of birds in the wild.
      </p>
    </div>
  );
};