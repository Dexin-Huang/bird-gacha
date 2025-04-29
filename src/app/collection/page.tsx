// src/app/collection/page.tsx
"use client";
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Filter, X, Star } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image'; // NEW: Import next/image
import { useCollection } from '@/context/CollectionContext';
import { getTierConfig, renderStars } from '@/lib/tierUtils';


export default function CollectionPage() {
  // Assuming useCollection provides typed collection data
  const { collection } = useCollection();
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Sort collection by captured date (newest first) by default
  const sortedCollection = React.useMemo(() =>
    [...collection].sort((a, b) => new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime()),
    [collection]
  );

  // Filter sorted collection
  const filteredCollection = React.useMemo(() =>
    activeFilter
      ? sortedCollection.filter(bird => bird.tier === activeFilter)
      : sortedCollection,
    [sortedCollection, activeFilter]
  );

  // Animation on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100); // Short delay for transition
    return () => clearTimeout(timer);
  }, []);

  // Group birds by tier for statistics (using original unsorted collection)
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
  const estimatedTotal = 100; // Placeholder: Replace with actual total possible species
  const completionPercentage = Math.min(100, Math.round((uniqueSpecies / estimatedTotal) * 100));

  return (
    // Main container using the dark theme background
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-800 via-indigo-900 to-black text-gray-100 font-sans pb-16">

      {/* Header - Consistent Dark Gradient */}
      <header className="bg-gradient-to-r from-indigo-800 to-purple-800 text-white p-4 shadow-md sticky top-0 z-20">
        <div className="container mx-auto flex items-center">
          <Link href="/" className="p-2 mr-2 -ml-2 rounded-full hover:bg-white/10 transition-colors" aria-label="Go Home">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-xl font-semibold">My Collection</h1>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="ml-auto p-2 rounded-lg hover:bg-white/30 transition-colors" // Slightly larger tap area
            aria-label="Filter Collection"
            aria-expanded={showFilters}
          >
            <Filter size={20} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow container mx-auto px-4 pt-4">

        {/* Collection Stats Card - Dark Theme */}
        <section aria-labelledby="collection-stats-heading" className={`bg-gray-700/50 border border-gray-600/50 backdrop-blur-sm rounded-xl shadow-lg mb-4 transition-all duration-500 transform ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}>
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

          {/* Stats Breakdown - Dark Theme */}
          <div className="border-t border-gray-600/50">
            <div className="p-4 grid grid-cols-5 gap-2 max-w-md mx-auto">
              {['S', 'A', 'B', 'C', 'D'].map(tier => {
                const config = getTierConfig(tier);
                return (
                  <div key={tier} className="text-center">
                    <div
                      className={`w-8 h-8 mx-auto rounded-full bg-gradient-to-r ${config.bgGradient} flex items-center justify-center text-white font-bold text-sm mb-1 shadow-sm`}
                      title={config.name} // Tooltip for tier name
                    >
                      {tier}
                    </div>
                    <div className={`text-xs font-medium ${config.textColor}`}>
                      {stats[tier] || 0}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Filter Panel - Dark Theme */}
        <section aria-live="polite" className={`bg-gray-700/50 border border-gray-600/50 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden transition-all duration-300 ease-out transform origin-top ${showFilters ? 'scale-y-100 opacity-100 max-h-96 mb-4' : 'scale-y-0 opacity-0 max-h-0'}`}>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-100">Filter by Tier</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-100 hover:bg-white/10"
                aria-label="Close Filters"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {/* "All" Filter Button */}
              <button
                onClick={() => setActiveFilter(null)}
                aria-pressed={activeFilter === null}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 ${
                    activeFilter === null
                    ? 'bg-indigo-500 text-white shadow-sm'
                    : 'bg-gray-600/70 hover:bg-gray-500/70 text-gray-300'
                }`}
              >
                All
              </button>

              {/* Tier Filter Buttons */}
              {['S', 'A', 'B', 'C', 'D'].map(tier => {
                const config = getTierConfig(tier);
                const count = stats[tier] || 0;
                return (
                  <button
                    key={tier}
                    onClick={() => setActiveFilter(tier)}
                    disabled={count === 0} // Disable if no birds of this tier
                    aria-pressed={activeFilter === tier}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1 transition-colors duration-200 ${
                      activeFilter === tier
                        ? `bg-gradient-to-r ${config.bgGradient} text-white shadow-sm`
                        : count === 0
                          ? 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-60'
                          : 'bg-gray-600/70 hover:bg-gray-500/70 text-gray-300'
                    }`}
                  >
                    {tier}
                    <span className={`text-xs font-normal opacity-80 ${activeFilter === tier ? '' : count > 0 ? '' : 'text-gray-600'}`}>
                      ({count})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Collection Grid - Dark Theme Cards */}
        {filteredCollection.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {filteredCollection.map((bird, index) => {
              const config = getTierConfig(bird.tier);
              return (
                <div
                  key={bird.id} // Use unique bird ID
                  className={`
                    bg-gray-700/50 border border-gray-600/50 backdrop-blur-sm
                    rounded-lg overflow-hidden shadow-md hover:shadow-lg hover:border-gray-500/70
                    transition-all duration-300 transform will-change-transform
                    ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}
                  `}
                  style={{ transitionDelay: `${index * 30}ms` }} // Faster stagger
                >
                  {/* Card Image Area */}
                  <div className={`relative aspect-square overflow-hidden bg-gray-600 ${config.borderColor} border-b-2`}>
                    {/* FIXED: Use next/image */}
                    <Image
                      src={bird.imageUrl}
                      alt={bird.species.replace(/_/g, ' ')}
                      fill // Use fill as parent provides aspect ratio
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw" // Optimize image loading
                      className="transition-transform duration-500 ease-in-out hover:scale-105" // Keep hover effect
                      style={{ objectFit: 'cover' }} // Match original object-cover
                    />
                    {/* Tier Badge on Card */}
                    <div title={`${config.name} Tier`} className={`absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-gradient-to-r ${config.bgGradient} text-white flex items-center justify-center font-bold text-xs shadow`}>
                      {bird.tier}
                    </div>
                  </div>
                  {/* Card Content Area */}
                  <div className="p-2 sm:p-3">
                    <h3 className="font-semibold text-sm sm:text-base capitalize truncate text-gray-100" title={bird.species.replace(/_/g, ' ')}>
                      {bird.species.replace(/_/g, ' ')}
                    </h3>
                    <div className="flex justify-between items-center mt-1">
                      {renderStars(bird.tier)}
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        {new Date(bird.capturedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // Empty State - Dark Theme
          <div className={`text-center py-12 px-6 transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
            {activeFilter ? (
              // Empty state when filter is active
              <div className="flex flex-col items-center gap-4">
                 <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${getTierConfig(activeFilter).bgGradient} flex items-center justify-center text-white text-3xl font-bold shadow`}>
                    {activeFilter}
                 </div>
                 <p className="text-lg font-medium text-gray-100">
                   No Tier {activeFilter} birds found yet.
                 </p>
                 <button
                    onClick={() => setActiveFilter(null)}
                    className="text-indigo-300 hover:text-indigo-200 font-medium hover:underline text-sm"
                 >
                   Show all birds
                 </button>
              </div>
            ) : (
              // Empty state when collection is truly empty
              <div className="flex flex-col items-center gap-4">
                 <div className="w-20 h-20 bg-gray-600/50 rounded-full flex items-center justify-center mx-auto border border-gray-500/50">
                    <Star size={36} className="text-gray-500" />
                 </div>
                 <p className="text-lg font-medium text-gray-100">
                   Your bird collection is empty.
                 </p>
                 <Link href="/capture">
                   <button className="
                    bg-gradient-to-br from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600
                    text-gray-900 font-bold text-lg py-3 px-8 rounded-full shadow-lg transform active:scale-95 transition-all duration-200"
                   >
                     Capture Your First Bird!
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