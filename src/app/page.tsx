// src/app/page.tsx - Polished Bird Gacha Homepage (Dark Theme - Final Tweaks)
"use client";
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Star, Sparkles, BookOpen, Info, Target, X, Camera } from 'lucide-react';
import { useTickets } from '@/context/TicketsContext';

// --- Configuration ---

// Using S-D tiers, updated percentages, styles from the preferred dark theme version
const tierConfig = {
  'S': {
    name: "LEGENDARY",
    rarity: "5.0%", // Updated percentage
    color: "text-yellow-400",
    bgGradient: "from-yellow-400/80 via-amber-300/80 to-yellow-500/80",
    glow: "shadow-[0_0_15px_5px_rgba(250,204,21,0.5)]",
    stars: 5,
  },
  'A': {
    name: "EPIC",
    rarity: "14.8%", // Updated percentage
    color: "text-purple-400",
    bgGradient: "from-purple-500/80 via-fuchsia-500/80 to-purple-600/80",
    glow: "shadow-[0_0_12px_4px_rgba(192,132,252,0.5)]",
    stars: 4,
  },
  'B': {
    name: "RARE",
    rarity: "31.9%", // Updated percentage
    color: "text-blue-400",
    bgGradient: "from-blue-500/80 via-cyan-500/80 to-blue-600/80",
    glow: "shadow-[0_0_10px_3px_rgba(96,165,250,0.4)]",
    stars: 3,
  },
  'C': {
    name: "UNCOMMON",
    rarity: "29.3%", // Updated percentage
    color: "text-emerald-400",
    bgGradient: "from-emerald-500/80 via-green-500/80 to-emerald-600/80",
    glow: "shadow-[0_0_8px_2px_rgba(52,211,153,0.4)]",
    stars: 2
  },
  'D': {
    name: "COMMON",
    rarity: "18.9%", // Updated percentage
    color: "text-gray-400",
    bgGradient: "from-gray-500/80 via-slate-500/80 to-gray-600/80",
    glow: "shadow-[0_0_6px_1px_rgba(156,163,175,0.4)]",
    stars: 1
  }
};

type TierLevel = keyof typeof tierConfig;

// --- Helper Components ---

