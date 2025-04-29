"use client";

import Link from "next/link";
import { Toaster } from "react-hot-toast";
import { useTickets } from "@/context/TicketsContext";  // ✅ only this import
import DailyReward from "./DailyReward";

export default function Nav() {
  // Hooks must run inside the component
  const { tickets } = useTickets();

  return (
    <>
      <header className="p-4 bg-white dark:bg-gray-900 shadow">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="text-xl font-bold">
            Bird Gacha
          </Link>

          <nav className="flex items-center space-x-4">
            {/* Capture link (disabled if no tickets) */}
            <Link
              href="/capture"
              className={`text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-opacity ${
                tickets === 0 ? "opacity-50 pointer-events-none" : ""
              }`}
              onClick={(e) => {
                if (tickets === 0) e.preventDefault();
              }}
              aria-disabled={tickets === 0}
            >
              Capture
            </Link>

            {/* Collection link */}
            <Link
              href="/collection"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              Collection
            </Link>

            {/* Daily reward button */}
            <DailyReward />

            {/* Ticket counter */}
            <span className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
              🎫 {tickets}
            </span>
          </nav>
        </div>
      </header>

      {/* Toast notifications */}
      <Toaster position="top-center" reverseOrder={false} />
    </>
  );
}
