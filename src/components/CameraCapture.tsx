"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";

interface Props {
  onShot: (file: File) => void;
  disabled?: boolean;
}

export default function CameraCapture({ onShot, disabled = false }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [error, setError] = useState<string>();
  const [isCameraReady, setIsCameraReady] = useState(false);

  useEffect(() => {
    let isActive = true;
    const videoElement = videoRef.current;
    let mediaStream: MediaStream | null = null;

    async function startCamera() {
      if (!navigator.mediaDevices?.getUserMedia) {
        if (isActive) setError("Camera API not supported by this browser.");
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 },
            aspectRatio: { ideal: 16 / 9 }
          },
          audio: false
        });
        mediaStream = stream;
        if (isActive && videoElement) {
          videoElement.srcObject = stream;
          videoElement.onloadedmetadata = () => {
            if (isActive) setIsCameraReady(true);
          };
          setError(undefined);
        } else {
          stream.getTracks().forEach((t) => t.stop());
        }
      } catch (err) {
        console.error("Camera access error:", err);
        if (isActive) {
          if (err instanceof Error && err.name === "NotAllowedError") {
            setError(
              "Camera access denied. Please grant permission. You can still upload a photo."
            );
          } else if (err instanceof Error && err.name === "NotFoundError") {
            setError("No camera found. You can still upload a photo.");
          } else {
            setError("Could not access camera. You can still upload a photo.");
          }
        }
      }
    }

    startCamera();

    return () => {
      isActive = false;
      mediaStream?.getTracks().forEach((t) => t.stop());
      if (videoElement) {
        videoElement.srcObject = null;
      }
      setIsCameraReady(false);
    };
  }, []);

  const shoot = useCallback(() => {
    const videoElement = videoRef.current;
    if (!videoElement || !isCameraReady || disabled) return;

    if (!canvasRef.current) canvasRef.current = document.createElement("canvas");
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) {
      console.error("Could not get 2D context from canvas");
      setError("Failed to capture image (canvas context error).");
      return;
    }

    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (!blob) {
        console.error("Canvas toBlob returned null");
        setError("Failed to capture image (blob creation failed).");
        return;
      }
      const fileName = `capture-${Date.now()}.jpg`;
      const file = new File([blob], fileName, { type: "image/jpeg" });
      onShot(file);
    }, "image/jpeg", 0.92);
  }, [onShot, isCameraReady, disabled]);

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {error ? (
        <div className="w-full p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 rounded-lg text-center">
          <p className="text-red-700 dark:text-red-300 font-medium">{error}</p>
        </div>
      ) : (
        <>
          <div className="w-full aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden shadow-md relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                isCameraReady ? "opacity-100" : "opacity-0"
              }`}
            />
            {!isCameraReady && !error && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">Starting camera...</p>
              </div>
            )}
          </div>
          <button
            onClick={shoot}
            className={`px-8 py-3 rounded-lg text-lg font-semibold transition-all duration-200 ease-in-out transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900 ${
              disabled || !isCameraReady
                ? "bg-gray-400 dark:bg-gray-600 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white shadow-md hover:shadow-lg"
            }`}
            disabled={disabled || !isCameraReady}
          >
            {isCameraReady ? "Capture Bird" : "Camera Loading..."}
          </button>
        </>
      )}
    </div>
  );
}