// Keeping the Genshin-inspired Ticket Icon
const TicketIcon = ({ size = 16, className = "" }: { size?: number, className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-gem ${className}`}>
      <path d="M6 3h12l4 6-10 13L2 9z"/>
      <path d="M12 22V9"/>
      <path d="m3.29 9 8.71 13 8.71-13"/>
      <path d="M2 9h20"/>
    </svg>
);

// TierStars component (using the logic from the preferred dark version)
const TierStars = ({ tier, size = 16 }: { tier: TierLevel, size?: number }) => {
    const config = tierConfig[tier];
    if (!config) return null;
    const starCount = config.stars;
    const starColor = config.color || "text-yellow-400";

    return (
        <div className="flex gap-[2px]">
            {[...Array(5)].map((_, i) => (
                <Star
                    key={i}
                    size={size}
                    fill={i < starCount ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth={1.5}
                    className={i < starCount ? starColor : "text-gray-600"} // Dark theme unfilled star
                />
            ))}
        </div>
    );
};


// --- Main Page Component ---

export default function HomePage() {
  const { tickets = 0 } = useTickets() ?? { tickets: 0 };
  const [showRarityGuide, setShowRarityGuide] = useState(false);
  const [animateButton, setAnimateButton] = useState(false);

  // Memoized background elements (Reverted to Dark Theme)
  const backgroundElements = useMemo(() => {
     const stars = Array.from({ length: 50 }).map((_, i) => {
       const size = Math.random() * 2 + 1;
       const duration = Math.random() * 50 + 30;
       const delay = Math.random() * 30;
       const opacity = Math.random() * 0.5 + 0.2;
       return { key: `star-${i}`, style: { left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, width: `${size}px`, height: `${size}px`, opacity: opacity, animation: `drift ${duration}s linear ${delay}s infinite alternate` }, className: "absolute rounded-full bg-white/80" };
     });
     const sparkles = Array.from({ length: 15 }).map((_, i) => {
       const size = Math.random() * 10 + 6;
       const duration = Math.random() * 5 + 3;
       const delay = Math.random() * 5;
       const opacity = Math.random() * 0.6 + 0.3;
       return { key: `sparkle-${i}`, style: { left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, opacity: opacity, animation: `pulse ${duration}s ease-in-out ${delay}s infinite` }, className: "absolute text-yellow-300", size: size };
     });
     return { stars, sparkles };
   }, []);


  useEffect(() => {
    const timer = setTimeout(() => setAnimateButton(true), 100);
    const interval = setInterval(() => {
        setAnimateButton(false);
        setTimeout(() => setAnimateButton(true), 100);
    }, 5000);
    return () => { clearTimeout(timer); clearInterval(interval); };
  }, []);

  const sortedTiers = useMemo(() => ['S', 'A', 'B', 'C', 'D'] as TierLevel[], []);

  return (
    // Reverted to Dark Theme Background Gradient
    <div className="fixed inset-0 flex flex-col bg-gradient-to-br from-indigo-900 via-blue-900 to-black text-gray-100 font-sans overflow-hidden">

      {/* Animated Background - Reverted to Dark Theme */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Drifting Stars */}
        {backgroundElements.stars.map(star => <div key={star.key} style={star.style} className={star.className} />)}
        {/* Pulsing Sparkles */}
        {backgroundElements.sparkles.map(sparkle => <div key={sparkle.key} style={sparkle.style} className={sparkle.className}><Sparkles size={sparkle.size} fill="currentColor" /></div>)}
        {/* Subtle Gradient Glows (Dark Theme) */}
        <div className="absolute top-[-20%] left-[-20%] w-[60vw] h-[60vw] bg-gradient-radial from-blue-500/15 via-transparent to-transparent rounded-full animate-subtle-pulse opacity-50 blur-3xl"></div>
        <div className="absolute bottom-[-20%] right-[-20%] w-[70vw] h-[70vw] bg-gradient-radial from-purple-500/15 via-transparent to-transparent rounded-full animate-subtle-pulse animation-delay-2s opacity-50 blur-3xl"></div>
        {/* Central Glow (Dark Theme - Amber/Orange) */}
        <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-96 h-96 bg-gradient-radial from-amber-400/10 via-orange-300/5 to-transparent rounded-full blur-3xl animate-pulse-slow"></div>
         </div>
      </div>

      {/* Header - Reverted to Dark Theme Style */}
       <header className="pt-5 pb-3 px-4 flex justify-between items-center z-10 relative w-full">
         {/* Prominent Title - Keeping the existing dark theme style */}
         <div className="flex-grow text-center absolute inset-x-0 top-4">
             <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-300 to-orange-400 drop-shadow-lg">
                 Bird Gacha
             </h1>
         </div>
         {/* Ticket Counter - Reverted to Dark Theme Style */}
         <div className="ml-auto bg-black/40 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 flex items-center gap-2 shadow-lg relative">
             <TicketIcon size={20} className="text-amber-400" />
             <span className="font-semibold text-lg text-white">{tickets}</span>
         </div>
       </header>


      {/* Main Content - Centered Capture Button */}
      <main className="flex-grow flex flex-col items-center justify-center px-4 pb-24 relative z-10 mt-8">
        <div className="relative group">
           {tickets > 0 ? (
             <Link href="/capture" passHref>
               <button
                 className={`
                   relative w-48 h-48 sm:w-56 sm:h-56 rounded-full
                   bg-gradient-to-br from-yellow-400 via-amber-300 to-orange-400 /* Button gradient */
                   border-2 border-yellow-200/50
                   flex flex-col items-center justify-center text-center
                   text-white font-bold shadow-xl /* <<<< CHANGED TEXT TO WHITE */
                   transition-all duration-300 ease-out
                   hover:scale-105 hover:shadow-[0_0_25px_8px_rgba(250,204,21,0.6)]
                   active:scale-95 active:shadow-[0_0_15px_5px_rgba(250,204,21,0.5)]
                   ${animateButton ? 'scale-100 shadow-[0_0_20px_7px_rgba(250,204,21,0.5)]' : 'scale-95 shadow-lg shadow-yellow-500/30'}
                 `}
               >
                 <div className="absolute inset-0 rounded-full bg-gradient-radial from-white/30 via-transparent to-transparent opacity-50 group-hover:opacity-80 transition-opacity"></div>
                 <div className={`absolute -inset-2 rounded-full border-2 border-yellow-300/50 animate-pulse-slow ${animateButton ? 'opacity-75' : 'opacity-0'} transition-opacity duration-500`}></div>

                 {/* Icon and Text - WHITE TEXT */}
                 <Camera size={40} className="mb-1 text-white drop-shadow-md" /> {/* White icon */ }
                 <span className="text-xl sm:text-2xl text-white drop-shadow-md leading-tight">CAPTURE</span> {/* White Text */}
                 <span className="text-xs sm:text-sm text-white/80 drop-shadow-md leading-tight mt-1">Pull for birds!</span> {/* Muted White Text */}

                 {/* Cost Indicator - Dark Theme Style */}
                 <div className="absolute bottom-3 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1.5 border border-white/20">
                    <TicketIcon size={14} className="text-amber-300"/>
                    <span className="text-xs text-white font-medium">1</span>
                 </div>
               </button>
             </Link>
           ) : (
             // Disabled State - Adjusted for Dark Theme + White Active Text
             <div
               className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-gradient-to-br from-gray-600 via-gray-500 to-gray-600 border-2 border-gray-400/50 flex flex-col items-center justify-center text-center text-gray-500 font-bold shadow-lg cursor-not-allowed opacity-70" /* Darker text color */
             >
               <Camera size={40} className="mb-1 text-gray-500" /> {/* Muted icon */}
               <span className="text-xl sm:text-2xl text-gray-500 leading-tight">CAPTURE</span> {/* Muted Text */}
                <span className="text-xs sm:text-sm text-gray-600/90 leading-tight mt-1">Pull for birds!</span> {/* Muted Text */}
               <div className="absolute bottom-3 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1.5 border border-white/20">
                 <TicketIcon size={14} className="text-gray-400"/>
                 <span className="text-xs text-gray-300 font-medium">1</span>
               </div>
               <span className="absolute top-full mt-2 text-sm text-red-400 font-semibold">No Tickets!</span>
             </div>
           )}
         </div>
      </main>

      {/* Footer Navigation - Reverted to Dark Theme Style, Link Fix Applied */}
      <footer className="absolute bottom-0 left-0 right-0 p-3 z-10 bg-gradient-to-t from-black/60 via-black/30 to-transparent">
        <div className="flex justify-center items-center gap-3 sm:gap-4 max-w-md mx-auto">
          {[
            { href: '/collection', icon: BookOpen, label: 'Collection', color: 'text-blue-300', hoverColor: 'hover:shadow-blue-400/40' },
            { onClick: () => setShowRarityGuide(true), icon: Info, label: 'Rarity', color: 'text-purple-300', hoverColor: 'hover:shadow-purple-400/40' },
            { href: '/bounty', icon: Target, label: 'Bounties', color: 'text-amber-300', hoverColor: 'hover:shadow-amber-400/40' },
          ].map(({ href, onClick, icon: Icon, label, color, hoverColor }) => {
            const buttonClasses = `
              relative group flex flex-col items-center justify-center p-2 rounded-lg
              bg-black/20 backdrop-blur-md border border-transparent /* Dark theme bg */
              hover:bg-black/30 hover:border-white/10
              transition-all duration-200 flex-1 text-center shadow-md hover:shadow-lg ${hoverColor} hover:-translate-y-1
            `;
            const content = (
              <>
                {/* Dark theme icon background */}
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center mb-1 border border-white/10 group-hover:bg-white/10 transition-colors`}>
                   <Icon size={20} className={`${color} transition-colors`} />
                </div>
                {/* Dark theme text color */}
                <span className="text-xs sm:text-sm font-medium text-gray-200">{label}</span>
              </>
            );

            // Apply classes directly to Link, no legacyBehavior or <a>
            return href ? (
              <Link key={label} href={href} className={buttonClasses}>
                {content}
              </Link>
             ) : (
              <button key={label} onClick={onClick} className={buttonClasses}>
                {content}
              </button>
             );
          })}
        </div>
      </footer>


      {/* Rarity Guide Modal (Using updated percentages, Reverted to Dark Theme) */}
      {showRarityGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          {/* Reverted Modal Style to Dark Theme */}
          <div className="bg-gradient-to-b from-gray-800/80 via-gray-900/90 to-black/90 border border-blue-400/30 rounded-xl shadow-2xl w-full max-w-md overflow-hidden backdrop-blur-lg">
            {/* Modal Header - Dark Theme */}
            <div className="p-4 flex items-center justify-between border-b border-blue-300/20 bg-gradient-to-r from-blue-900/50 to-purple-900/50">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Info size={18} className="text-purple-300" />
                Rarity System
              </h3>
              <button onClick={() => setShowRarityGuide(false)} className="rounded-full p-1.5 bg-white/10 hover:bg-white/20 text-gray-300 transition-colors"> <X size={20} /> </button>
            </div>

            {/* Modal Content - Updated Percentages */}
            <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
              {sortedTiers.map((tier, index) => {
                  const config = tierConfig[tier];
                  return (
                    // Modal Item Style - Dark Theme
                    <div
                      key={tier}
                      className={`flex items-center p-3 rounded-lg bg-black/30 border border-white/10 gap-4 transition-all duration-300 hover:bg-black/40 ${config.glow} hover:scale-[1.02]`}
                      style={{ animation: `fade-slide-in 0.5s ease-out ${index * 100}ms backwards` }}
                    >
                      <div className={`flex-shrink-0 w-14 h-14 rounded-md bg-gradient-to-br ${config.bgGradient} flex items-center justify-center text-white font-bold text-2xl shadow-lg border border-white/20`}>
                          {tier}
                      </div>
                      <div className="flex-grow">
                         <div className="flex justify-between items-center mb-1">
                           <span className={`font-bold text-md ${config.color}`}>{config.name}</span>
                           {/* Using updated rarity percentage */}
                           <span className="text-sm text-gray-300 font-medium bg-black/40 px-2 py-0.5 rounded-full border border-white/10">{config.rarity}</span>
                         </div>
                         <TierStars tier={tier} size={18} />
                       </div>
                    </div>
                 );
              })}
              {/* Modal Description - Dark Theme */}
              <div className="mt-4 text-sm text-gray-400 text-center bg-black/30 rounded-lg p-3 border border-white/10">
                <p>Rarity reflects the observed frequency of birds (% of extant species).</p>
                <p className="mt-1">Higher tiers indicate rarer captures for your collection!</p>
              </div>
            </div>
            {/* Modal Footer - Dark Theme */}
            <div className="border-t border-blue-300/20 p-3 bg-black/50">
              <button onClick={() => setShowRarityGuide(false)} className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg font-semibold transform active:scale-[0.98] transition">Close</button>
            </div>
          </div>
        </div>
      )}


      {/* Global Styles & Animations (Reverted to Dark Theme ones) */}
      <style jsx global>{`
        @keyframes drift { from { transform: translate(0px, 0px) rotate(0deg); } to { transform: translate(${Math.random() * 40 - 20}px, ${Math.random() * 40 - 20}px) rotate(${Math.random() * 10 - 5}deg); } }
        @keyframes pulse { 0%, 100% { opacity: 0.3; transform: scale(0.95); } 50% { opacity: 0.8; transform: scale(1.05); } }
        @keyframes pulse-slow { 0%, 100% { opacity: 0.6; transform: scale(1); } 50% { opacity: 1; transform: scale(1.03); } }
        @keyframes subtle-pulse { 0%, 100% { opacity: 0.4; transform: scale(1); } 50% { opacity: 0.6; transform: scale(1.05); } }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fade-slide-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animation-delay-2s { animation-delay: 2s; }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        /* Scrollbar for Dark Theme */
        .max-h-\[60vh\]::-webkit-scrollbar { width: 6px; }
        .max-h-\[60vh\]::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); border-radius: 3px; }
        .max-h-\[60vh\]::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.3); border-radius: 3px; }
        .max-h-\[60vh\]::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.5); }
      `}</style>
    </div>
  );
}