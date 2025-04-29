// src/app/layout.tsx
import type {Metadata, Viewport} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";
import { TicketsProvider } from "@/context/TicketsContext";
import CollectionProvider from "@/context/CollectionContext";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Bird Gacha",
    description: "Identify and collect birds with AI",
    // Remove colorScheme from here
};
export const viewport: Viewport = {
    colorScheme: "light dark", // Move this here
    width: "device-width",
    initialScale: 1,
};
export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
        <TicketsProvider>
            <CollectionProvider>
                {children}
            </CollectionProvider>
        </TicketsProvider>
        </body>
        </html>
    );
}