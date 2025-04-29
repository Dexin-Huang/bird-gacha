// src/app/capture/page.tsx
"use client";
import React, { useState, useCallback, useRef, useEffect } from "react";
import { Camera, Upload, ArrowLeft, Ticket, AlertCircle, RefreshCw } from "lucide-react";
import Link from 'next/link';
import { toast } from 'react-hot-toast';

import { analyze } from "./actions";
import { useTickets } from '@/context/TicketsContext';
import { useCollection } from '@/context/CollectionContext';
import { useUserState } from '@/hooks/useUserState';
import GachaPullAnimation from '@/components/GachaPullAnimation';
import ResultsDisplay from '@/components/ResultsDisplay';

type CaptureState = 'home' | 'camera' | 'upload' | 'analyzing' | 'result';

/* ------------------------------------------------------------------ */
/* Helper to turn any File/Blob into a permanent data-URI string */
/* ------------------------------------------------------------------ */
const fileToDataURL = (file: File) =>
    new Promise<string>((res, rej) => {
        const reader = new FileReader();
        reader.onerror = () => rej(reader.error);
        reader.onload = () => res(reader.result as string);
        reader.readAsDataURL(file); // => "data:image/jpeg;base64,……"
    });

/* --------------------------------------------------- */
/* utility – only revoke if it really is a blob: URL   */
/* --------------------------------------------------- */
const maybeRevokeBlob = (url?: string | null) => {
    if (url && url.startsWith("blob:")) {
        try {
            URL.revokeObjectURL(url);
        } catch {
            /* ignore */
        }
    }
};

