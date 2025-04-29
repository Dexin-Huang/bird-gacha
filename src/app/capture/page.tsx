// src/app/capture/page.tsx
"use client";
import React, {useState, useCallback, useRef, useEffect} from "react";
import {Camera, Upload, ArrowLeft} from "lucide-react";
import Link from 'next/link';
import {toast} from 'react-hot-toast';

import {analyze} from "./actions";
import {useTickets} from '@/context/TicketsContext';
import {useCollection} from '@/context/CollectionContext';
import {useUserState} from '@/hooks/useUserState';
// Import the components we want to use
import GachaPullAnimation from '@/components/GachaPullAnimation'; // NEW
import ResultsDisplay from '@/components/ResultsDisplay'; // NEW


type CaptureState = 'home' | 'camera' | 'upload' | 'analyzing' | 'result';

export default function CapturePage() {
    const [captureState, setCaptureState] = useState<CaptureState>('home');
    const [result, setResult] = useState<{ species: string; tier: string } | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    // const [revealed, setRevealed] = useState(false); // REMOVED: Reveal logic handled by ResultsDisplay
    const [cameraError, setCameraError] = useState<string | null>(null);

    const {tickets, setTickets} = useTickets();
    const state = useUserState("Connecticut");
    const {addToCollection} = useCollection();

    const videoRef = useRef<HTMLVideoElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    // Handle camera initialization and cleanup (remains the same)
    useEffect(() => {
        let stream: MediaStream | null = null;
        const videoElement = videoRef.current;

        if (captureState === 'camera') {
            const initCamera = async () => {
                try {
                    stream = await navigator.mediaDevices.getUserMedia({
                        video: {facingMode: {ideal: 'environment'}, width: {ideal: 1280}, height: {ideal: 720}},
                        audio: false,
                    });
                    if (videoElement) {
                        videoElement.srcObject = stream;
                    }
                    setCameraError(null);
                } catch (err) {
                    console.error("Camera error:", err);
                    setCameraError("Camera access denied. Please try uploading a photo instead.");
                    setCaptureState('upload');
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


    // Capture photo (remains the same)
    const capturePhoto = () => {
        if (!videoRef.current) return;

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

        canvas.toBlob((blob) => {
            if (!blob) {
                toast.error("Could not capture photo.");
                return;
            }
            const file = new File([blob], "capture.jpg", {type: "image/jpeg"});
            const imageUrl = URL.createObjectURL(blob);
            setCapturedImage(imageUrl);
            processImage(file, imageUrl);
        }, 'image/jpeg', 0.9);
    };

    // Handle file upload (remains the same)
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setCapturedImage(imageUrl);
            processImage(file, imageUrl);
        }
    };

    // Process image using your server action
    const processImage = async (file: File, imageUrl: string) => {
        if (tickets <= 0) {
            toast.error("You don't have any tickets left!");
            setCapturedImage(null);
            setCaptureState('home');
            URL.revokeObjectURL(imageUrl);
            return;
        }

        setTickets(Math.max(0, tickets - 1));
        setCaptureState('analyzing'); // Switch to analyzing state - GachaPullAnimation will now show

        try {
            const data = await analyze(file, state ?? "Connecticut");
            setResult(data); // Store result data

            // Add to collection immediately if it's a valid bird
            if (data.species.toUpperCase() !== 'NOT_BIRD') {
                addToCollection({
                    species: data.species,
                    tier: data.tier,
                    imageUrl: imageUrl // Use the passed imageUrl
                });
            } else {
                // Revoke URL immediately if it's not a bird (won't be shown in ResultsDisplay anyway)
                // and clear image state if needed.
                try {
                    URL.revokeObjectURL(imageUrl);
                } catch (e) {
                    console.warn("Error revoking Object URL for NOT_BIRD:", e);
                }
                setCapturedImage(null); // Clear image if it's not a bird
            }

            // Wait for a bit before showing results for perceived effort / animation time
            // The ResultsDisplay component handles its own reveal animation timing
            setTimeout(() => {
                setCaptureState('result'); // Switch to result state - ResultsDisplay will now show
            }, 2500); // Adjust delay as needed to match animation feel

        } catch (error) {
            console.error("Analysis failed:", error);
            toast.error("Failed to identify the bird. Please try again.");
            setCaptureState('home');
            setCapturedImage(null);
            // Only revoke if it wasn't already revoked (e.g. NOT_BIRD case)
            if (result?.species.toUpperCase() !== 'NOT_BIRD') {
                try {
                    URL.revokeObjectURL(imageUrl);
                } catch (e) {
                    console.warn("Error revoking Object URL on analysis failure:", e);
                }
            }
            setTickets(tickets + 1);
            setResult(null); // Clear result on error
        }
    };


    // Reset capture state, called by ResultsDisplay's onClose
    const resetCapture = useCallback(() => {
        // Check if image exists and wasn't already revoked (e.g. NOT_BIRD case)
        if (capturedImage && result?.species.toUpperCase() !== 'NOT_BIRD') {
            try {
                URL.revokeObjectURL(capturedImage);
            } catch (e) {
                console.warn("Failed to revoke Object URL during reset:", e);
            }
        }
        setCaptureState('home');
        setResult(null);
        setCapturedImage(null);
        // setRevealed(false); // REMOVED
        setCameraError(null);
    }, [capturedImage, result]); // Dependencies adjusted


    return (
        // Main container (remains the same)
        <div
            className="min-h-screen flex flex-col bg-gradient-to-b from-gray-800 via-indigo-900 to-black text-gray-100 font-sans">

            {/* Header (remains the same) */}
            <header
                className="bg-gradient-to-r from-indigo-800 to-purple-800 text-white p-4 shadow-md sticky top-0 z-20">
                <div className="container mx-auto flex items-center">
                    {captureState !== 'home' && captureState !== 'analyzing' && captureState !== 'result' ? (
                        <button
                            onClick={resetCapture} // Reset works for camera/upload too
                            className="p-2 mr-2 -ml-2 rounded-full hover:bg-white/10 transition-colors"
                            aria-label="Back"
                        >
                            <ArrowLeft size={24}/>
                        </button>
                    ) : (
                        // Don't show back button during analyzing/result (handled by component close)
                        captureState === 'home' && (
                            <Link href="/" className="p-2 mr-2 -ml-2 rounded-full hover:bg-white/10 transition-colors"
                                  aria-label="Go Home">
                                <ArrowLeft size={24}/>
                            </Link>
                        )
                    )}
                    {/* Conditional rendering for header title based on state */}
                    <h1 className="text-xl font-semibold">
                        {captureState === 'home' && 'Capture Bird'}
                        {captureState === 'camera' && 'Take Photo'}
                        {captureState === 'upload' && 'Upload Photo'}
                        {captureState === 'analyzing' && 'Identifying...'}
                        {captureState === 'result' && 'Capture Result'}
                    </h1>
                    {/* Ticket display (remains the same) */}
                    <div className="ml-auto flex items-center gap-2">
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path
                    d="M1.5 3A1.5 1.5 0 0 0 0 4.5V6a.5.5 0 0 0 .5.5 1.5 1.5 0 1 1 0 3 .5.5 0 0 0-.5.5v1.5A1.5 1.5 0 0 0 1.5 13h13a1.5 1.5 0 0 0 1.5-1.5V10a.5.5 0 0 0-.5-.5 1.5 1.5 0 1 1 0-3 .5.5 0 0 0 .5-.5V4.5A1.5 1.5 0 0 0 14.5 3h-13ZM1 4.5a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 .5.5v1.004a1.5 1.5 0 0 1 0 2.992V10a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5V8.504a1.5 1.5 0 0 1 0-2.992V4.5Z"/>
              </svg>
                {tickets}
            </span>
                    </div>
                </div>
            </header>

            {/* Main content area - Render components conditionally */}
            <main className={`flex-grow flex flex-col items-center ${captureState === 'camera' ? 'p-0' : 'p-6'} pt-8`}>

                {/* --- Render based on captureState --- */}

                {/* Home Screen (remains the same) */}
                {captureState === 'home' && (
                    <div className="flex flex-col items-center w-full px-4">
                        {/* ... Home screen content ... */}
                        <div className="text-center mb-8">
                            <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-yellow-300">Choose Capture
                                Method</h2>
                            <p className="text-gray-300">How will you find your next bird?</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full max-w-lg">
                            <button onClick={() => setCaptureState('camera')} disabled={tickets <= 0}
                                    className={` bg-gray-700/50 border border-gray-600/50 backdrop-blur-sm rounded-xl p-5 sm:p-6 shadow-lg hover:shadow-indigo-500/30 transform hover:-translate-y-1 transition-all duration-300 flex flex-col items-center gap-3 text-center ${tickets <= 0 ? 'opacity-50 cursor-not-allowed' : 'hover:border-indigo-400/70'} `}>
                                <div
                                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-indigo-500/30 border border-indigo-400/50 flex items-center justify-center">
                                    <Camera size={32} className="text-indigo-200"/></div>
                                <span className="font-semibold text-lg text-gray-100">Take Photo</span>
                                <span className="text-sm text-gray-300">Use your device camera</span>
                            </button>
                            <button onClick={() => setCaptureState('upload')} disabled={tickets <= 0}
                                    className={` bg-gray-700/50 border border-gray-600/50 backdrop-blur-sm rounded-xl p-5 sm:p-6 shadow-lg hover:shadow-purple-500/30 transform hover:-translate-y-1 transition-all duration-300 flex flex-col items-center gap-3 text-center ${tickets <= 0 ? 'opacity-50 cursor-not-allowed' : 'hover:border-purple-400/70'} `}>
                                <div
                                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-purple-500/30 border border-purple-400/50 flex items-center justify-center">
                                    <Upload size={32} className="text-purple-200"/></div>
                                <span className="font-semibold text-lg text-gray-100">Upload Photo</span>
                                <span className="text-sm text-gray-300">Choose from gallery</span>
                            </button>
                        </div>
                        {tickets <= 0 && (<div
                            className="mt-8 p-4 bg-red-900/50 border border-red-500/50 rounded-xl text-center max-w-lg w-full">
                            <p className="text-red-300 font-medium mb-2"> You&apos;re out of capture tickets! </p> <p
                            className="text-sm text-gray-300"> Check back later or visit the shop. </p></div>)}
                    </div>
                )}

                {/* Camera Mode (remains the same) */}
                {captureState === 'camera' && (
                    <div className="flex flex-col items-center justify-center w-full h-full flex-grow">
                        {/* ... Camera mode content ... */}
                        {cameraError ? (
                            <div className="text-center p-6 text-red-400 flex flex-col items-center gap-4"><p
                                className="max-w-md">{cameraError}</p>
                                <button onClick={() => setCaptureState('upload')}
                                        className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-full font-semibold"> Upload
                                    Photo Instead
                                </button>
                            </div>) : (<div className="relative w-full h-full flex flex-col">
                            <div className="relative flex-grow w-full overflow-hidden bg-black">
                                <video ref={videoRef} autoPlay playsInline muted
                                       className="w-full h-full object-cover"/>
                                <div
                                    className="absolute inset-2 sm:inset-4 border-2 border-white/40 rounded-lg pointer-events-none"></div>
                            </div>
                            <div
                                className="flex-shrink-0 p-4 bg-gray-900/30 backdrop-blur-sm flex flex-col items-center">
                                <button onClick={capturePhoto} aria-label="Capture Photo"
                                        className=" w-16 h-16 sm:w-20 sm:h-20 rounded-full shadow-xl flex items-center justify-center bg-gradient-to-br from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 transform hover:scale-105 active:scale-95 transition-all duration-200">
                                    <Camera size={32} className="text-gray-900"/></button>
                                <p className="text-center text-gray-300 text-sm mt-2"> Tap button to capture </p></div>
                        </div>)}
                    </div>
                )}

                {/* Upload Mode (remains the same) */}
                {captureState === 'upload' && (
                    <div className="flex flex-col items-center justify-center w-full max-w-md">
                        {/* ... Upload mode content ... */}
                        <div
                            className="w-full p-6 sm:p-8 bg-gray-700/50 border border-gray-600/50 backdrop-blur-sm rounded-xl shadow-lg text-center">
                            <div
                                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-purple-500/30 border border-purple-400/50 flex items-center justify-center mx-auto mb-5">
                                <Upload size={32} className="text-purple-200"/></div>
                            <h2 className="text-xl sm:text-2xl font-semibold mb-3 text-gray-100">Upload Bird Photo</h2>
                            <p className="mb-6 text-gray-300">Select a clear photo for identification.</p>
                            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*"
                                   className="hidden"/>
                            <button onClick={() => fileInputRef.current?.click()}
                                    className=" bg-gradient-to-br from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-gray-900 font-bold text-lg py-3 px-8 sm:py-4 sm:px-10 rounded-full shadow-lg transform active:scale-95 transition-all duration-200"> Select
                                Photo
                            </button>
                        </div>
                    </div>
                )}

                {/* Analyzing Mode - USE COMPONENT */}
                {captureState === 'analyzing' && <GachaPullAnimation/>}

                {/* Result Screen - USE COMPONENT */}
                {captureState === 'result' && result && (
                    <ResultsDisplay
                        species={result.species}
                        tier={result.tier}
                        imageUrl={capturedImage || undefined} // Pass captured image URL or undefined
                        onClose={resetCapture} // Pass the reset function
                        // onShare={() => { /* Implement share logic if desired */ }}
                    />
                )}
            </main>
        </div>
    );
}