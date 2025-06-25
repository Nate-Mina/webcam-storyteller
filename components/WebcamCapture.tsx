import React, { useRef, useEffect, useState, useCallback } from 'react';
import { CameraIcon, NoCameraIcon } from '../constants';
import LoadingSpinner from './LoadingSpinner';

interface WebcamCaptureProps {
  onImageCapture: (dataUrl: string) => void;
  isProcessing: boolean;
  onWebcamError: (message: string) => void;
  onWebcamReady: () => void;
  webcamError: string | null;
}

const WebcamCapture: React.FC<WebcamCaptureProps> = ({ 
  onImageCapture, 
  isProcessing, 
  onWebcamError, 
  onWebcamReady,
  webcamError
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isWebcamActive, setIsWebcamActive] = useState<boolean>(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startWebcam = useCallback(async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } 
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          // Ensure video plays, catch potential error if user interaction is needed
          try {
            await videoRef.current.play();
            setIsWebcamActive(true);
            onWebcamReady();
          } catch (playError) {
            console.error("Error playing video stream:", playError);
            onWebcamError("Could not start webcam video. Please ensure permissions are granted and no other app is using the camera.");
            setIsWebcamActive(false);
          }
        }
      } else {
        onWebcamError("Webcam not supported by this browser.");
        setIsWebcamActive(false);
      }
    } catch (err) {
      console.error("Error accessing webcam:", err);
      if (err instanceof DOMException) {
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          onWebcamError("Webcam permission denied. Please grant access in your browser settings.");
        } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
          onWebcamError("No webcam found. Please ensure a camera is connected and enabled.");
        } else {
          onWebcamError(`Error accessing webcam: ${err.message}`);
        }
      } else {
         onWebcamError("An unknown error occurred while accessing the webcam.");
      }
      setIsWebcamActive(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onWebcamError, onWebcamReady]); // Dependencies for useCallback

  useEffect(() => {
    startWebcam();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startWebcam]); // Only re-run if startWebcam identity changes

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current && isWebcamActive) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9); // Use JPEG for smaller size
        onImageCapture(dataUrl);
      } else {
        onWebcamError("Failed to get canvas context for image capture.");
      }
    } else if (!isWebcamActive && !webcamError) {
       onWebcamError("Webcam is not active. Please enable it to capture an image.");
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 h-full">
      <h2 className="text-2xl font-semibold text-sky-300 mb-1 self-start">Webcam Feed</h2>
      <div className="relative w-full aspect-video bg-slate-700 rounded-lg shadow-lg overflow-hidden flex items-center justify-center">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted // Mute to avoid feedback if mic permission was accidentally granted
          className={`w-full h-full object-cover transition-opacity duration-300 ${isWebcamActive ? 'opacity-100' : 'opacity-0'}`}
          onLoadedData={() => { if(videoRef.current && videoRef.current.readyState >=3) setIsWebcamActive(true);}}
        />
        {!isWebcamActive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-4">
            {NoCameraIcon}
            <p className="mt-2 text-center text-sm">
              {webcamError ? webcamError : "Initializing webcam..."}
            </p>
            {webcamError && (
              <button 
                onClick={startWebcam}
                className="mt-4 bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-colors"
              >
                Retry Webcam
              </button>
            )}
          </div>
        )}
        <canvas ref={canvasRef} className="hidden"></canvas>
      </div>

      <button
        onClick={handleCapture}
        disabled={!isWebcamActive || isProcessing}
        className="w-full bg-sky-500 hover:bg-sky-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 ease-in-out flex items-center justify-center space-x-2 shadow-lg focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-75 mt-auto"
      >
        {isProcessing ? <LoadingSpinner /> : CameraIcon}
        <span>{isProcessing ? 'Analyzing Scene...' : 'Capture & Analyze Scene'}</span>
      </button>
    </div>
  );
};

export default WebcamCapture;
