"use client";

import Link from "next/link";
import { Toaster } from "react-hot-toast";
import { useTickets } from "@/context/TicketsContext";
import DailyReward from "./DailyReward";
import { Camera, BookOpen, Award, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Nav() {
  const { tickets } = useTickets();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <header className="bg-gradient-to-b from-black/70 via-black/40 to-transparent
                backdrop-blur-md sticky top-0 z-30 border-b border-gray-800/50">
        <div className="container mx-auto flex justify-between items-center px-4 py-3">
          {/* Logo and Brand */}
          <Link href="/" className="text-xl font-bold flex items-center gap-2">
            <span className="text-amber-400">Bird</span>
            <span className="text-gray-100">Gacha</span>
          </Link>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-full bg-gray-800/50 hover:bg-gray-700/50 text-gray-300"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            {/* Capture link (disabled if no tickets) */}
            <Link
              href="/capture"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all ${
                tickets === 0 ? "opacity-50 pointer-events-none" : ""
              }`}
              onClick={(e) => {
                if (tickets === 0) e.preventDefault();
              }}
              aria-disabled={tickets === 0}
            >
              <Camera size={18} />
              <span>Capture</span>
            </Link>

            {/* Collection link */}
            <Link
              href="/collection"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all"
            >
              <BookOpen size={18} />
              <span>Collection</span>
            </Link>

            {/* Bounty link */}
            <Link
              href="/bounty"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all"
            >
              <Award size={18} />
              <span>Bounties</span>
            </Link>

            {/* Daily reward button */}
            <DailyReward />

            {/* Ticket counter */}
            <div className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-500/30 text-amber-300 rounded-full text-sm font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-gem">
                <path d="M6 3h12l4 6-10 13L2 9z"/>
                <path d="M12 22V9"/>
                <path d="m3.29 9 8.71 13 8.71-13"/>
                <path d="M2 9h20"/>
              </svg>
              <span>{tickets}</span>
            </div>
          </nav>
        </div>

        {/* Mobile menu dropdown */}
        {isMenuOpen && (
          <div className="md:hidden bg-gray-900/90 backdrop-blur-md animate-fade-in">
            <nav className="flex flex-col px-4 py-3 space-y-2 border-t border-gray-800/50">
              <Link
                href="/capture"
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all ${
                  tickets === 0 ? "opacity-50 pointer-events-none" : ""
                }`}
                onClick={(e) => {
                  if (tickets === 0) e.preventDefault();
                  setIsMenuOpen(false);
                }}
              >
                <Camera size={20} />
                <span>Capture</span>
              </Link>

              <Link
                href="/collection"
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all"
                onClick={() => setIsMenuOpen(false)}
              >
                <BookOpen size={20} />
                <span>Collection</span>
              </Link>

              <Link
                href="/bounty"
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all"
                onClick={() => setIsMenuOpen(false)}
              >
                <Award size={20} />
                <span>Bounties</span>
              </Link>

              <div className="flex items-center justify-between py-2 border-t border-gray-800/50">
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400">
                    <path d="M6 3h12l4 6-10 13L2 9z"/>
                    <path d="M12 22V9"/>
                    <path d="m3.29 9 8.71 13 8.71-13"/>
                    <path d="M2 9h20"/>
                  </svg>
                  <span className="text-gray-300">{tickets} tickets available</span>
                </div>

                {/* Mobile daily reward */}
                <DailyReward />
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Toast notifications */}
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          style: {
            background: 'rgba(31, 41, 55, 0.9)',
            color: '#f3f4f6',
            borderRadius: '0.5rem',
            border: '1px solid rgba(75, 85, 99, 0.3)'
          },
        }}
      />
    </>
  );
}