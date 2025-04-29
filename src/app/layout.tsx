// src/app/layout.tsx
import type {Metadata, Viewport} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";
import { TicketsProvider } from "@/context/TicketsContext";
import CollectionProvider from "@/context/CollectionContext";
import Nav from "@/components/Nav";
import { Toaster } from "react-hot-toast";

// Load fonts
const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

// App metadata
export const metadata: Metadata = {
    title: "Bird Gacha",
    description: "Identify and collect birds with AI - Capture, collect, and discover rare bird species",
    icons: {
        icon: '/favicon.ico',
    },
};

// Viewport settings
export const viewport: Viewport = {
    colorScheme: "dark", // Our design is optimized for dark mode
    width: "device-width",
    initialScale: 1,
    themeColor: "#111827", // Gray-900, matching our background
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark"> {/* Force dark mode for consistent design */}
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}>
        <TicketsProvider>
          <CollectionProvider>
            {/* Main app structure */}
            <div className="flex flex-col min-h-screen">
              <Nav />
              <main className="flex-grow">
                {children}
              </main>
            </div>

            {/* Toast configuration with theme-consistent styling */}
            <Toaster
              position="top-center"
              reverseOrder={false}
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'rgba(31, 41, 55, 0.9)',
                  color: '#f3f4f6',
                  borderRadius: '0.5rem',
                  border: '1px solid rgba(75, 85, 99, 0.3)'
                },
              }}
            />
          </CollectionProvider>
        </TicketsProvider>
      </body>
    </html>
  );
}