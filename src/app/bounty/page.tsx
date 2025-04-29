// src/app/bounty/page.tsx
"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  AlertTriangle,
  MapPin,
  Target,
} from "lucide-react";

import { fetchBounty, BountyBird } from "./actions";
import { getTierConfig, renderStars } from "@/lib/tierUtils";
import { useUserState } from "@/hooks/useUserState";      // ← NEW

export default function BountyPage() {
  /* ─────────────  location & data state ───────────── */
  const state = useUserState();                 // auto-detect or "Connecticut"
  const [bounty, setBounty] = useState<BountyBird[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ─────────────  fetch whenever state resolved ───── */
  useEffect(() => {
    if (!state) return;                         // still resolving location
    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        setBounty(await fetchBounty(state));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [state]);

  /* ─────────────  UI helpers ───────────── */
  const header = (
    <header className="bg-gradient-to-r from-indigo-800 to-purple-800 text-white p-4 shadow-md sticky top-0 z-20">
      <div className="container mx-auto flex items-center">
        <Link
          href="/"
          className="p-2 mr-2 -ml-2 rounded-full hover:bg-white/10"
          aria-label="Go Home"
        >
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-xl font-semibold flex items-center gap-2">
          <Target size={20} /> Bounty Board
        </h1>
        {state && (
          <span className="ml-auto text-sm bg-white/10 px-2 py-0.5 rounded flex items-center gap-1">
            <MapPin size={12} /> {state}
          </span>
        )}
      </div>
    </header>
  );

  if (!state)
    return (
      <div className="min-h-screen flex flex-col bg-gray-900 text-gray-100">
        {header}
        <main className="flex-grow flex items-center justify-center">
          <Loader2 className="animate-spin text-indigo-300 mr-3" />
          Locating…
        </main>
      </div>
    );

  /* ─────────────  rendered bounty list ───────────── */
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-800 via-indigo-900 to-black text-gray-100 pb-16">
      {header}

      <main className="flex-grow container mx-auto px-4 pt-6">
        <div className="mb-6 text-center sm:text-left">
          <h2 className="text-2xl font-bold text-yellow-300 mb-1">
            Local Bounties: {state}
          </h2>
          <p className="text-gray-300 text-sm">
            Globally rare birds recently recorded in your state. Go find them!
          </p>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 size={48} className="animate-spin text-indigo-300" />
            <p className="ml-4 text-lg">Loading bounties…</p>
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <div className="bg-red-900/50 border border-red-500/50 rounded-xl p-6 text-center max-w-lg mx-auto">
            <AlertTriangle
              size={32}
              className="text-red-300 mx-auto mb-3"
            />
            <h3 className="text-xl font-semibold text-red-200 mb-2">
              Error Loading Bounties
            </h3>
            <p className="text-red-300">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 bg-red-600 hover:bg-red-700 text-white px-5 py-1.5 rounded-lg text-sm font-medium"
            >
              Retry
            </button>
          </div>
        )}

        {/* Success with data */}
        {!isLoading && !error && bounty.length > 0 && (
          <ul className="space-y-3">
            {bounty.map((bird) => {
              const tierCfg = getTierConfig(bird.tier);
              return (
                <li
                  key={bird.com_name}
                  className="bg-gray-700/40 border border-gray-600/50 rounded-lg p-3 sm:p-4 flex items-center gap-4 hover:bg-gray-600/50 transition"
                >
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg bg-gradient-to-br ${tierCfg.bgGradient}`}
                    title={`${tierCfg.name} Tier`}
                  >
                    {bird.tier}
                  </div>
                  <div className="flex-grow overflow-hidden">
                    <h3
                      className="font-semibold capitalize truncate"
                      title={bird.com_name}
                    >
                      {bird.com_name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs">
                      {renderStars(bird.tier)}
                      <span className={`opacity-80 ${tierCfg.textColor}`}>
                        ({tierCfg.name})
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-gray-300 whitespace-nowrap">
                      {bird.n_local} record{bird.n_local === 1 ? "" : "s"} locally
                    </p>
                    <p className="text-xs text-gray-400">in {state}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {/* Success but empty */}
        {!isLoading && !error && bounty.length === 0 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-600/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target size={36} className="text-gray-500" />
            </div>
            <p className="text-lg font-medium text-gray-100">
              No specific bounties found for {state} right now.
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Keep exploring—rare birds could be anywhere!
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
