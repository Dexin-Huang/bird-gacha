// src/app/collection/page.tsx
"use client";
import React, { useState, useEffect } from 'react';
import { Filter, X, Star, Plus, Search } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useCollection } from '@/context/CollectionContext';
import { getTierConfig, TierBadge, TierStars } from '@/lib/tierUtils';

export default function CollectionPage() {
  // Collection data and state
  const { collection } = useCollection();
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  // Animation on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Sort collection by captured date (newest first) by default
  const sortedCollection = React.useMemo(() =>
    [...collection].sort((a, b) => new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime()),
    [collection]
  );

  // Filter and search collection
  const filteredCollection = React.useMemo(() => {
    // First apply tier filter
    let filtered = activeFilter
      ? sortedCollection.filter(bird => bird.tier === activeFilter)
      : sortedCollection;

    // Then apply search if present
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(bird =>
        bird.species.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [sortedCollection, activeFilter, searchQuery]);

  // Group birds by tier for statistics
  const stats = React.useMemo(() =>
    collection.reduce((acc, bird) => {
      acc[bird.tier] = (acc[bird.tier] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    [collection]
  );

  // Calculate completion percentage
  const uniqueSpecies = React.useMemo(() =>
    new Set(collection.map(bird => bird.species)).size,
    [collection]
  );
  const estimatedTotal = 100; // Placeholder for total possible species
  const completionPercentage = Math.min(100, Math.round((uniqueSpecies / estimatedTotal) * 100));

  // Tier order for consistency
  const sortedTiers = ['S', 'A', 'B', 'C', 'D'];

  return (
    <div className="min-h-screen flex flex-col pb-16" style={{ background: 'var(--page-background)' }}>
      {/* Main Content Area */}
      <main className="flex-grow container mx-auto px-4 pt-4">
        {/* Header with title and actions */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-100">Your Collection</h1>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg ${showFilters ? 'bg-indigo-600 text-white' : 'bg-gray-700/60 text-gray-300 hover:bg-gray-600/70'} transition-colors`}
              aria-label={showFilters ? "Hide filters" : "Show filters"}
            >
              <Filter size={20} />
            </button>

            <Link
              href="/capture"
              className="btn-secondary text-sm flex items-center gap-1.5 py-2"
            >
              <Plus size={18} />
              <span>Capture</span>
            </Link>
          </div>
        </div>

        {/* Collection Stats Card */}
        <section
          aria-labelledby="collection-stats-heading"
          className={`card mb-4 transition-all duration-500 transform ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}
        >
          <div className="p-4">
            <h2 id="collection-stats-heading" className="text-lg font-semibold mb-3 text-gray-100">Collection Progress</h2>
            <div className="flex justify-between mb-1 text-sm text-gray-300">
              <span>{uniqueSpecies} unique species</span>
              <span>{completionPercentage}% complete</span>
            </div>
            <div className="w-full bg-gray-600/50 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2.5 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${completionPercentage}%` }}
                aria-valuenow={completionPercentage}
                aria-valuemin={0}
                aria-valuemax={100}
              ></div>
            </div>
          </div>

          {/* Stats Breakdown */}
          <div className="border-t border-gray-600/50">
            <div className="p-4 grid grid-cols-5 gap-2 max-w-md mx-auto">
              {sortedTiers.map(tier => {
                const config = getTierConfig(tier);
                return (
                  <div key={tier} className="text-center">
                    <TierBadge
                      tier={tier}
                      size="md"
                      className="mx-auto mb-1"
                    />
                    <div className={`text-xs font-medium ${config.textColor}`}>
                      {stats[tier] || 0}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Filter Panel */}
        <section
          aria-live="polite"
          className={`card overflow-hidden transition-all duration-300 ease-out transform origin-top ${showFilters ? 'scale-y-100 opacity-100 max-h-96 mb-4' : 'scale-y-0 opacity-0 max-h-0'}`}
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-100">Filter Collection</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-100 hover:bg-white/10 transition-colors"
                aria-label="Close Filters"
              >
                <X size={20} />
              </button>
            </div>

            {/* Search input */}
            <div className="mb-3 relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Search size={18} />
              </div>
              <input
                type="text"
                placeholder="Search birds..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-800/80 border border-gray-700/80 rounded-lg py-2 pl-10 pr-4 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {/* "All" Filter Button */}
              <button
                onClick={() => setActiveFilter(null)}
                aria-pressed={activeFilter === null}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 ${
                  activeFilter === null
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-gray-700/70 hover:bg-gray-600/70 text-gray-300'
                }`}
              >
                All Birds
              </button>

              {/* Tier Filter Buttons */}
              {sortedTiers.map(tier => {
                const config = getTierConfig(tier);
                const count = stats[tier] || 0;
                return (
                  <button
                    key={tier}
                    onClick={() => setActiveFilter(tier)}
                    disabled={count === 0}
                    aria-pressed={activeFilter === tier}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 transition-colors duration-200 ${
                      activeFilter === tier
                        ? `bg-gradient-to-r ${config.bgGradient} text-white shadow-sm`
                        : count === 0
                          ? 'bg-gray-800/70 text-gray-500 cursor-not-allowed opacity-60'
                          : 'bg-gray-700/70 hover:bg-gray-600/70 text-gray-300'
                    }`}
                  >
                    <span>{tier}</span>
                    <span className={`text-xs font-normal ${activeFilter === tier ? 'opacity-80' : count > 0 ? 'opacity-70' : 'text-gray-600'}`}>
                      ({count})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Collection Grid */}
        {filteredCollection.length > 0 ? (
          <>
            {/* Results count */}
            <div className="mb-3 text-sm text-gray-400">
              Showing {filteredCollection.length} {filteredCollection.length === 1 ? 'bird' : 'birds'}
              {activeFilter && ` in tier ${activeFilter}`}
              {searchQuery && ` matching "${searchQuery}"`}
            </div>

            {/* Card grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {filteredCollection.map((bird, index) => {
                const isSuperRare = bird.tier === 'S' || bird.tier === 'A';
                return (
                  <div
                    key={bird.id}
                    className={`
                      card p-0 overflow-hidden transition-all duration-300 transform 
                      hover:scale-[1.02] hover:shadow-lg
                      ${bird.tier === 'S' ? 'shadow-[0_0_10px_rgba(250,204,21,0.25)]' : ''}
                      ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}
                    `}
                    style={{ transitionDelay: `${Math.min(index * 30, 500)}ms` }}
                  >
                    {/* Card Image Area */}
                    <div className="relative aspect-square overflow-hidden bg-gray-800 border-b border-gray-700">
                      <Image
                        src={bird.imageUrl}
                        alt={bird.species.replace(/_/g, ' ')}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                        className="transition-transform duration-500 hover:scale-105"
                        style={{ objectFit: 'cover' }}
                      />

                      {/* Tier Badge */}
                      <div className="absolute top-2 right-2">
                        <TierBadge tier={bird.tier} size="sm" />
                      </div>

                      {/* Special shine effect for S/A tier */}
                      {isSuperRare && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 animate-shine" />
                      )}
                    </div>

                    {/* Card Content */}
                    <div className="p-3">
                      <h3
                        className="font-semibold text-sm sm:text-base capitalize truncate text-gray-100"
                        title={bird.species.replace(/_/g, ' ')}
                      >
                        {bird.species.replace(/_/g, ' ')}
                      </h3>
                      <div className="flex justify-between items-center mt-2">
                        <TierStars tier={bird.tier} />
                        <span className="text-xs text-gray-400 whitespace-nowrap">
                          {new Date(bird.capturedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          // Empty States
          <div className={`text-center py-12 px-6 transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
            {activeFilter || searchQuery ? (
              // Empty state when filters are active
              <div className="flex flex-col items-center gap-4">
                {activeFilter && (
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${getTierConfig(activeFilter).bgGradient} flex items-center justify-center text-white text-3xl font-bold shadow`}>
                    {activeFilter}
                  </div>
                )}
                <p className="text-lg font-medium text-gray-100">
                  {searchQuery
                    ? `No birds found matching "${searchQuery}"`
                    : `No Tier ${activeFilter} birds found yet.`
                  }
                </p>
                <button
                  onClick={() => {
                    setActiveFilter(null);
                    setSearchQuery('');
                  }}
                  className="btn-tertiary"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              // Empty state when collection is truly empty
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto border border-gray-600/50 animate-pulse-slow">
                  <Star size={36} className="text-amber-400" />
                </div>
                <p className="text-xl font-medium text-gray-100">
                  Your bird collection is empty
                </p>
                <p className="text-gray-400 max-w-md">
                  Capture your first bird to start building your collection. Discover rare species and complete your Aviary!
                </p>
                <Link href="/capture">
                  <button className="btn-primary mt-2">
                    Capture Your First Bird
                  </button>
                </Link>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}