export default function CapturePage() {
    const [captureState, setCaptureState] = useState<CaptureState>('home');
    const [result, setResult] = useState<{ species: string; tier: string } | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const { tickets, setTickets } = useTickets();
    const state = useUserState("Connecticut");
    const { addToCollection } = useCollection();

    const videoRef = useRef<HTMLVideoElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    // Handle camera initialization and cleanup
    useEffect(() => {
        let stream: MediaStream | null = null;
        const videoElement = videoRef.current;

        if (captureState === 'camera') {
            const initCamera = async () => {
                try {
                    stream = await navigator.mediaDevices.getUserMedia({
                        video: {
                            facingMode: { ideal: 'environment' },
                            width: { ideal: 1280 },
                            height: { ideal: 720 }
                        },
                        audio: false,
                    });
                    if (videoElement) {
                        videoElement.srcObject = stream;
                    }
                    setCameraError(null);
                } catch (err) {
                    console.error("Camera error:", err);
                    setCameraError("Camera access denied. Please try uploading a photo instead.");
                }
            };
            initCamera();
        }

        // Cleanup function
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            if (videoElement) {
                videoElement.srcObject = null;
            }
        };
    }, [captureState]);


    // Capture photo from camera feed
    const capturePhoto = () => {
        if (!videoRef.current) return;
        if (isProcessing) return;

        const video = videoRef.current;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            toast.error("Could not process image.");
            return;
        }
        ctx.drawImage(video, 0, 0);

        canvas.toBlob(async (blob) => {
            if (!blob) {
                toast.error("Could not capture photo.");
                return;
            }
            const file = new File([blob], "capture.jpg", { type: "image/jpeg" });

            try {
                const dataURL = await fileToDataURL(file);
                setCapturedImage(dataURL);
                processImage(file, dataURL);
            } catch {
                toast.error("Failed to read photo.");
            }
        }, "image/jpeg", 0.9); // Quality set to 0.9
    };

    // Handle file upload
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || isProcessing) return;

        // Reset file input value so the same file can be selected again
        if (e.target) {
            e.target.value = '';
        }

        try {
            const dataURL = await fileToDataURL(file);
            setCapturedImage(dataURL);
            processImage(file, dataURL);
        } catch {
            toast.error("Failed to read image.");
        }
    };

    // Process image
    const processImage = async (file: File, imageUrl: string) => {
        if (tickets <= 0) {
            toast.error("You don't have any tickets left!");
            maybeRevokeBlob(imageUrl);
            setCapturedImage(null);
            setCaptureState('home');
            return;
        }

        setIsProcessing(true);
        setTickets(prevTickets => Math.max(0, prevTickets - 1));
        setCaptureState('analyzing');

        try {
            // Analyze the image
            const data = await analyze(file, state ?? "Connecticut");
            setResult(data);

            // Add to collection if it's a valid bird
            if (data.species.toUpperCase() !== 'NOT_BIRD') {
                addToCollection({
                    species: data.species,
                    tier: data.tier,
                    imageUrl: imageUrl
                });
            } else {
                 // If not a bird, clean up
                 maybeRevokeBlob(imageUrl);
                 setCapturedImage(null);
            }

            // Show the animation for a set duration
            const analysisDuration = 3000;
            setTimeout(() => {
                setCaptureState('result');
                setIsProcessing(false);
            }, analysisDuration);

        } catch (error) {
            console.error("Analysis failed:", error);
            toast.error("Failed to identify the bird. Please try again.");

            // Clean up and reset state on failure
            maybeRevokeBlob(imageUrl);
            setCapturedImage(null);
            setTickets(prevTickets => prevTickets + 1); // Refund ticket
            setResult(null);
            setCaptureState('home');
            setIsProcessing(false);
        }
    };

    // Reset capture state
    const resetCapture = useCallback(() => {
        maybeRevokeBlob(capturedImage);
        setCaptureState("home");
        setResult(null);
        setCapturedImage(null);
        setCameraError(null);
        setIsProcessing(false);
    }, [capturedImage]);

    // Handle sharing
    const handleShare = useCallback(() => {
        if (!result) return;

        if (navigator.share) {
            navigator.share({
                title: `I found a ${result.tier}-tier ${result.species}!`,
                text: `Check out this ${result.tier}-tier ${result.species} I discovered in Bird Gacha!`,
            })
            .catch((error) => console.log('Error sharing:', error));
        } else {
            toast("Sharing not supported on this device.");
        }
    }, [result]);

    return (
        // Main container - using theme variables
        <div
            className="min-h-screen flex flex-col text-gray-100 font-sans"
            style={{ background: 'var(--page-background)' }}
        >
            {/* Main content area */}
            <main className={`flex-grow flex flex-col items-center ${captureState === 'camera' ? 'p-0' : 'p-6'} pt-8`}>
                {/* Home Screen */}
                {captureState === 'home' && (
                    <div className="flex flex-col items-center w-full px-4 max-w-4xl mx-auto">
                        <div className="text-center mb-8">
                            <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-amber-300">
                                Choose Capture Method
                            </h1>
                            <p className="text-gray-300">
                                Find your next rare bird using your camera or gallery!
                            </p>

                            {/* Ticket display */}
                            <div className="mt-4 inline-flex items-center gap-2 bg-gray-800/70 rounded-full px-4 py-2 border border-amber-500/30">
                                <Ticket size={16} className="text-amber-400" />
                                <span className="font-medium">
                                    {tickets} {tickets === 1 ? 'ticket' : 'tickets'} available
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full max-w-lg">
                            {/* Camera Button */}
                            <button
                                onClick={() => setCaptureState('camera')}
                                disabled={tickets <= 0 || isProcessing}
                                className="card p-6 hover:border-indigo-400/70 hover:shadow-indigo-500/30 transform hover:-translate-y-1 transition-all duration-300 flex flex-col items-center gap-3 text-center disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-none"
                            >
                                <div className="w-20 h-20 rounded-full bg-indigo-500/30 border border-indigo-400/50 flex items-center justify-center">
                                    <Camera size={32} className="text-indigo-200"/>
                                </div>
                                <span className="font-semibold text-lg text-gray-100">Take Photo</span>
                                <span className="text-sm text-gray-300">Use your device camera</span>
                            </button>

                            {/* Upload Button */}
                            <button
                                onClick={() => setCaptureState('upload')}
                                disabled={tickets <= 0 || isProcessing}
                                className="card p-6 hover:border-purple-400/70 hover:shadow-purple-500/30 transform hover:-translate-y-1 transition-all duration-300 flex flex-col items-center gap-3 text-center disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-none"
                            >
                                <div className="w-20 h-20 rounded-full bg-purple-500/30 border border-purple-400/50 flex items-center justify-center">
                                    <Upload size={32} className="text-purple-200"/>
                                </div>
                                <span className="font-semibold text-lg text-gray-100">Upload Photo</span>
                                <span className="text-sm text-gray-300">Choose from gallery</span>
                            </button>
                        </div>

                        {/* No tickets warning */}
                        {tickets <= 0 && (
                            <div className="mt-8 p-5 card border-red-500/30 bg-red-900/20 text-center max-w-lg w-full">
                                <AlertCircle size={32} className="text-red-300 mx-auto mb-3" />
                                <p className="text-red-200 font-medium mb-2">
                                    You&apos;re out of capture tickets!
                                </p>
                                <p className="text-sm text-gray-300 mb-4">
                                    Check back later for a daily reward or visit the shop.
                                </p>
                                <div className="flex justify-center gap-3">
                                    <Link href="/">
                                        <button className="btn-tertiary">
                                            Return Home
                                        </button>
                                    </Link>
                                    <button
                                        onClick={() => window.location.reload()}
                                        className="btn-secondary flex items-center gap-1.5"
                                    >
                                        <RefreshCw size={16} />
                                        <span>Check Again</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Camera Mode */}
                {captureState === 'camera' && (
                    <div className="flex flex-col items-center justify-center w-full h-full flex-grow">
                        {cameraError ? (
                            <div className="card p-6 border-red-500/30 bg-red-900/20 text-center max-w-lg mx-auto">
                                <AlertCircle size={32} className="text-red-300 mx-auto mb-3" />
                                <p className="text-red-200 mb-4">{cameraError}</p>
                                <button
                                    onClick={() => setCaptureState('upload')}
                                    className="btn-secondary"
                                >
                                    Upload Photo Instead
                                </button>
                            </div>
                        ) : (
                            <div className="relative w-full h-full flex flex-col">
                                {/* Camera Preview */}
                                <div className="relative flex-grow w-full overflow-hidden bg-black">
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        muted
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-2 sm:inset-4 border-2 border-white/40 rounded-lg pointer-events-none"></div>
                                </div>

                                {/* Camera Controls */}
                                <div className="flex-shrink-0 p-4 bg-gray-900/60 backdrop-blur-sm flex flex-col items-center">
                                    <button
                                        onClick={capturePhoto}
                                        disabled={isProcessing}
                                        aria-label="Capture Photo"
                                        className="btn-primary w-16 h-16 sm:w-20 sm:h-20 rounded-full shadow-xl flex items-center justify-center bg-gradient-to-br from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Camera size={32} className="text-gray-900"/>
                                    </button>
                                    <p className="text-center text-gray-300 text-sm mt-2">
                                        {isProcessing ? 'Processing...' : 'Tap button to capture'}
                                    </p>
                                </div>

                                {/* Back Button */}
                                <button
                                    onClick={resetCapture}
                                    className="absolute top-4 left-4 p-2 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-colors"
                                    aria-label="Back to capture methods"
                                >
                                    <ArrowLeft size={24} />
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Upload Mode */}
                {captureState === 'upload' && (
                    <div className="flex flex-col items-center justify-center w-full max-w-md">
                        <div className="card p-8 text-center">
                            <div className="w-20 h-20 rounded-full bg-purple-500/30 border border-purple-400/50 flex items-center justify-center mx-auto mb-5">
                                <Upload size={32} className="text-purple-200"/>
                            </div>
                            <h2 className="text-xl sm:text-2xl font-semibold mb-3 text-gray-100">
                                Upload Bird Photo
                            </h2>
                            <p className="mb-6 text-gray-300">
                                Select a clear photo for identification.
                            </p>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                                accept="image/*"
                                className="hidden"
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isProcessing}
                                className="btn-primary py-3 px-8 sm:py-4 sm:px-10 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? 'Processing...' : 'Select Photo'}
                            </button>

                            {/* Back button */}
                            <button
                                onClick={resetCapture}
                                className="mt-4 btn-tertiary"
                            >
                                Back to Options
                            </button>
                        </div>
                    </div>
                )}

                {/* Analyzing Mode - Animation */}
                {captureState === 'analyzing' && (
                    <GachaPullAnimation />
                )}

                {/* Result Screen */}
                {captureState === 'result' && result && (
                    <ResultsDisplay
                        species={result.species}
                        tier={result.tier}
                        imageUrl={capturedImage || undefined}
                        onClose={resetCapture}
                        onShare={handleShare}
                    />
                )}
            </main>
        </div>
    );
}