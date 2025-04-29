// src/components/DailyReward.tsx
"use client";
import React, { useEffect, useState } from 'react';
import { useTickets } from "@/context/TicketsContext";
import { toast } from 'react-hot-toast';

function DailyReward() {
    const { claimDailyReward, timeUntilNextReward } = useTickets();
    const [showModal, setShowModal] = useState(false);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);

    useEffect(() => {
        // Check if reward is available on mount
        const time = timeUntilNextReward();
        setTimeLeft(time);

        if (time === 0) {
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

    const handleClaim = () => {
        const claimed = claimDailyReward();
        if (claimed) {
            // Show success message
            toast.success("Daily reward claimed! +5 tickets");
        }
        setShowModal(false);
    };

    // Format time remaining
    const formatTimeRemaining = () => {
        if (timeLeft === null || timeLeft === 0) return "Available now!";

        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        return `Next reward in ${hours}h ${minutes}m`;
    };

    return (
        <>
            {/* Reward button in header */}
            <button
                className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    timeLeft === 0 
                        ? 'bg-yellow-400 text-yellow-900 animate-pulse' 
                        : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}
                onClick={() => setShowModal(true)}
            >
                🎁 {formatTimeRemaining()}
            </button>

            {/* Reward modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-sm w-full">
                        <h2 className="text-2xl font-bold mb-4 text-center">Daily Reward</h2>

                        {timeLeft === 0 ? (
                            <div className="text-center">
                                <div className="text-6xl mb-4">🎁</div>
                                <p className="text-lg mb-4">Your daily reward is ready!</p>
                                <button
                                    onClick={handleClaim}
                                    className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-bold"
                                >
                                    Claim 5 Tickets
                                </button>
                            </div>
                        ) : (
                            <div className="text-center">
                                <div className="text-6xl mb-4">⏳</div>
                                <p className="text-lg mb-4">{formatTimeRemaining()}</p>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="w-full py-3 bg-gray-500 text-white rounded-lg font-bold"
                                >
                                    Close
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}

export default DailyReward;