"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Loader2,
  AlertTriangle,
  MapPin,
  Target,
  RefreshCw,
  ChevronRight
} from "lucide-react";

import { fetchBounty, BountyBird } from "./actions";
import { TierBadge, TierStars, TierLabel } from "@/lib/tierUtils";
import { useUserState } from "@/hooks/useUserState";

export default function BountyPage() {
  /* ─────────────  location & data state ───────────── */
  const state = useUserState();                 // auto-detect or "Connecticut"
  const [bounty, setBounty] = useState<BountyBird[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  /* ─────────────  fetch logic (memoized) ──────────── */
  const fetchBountyData = useCallback(async () => {
    if (!state) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchBounty(state);
      setBounty(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [state]);

  /* ─────────────  fetch whenever state resolved ───── */
  useEffect(() => {
    if (!state) return;                         // still resolving location
    fetchBountyData();                          
  }, [state, fetchBountyData]);

  // Handle manual refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchBountyData();
  };

  // Loading state while determining location
  if (!state)
    return (
      <div className="min-h-screen flex flex-col" style={{ background: 'var(--page-background)' }}>
        <main className="flex-grow flex items-center justify-center">
          <div className="flex flex-col items-center text-center p-6">
            <div className="w-16 h-16 bg-gray-800/70 rounded-full flex items-center justify-center mb-4">
              <Loader2 size={32} className="animate-spin text-indigo-400" />
            </div>
            <p className="text-lg font-medium text-gray-200">Determining your location...</p>
            <p className="text-sm text-gray-400 mt-2 max-w-md">
              We&apos;ll find rare birds in your area. This helps customize your bounty experience.
            </p>
          </div>
        </main>
      </div>
    );

  /* ─────────────  rendered bounty list ───────────── */
  return (
    <div className="min-h-screen flex flex-col pb-16" style={{ background: 'var(--page-background)' }}>
      <main className="flex-grow container mx-auto px-4 pt-6">
        {/* Header with location */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-amber-300 mb-1 flex items-center gap-2">
                <MapPin size={24} className="text-amber-400" />
                Bird Bounties: {state}
              </h1>
              <p className="text-gray-300 text-sm ml-0.5">
                Globally rare birds recently recorded in your state. Go find them!
              </p>
            </div>

            {/* Refresh button */}
            <button
              onClick={handleRefresh}
              disabled={isLoading || isRefreshing}
              className="p-2 rounded-lg bg-gray-700/60 hover:bg-gray-600/70 text-gray-300 hover:text-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Refresh bounties"
            >
              <RefreshCw size={20} className={isRefreshing ? "animate-spin" : ""} />
            </button>
          </div>

          {/* Location indicator */}
          <div className="inline-flex items-center mt-2 px-2 py-1 rounded-full bg-gray-800/50 border border-gray-700/70 text-xs text-gray-300">
            <MapPin size={12} className="mr-1 text-amber-400" />
            <span>Using location: {state}</span>
          </div>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="card p-8 flex flex-col items-center justify-center py-20">
            <Loader2 size={48} className="animate-spin text-indigo-400 mb-4" />
            <p className="text-lg font-medium">Loading bounties...</p>
            <p className="text-sm text-gray-400 mt-1">Finding rare birds in {state}</p>
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <div className="card p-6 border-red-500/30 bg-red-900/20 text-center max-w-lg mx-auto">
            <AlertTriangle size={32} className="text-red-400 mx-auto mb-3" />
            <h3 className="text-xl font-semibold text-red-300 mb-2">
              Error Loading Bounties
            </h3>
            <p className="text-red-200 opacity-90 mb-4">{error}</p>
            <button
              onClick={handleRefresh}
              className="btn-secondary bg-red-600 hover:bg-red-700 border-red-500/50"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Success with data */}
        {!isLoading && !error && bounty.length > 0 && (
          <div className="space-y-4">
            <div className="card p-4 mb-4 border-amber-500/20">
              <div className="flex items-start gap-3">
                <div className="bg-amber-400/20 rounded-full p-2 mt-1">
                  <Target size={20} className="text-amber-400" />
                </div>
                <div>
                  <h3 className="font-medium text-amber-200">Bounty Guide</h3>
                  <p className="text-sm text-gray-300 mt-1">
                    These rare birds have been spotted recently in {state}. Find and capture them to add these valuable species to your collection!
                  </p>
                </div>
              </div>
            </div>

            <ul className="space-y-3">
              {bounty.map((bird) => (
                <li
                  key={bird.com_name}
                  className="card p-0 overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:scale-[1.01]"
                >
                  <div className="flex items-center gap-4 p-3 sm:p-4">
                    {/* Tier Badge */}
                    <TierBadge tier={bird.tier} size="lg" />

                    {/* Bird Info */}
                    <div className="flex-grow overflow-hidden">
                      <h3
                        className="font-semibold capitalize truncate text-gray-100"
                        title={bird.com_name}
                      >
                        {bird.com_name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <TierStars tier={bird.tier} size={14} />
                        <TierLabel tier={bird.tier} />
                      </div>
                    </div>

                    {/* Record Count */}
                    <div className="text-right flex-shrink-0">
                      <div className="flex flex-col items-end">
                        <div className="bg-gray-800/70 rounded-full px-2 py-1 inline-flex items-center">
                          <span className="text-amber-300 font-semibold">
                            {bird.n_local}
                          </span>
                          <span className="text-xs ml-1 text-gray-300">
                            {bird.n_local === 1 ? "record" : "records"}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">in {state}</p>
                      </div>
                    </div>

                    {/* Action button */}
                    <Link
                      href="/capture"
                      className="ml-1 p-2 rounded-full bg-gray-800/50 hover:bg-indigo-600/60 text-gray-300 hover:text-white transition-colors"
                      title="Capture this bird"
                    >
                      <ChevronRight size={20} />
                    </Link>
                  </div>

                  {/* Tier-specific highlight */}
                  {bird.tier === 'S' && (
                    <div className="h-1 bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-500 animate-pulse" />
                  )}
                  {bird.tier === 'A' && (
                    <div className="h-1 bg-gradient-to-r from-purple-500 via-fuchsia-400 to-purple-500" />
                  )}
                </li>
              ))}
            </ul>

            {/* Footer note */}
            <div className="text-center mt-6 text-sm text-gray-400">
              <p>Data is updated daily. Keep checking back for new rare birds!</p>
            </div>
          </div>
        )}

        {/* Success but empty */}
        {!isLoading && !error && bounty.length === 0 && (
          <div className="card p-8 text-center">
            <div className="w-20 h-20 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-600/50">
              <Target size={36} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-200 mb-2">
              No bounties found in {state}
            </h3>
            <p className="text-gray-400 max-w-md mx-auto mb-6">
              We couldn&apos;t find any specific bounties for your area right now. Keep exploring—rare birds could be anywhere!
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={handleRefresh}
                className="btn-secondary"
              >
                <RefreshCw size={18} className="mr-1" />
                Refresh
              </button>
              <Link href="/capture">
                <button className="btn-primary">
                  Go Capturing
                </button>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
