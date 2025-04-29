"use client";
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTickets } from "@/context/TicketsContext";
import { toast } from 'react-hot-toast';
import { Gift, Clock, X, Ticket } from 'lucide-react';

function DailyReward() {
    const { claimDailyReward, timeUntilNextReward } = useTickets();
    const [showModal, setShowModal] = useState(false);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [claimAnimation, setClaimAnimation] = useState(false);
    const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

    // Set up the portal root when component mounts
    useEffect(() => {
        setPortalRoot(document.body);

        // Check if reward is available on mount
        const time = timeUntilNextReward();
        setTimeLeft(time);

        if (time === 0) {
            // Auto-show modal if reward is available
            setShowModal(true);
        }

        // Update countdown timer
        const interval = setInterval(() => {
            const remaining = timeUntilNextReward();
            setTimeLeft(remaining);

            if (remaining === 0) {
                setShowModal(true);
            }
        }, 60000); // Check every minute

        return () => clearInterval(interval);
    }, [timeUntilNextReward]);

    // Add body scroll lock when modal is open
    useEffect(() => {
        if (showModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [showModal]);

    const handleClaim = async () => {
        // Start animation
        setClaimAnimation(true);

        // Claim reward
        const granted = await claimDailyReward();

        if (granted) {
            toast.success("Daily reward claimed! +5 tickets", {
                icon: '🎟️',
                style: {
                    background: 'rgba(16, 185, 129, 0.9)',
                    color: '#fff',
                    borderRadius: '0.5rem',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                },
                duration: 4000
            });

            // Play a subtle celebration animation
            setTimeout(() => {
                setClaimAnimation(false);
                setShowModal(false);
            }, 1500);
        } else {
            toast.error("Unable to claim reward at this time", {
                style: {
                    background: 'rgba(239, 68, 68, 0.9)',
                    color: '#fff',
                    borderRadius: '0.5rem',
                }
            });
            setClaimAnimation(false);
            setShowModal(false);
        }
    };

    // Format time remaining in a user-friendly way
    const formatTimeRemaining = () => {
        if (timeLeft === null || timeLeft === 0) return "Available now!";

        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

        if (hours === 0 && minutes === 0) return "Available now!";
        if (hours === 0) return `${minutes}m`;
        if (minutes === 0) return `${hours}h`;
        return `${hours}h ${minutes}m`;
    };

    // Reward button text
    const buttonText = timeLeft === 0
        ? "Claim Reward"
        : `${formatTimeRemaining()}`;

    // Modal component that will be rendered in the portal
    const RewardModal = () => (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
             style={{ backgroundColor: 'var(--background-modal)' }}>
            <div
                className="relative max-w-sm w-full overflow-hidden rounded-xl shadow-2xl animate-fade-in"
                style={{
                    background: 'linear-gradient(to bottom, rgba(31, 41, 55, 0.8), rgba(17, 24, 39, 0.9), rgba(0, 0, 0, 0.9))',
                    borderColor: 'var(--border-primary)',
                    borderWidth: '1px',
                    backdropFilter: 'blur(8px)'
                }}
            >
                {/* Header */}
                <div className="p-4 flex items-center justify-between border-b border-amber-500/20 bg-gradient-to-r from-amber-800/50 to-yellow-800/50">
                    <h2 className="text-xl font-bold text-amber-200 flex items-center gap-2">
                        <Gift size={20} className="text-amber-300" />
                        Daily Reward
                    </h2>
                    <button
                        onClick={() => setShowModal(false)}
                        className="rounded-full p-1.5 bg-white/10 hover:bg-white/20 text-gray-300 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 text-center">
                    {timeLeft === 0 ? (
                        <div className="text-center">
                            <div className={`text-6xl mb-4 transform transition-all duration-500 
                                ${claimAnimation ? 'scale-125 opacity-0' : 'scale-100 opacity-100'}`}>
                                🎁
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-3">Your Daily Reward is Ready!</h3>
                            <p className="text-gray-300 mb-6">Claim 5 tickets to use for bird captures.</p>

                            {/* Ticket visualization */}
                            <div className="flex justify-center mb-6 gap-2">
                                {[...Array(5)].map((_, i) => (
                                    <div
                                        key={i}
                                        className={`h-8 w-8 bg-gradient-to-br from-amber-400 to-amber-600 
                                            rounded-lg border border-amber-300/30 shadow-md
                                            flex items-center justify-center text-gray-900 font-bold
                                            transform transition-all duration-500
                                            ${claimAnimation ? `translate-y-[-100px] opacity-0 scale-150` : ''}
                                            `}
                                        style={{
                                            transitionDelay: `${i * 100}ms`,
                                            boxShadow: claimAnimation ? '0 0 15px rgba(245, 158, 11, 0.7)' : 'none'
                                        }}
                                    >
                                        <Ticket size={14} />
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={handleClaim}
                                disabled={claimAnimation}
                                className="btn-primary w-full py-3 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {claimAnimation ? 'Claiming...' : 'Claim Reward'}
                            </button>
                        </div>
                    ) : (
                        <div className="text-center">
                            <div className="text-6xl mb-4">⏳</div>
                            <h3 className="text-xl font-semibold text-white mb-2">Next Reward Available Soon</h3>
                            <p className="text-gray-300 mb-6">Check back in {formatTimeRemaining()}</p>
                            <button
                                onClick={() => setShowModal(false)}
                                className="btn-tertiary w-full py-3 rounded-lg font-medium"
                            >
                                Close
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer info */}
                <div className="px-6 pb-6 text-center">
                    <p className="text-xs text-gray-400">
                        Rewards reset daily. Don&apos;t miss out on your free tickets!
                    </p>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Reward button in header - Theme styled */}
            <button
                onClick={() => setShowModal(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all
                    ${timeLeft === 0
                        ? 'bg-gradient-to-r from-amber-500/40 to-yellow-500/40 border border-amber-500/50 text-amber-300 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                        : 'bg-gray-800/60 border border-gray-700/60 text-gray-300 hover:bg-gray-700/60'
                    }`}
                aria-label={timeLeft === 0 ? "Claim daily reward" : "Time until next reward"}
            >
                {timeLeft === 0 ? (
                    <>
                        <Gift size={16} className="text-yellow-300" />
                        <span>{buttonText}</span>
                    </>
                ) : (
                    <>
                        <Clock size={16} />
                        <span>{buttonText}</span>
                    </>
                )}
            </button>

            {/* Reward modal - Using Portal */}
            {showModal && portalRoot && createPortal(
                <RewardModal />,
                portalRoot
            )}
        </>
    );
}

export default DailyReward;