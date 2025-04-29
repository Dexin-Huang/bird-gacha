// src/components/GachaPullAnimation.tsx
import React, { useEffect, useState } from 'react';
import { Star, Camera } from 'lucide-react';

/**
 * Enhanced gacha pull animation with particles and dynamic effects (Progress bar removed)
 */
const GachaPullAnimation: React.FC = () => {
    // Removed progress state: const [progress, setProgress] = useState(0);
    const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; color: string; speed: number; angle: number }>>([]);

    // Generate random particles for background effect
    useEffect(() => {
        const particleCount = 30;
        const newParticles = Array.from({ length: particleCount }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 10 + 5,
            color: ['#ffcc00', '#ff66cc', '#66ffcc', '#cc66ff'][Math.floor(Math.random() * 4)],
            speed: Math.random() * 2 + 0.5,
            angle: Math.random() * 360
        }));
        setParticles(newParticles);

    }, []); // Dependency array is now empty as progress logic is removed

    return (
        // Using gacha-pull-container class defined in globals.css
        <div className="gacha-pull-container fixed inset-0 z-50 flex flex-col items-center justify-center p-4 overflow-hidden">
            {/* Background particles */}
            <div className="absolute inset-0">
                {particles.map(particle => (
                    <div
                        key={particle.id}
                        // Using animate-pulse and float (assuming defined in globals.css)
                        className="absolute rounded-full animate-pulse"
                        style={{
                            left: `${particle.x}%`,
                            top: `${particle.y}%`,
                            width: `${particle.size}px`,
                            height: `${particle.size}px`,
                            backgroundColor: particle.color,
                            opacity: 0.6,
                            transform: `rotate(${particle.angle}deg)`,
                            animation: `float ${particle.speed}s infinite alternate` // Assuming 'float' animation is defined
                        }}
                    />
                ))}
            </div>

            {/* Center content with enhanced spinner */}
            <div className="relative">
                 {/* Using gacha-pull-spinner class defined in globals.css */}
                <div className="gacha-pull-spinner mb-6 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Camera className="text-white h-8 w-8" />
                    </div>
                </div>

                {/* Stars that orbit around */}
                <div className="absolute -inset-8 animate-spin" style={{ animationDuration: '4s' }}>
                    <Star className="absolute text-yellow-300 h-6 w-6" style={{ top: '0%', left: '50%' }} />
                    <Star className="absolute text-yellow-300 h-6 w-6" style={{ top: '50%', right: '0%' }} />
                    <Star className="absolute text-yellow-300 h-6 w-6" style={{ bottom: '0%', left: '50%' }} />
                    <Star className="absolute text-yellow-300 h-6 w-6" style={{ top: '50%', left: '0%' }} />
                </div>
            </div>

            {/* Loading text - Progress bar removed */}
            <div className="text-center mt-8 w-64">
                <p className="text-xl font-bold text-white mb-2">
                    Identifying Bird...
                </p>
                {/* Progress bar div removed */}
                {/* Status text changed to be static */}
                <p className="text-sm text-yellow-300 font-medium animate-pulse">
                    Analyzing image...
                </p>
                <p className="text-xs text-gray-300 mt-4">
                    Good luck on your bird gacha pull!
                </p>
            </div>
        </div>
    );
};

export default GachaPullAnimation;