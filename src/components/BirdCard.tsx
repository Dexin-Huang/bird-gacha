// src/components/BirdCard.tsx
import React from 'react';
import Image from 'next/image';
import { renderStars, TierBadge } from '@/lib/tierUtils';
import { formatDistanceToNow } from 'date-fns';

interface BirdCardProps {
  species: string;
  tier: string;
  imageUrl: string;
  capturedAt: string;
  onClick?: () => void;
}

const BirdCard: React.FC<BirdCardProps> = ({
  species,
  tier,
  imageUrl,
  capturedAt,
  onClick,
}) => {
  // Tier-specific effects
  const isSuperRare = tier === 'S' || tier === 'A';
  const formattedSpecies = species.replace(/_/g, ' ');
  const captureDate = new Date(capturedAt);
  const timeAgo = formatDistanceToNow(captureDate, { addSuffix: true });

  return (
    <div
      className={`
        card p-0 overflow-hidden transition-all duration-300 transform hover:scale-[1.02]
        ${isSuperRare ? 'hover:shadow-lg' : ''}
        ${tier === 'S' ? 'shadow-[0_0_15px_5px_rgba(250,204,21,0.25)]' : ''}
      `}
      onClick={onClick}
    >
      {/* Card image with tier badge */}
      <div className="relative aspect-square overflow-hidden bg-gray-800">
        <Image
          src={imageUrl}
          alt={formattedSpecies}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
          className="object-cover transition-transform duration-500 hover:scale-105"
        />

        {/* Position the tier badge on the image */}
        <div className="absolute top-2 right-2">
          <TierBadge tier={tier} size="sm" />
        </div>

        {/* Special shine effect for S/A tier */}
        {isSuperRare && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 animate-shine" />
        )}
      </div>

      {/* Card content */}
      <div className="p-3">
        <h3
          className="font-semibold text-gray-100 capitalize truncate"
          title={formattedSpecies}
        >
          {formattedSpecies}
        </h3>

        <div className="mt-1 flex justify-between items-center">
          {renderStars(tier)}
          <span
            className="text-xs text-gray-400 whitespace-nowrap"
            title={captureDate.toLocaleDateString()}
          >
            {timeAgo}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BirdCard;
