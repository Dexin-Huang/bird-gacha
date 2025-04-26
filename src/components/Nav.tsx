"use client";
import Link from "next/link";
import { Toaster } from "react-hot-toast";

export default function Nav() {
  return (
    <>
      <header className="p-4 bg-white dark:bg-gray-900 shadow">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="text-xl font-bold">
            Bird Gacha
          </Link>
          <nav>
            <Link
              href="/capture"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              Capture
            </Link>
          </nav>
        </div>
      </header>
      <Toaster />
    </>
  );
}