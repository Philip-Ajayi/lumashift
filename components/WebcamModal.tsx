
'use client';

import React, { useRef, useState, useEffect } from 'react';
import {
  Camera,
  X,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

interface WebcamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (base64Image: string) => void;
}

export const WebcamModal: React.FC<WebcamModalProps> = ({
  isOpen,
  onClose,
  onCapture,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => stopCamera();
  }, [isOpen]);

  const startCamera = async () => {
    setCameraError(null);

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: false,
      });

      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      setCameraError(
        err.message || 'Camera permission denied or device not found.'
      );
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const handleSnap = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

    stopCamera();
    onCapture(dataUrl);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-card !max-w-[600px]">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="eyebrow mb-2">Your photo</p>
            <h3 className="text-lg font-medium text-white">
              Take a picture
            </h3>
          </div>

          <button
            onClick={onClose}
            aria-label="Close camera"
            className="button-quiet p-2 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {cameraError ? (
          <div className="alert alert-error flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{cameraError}</span>
          </div>
        ) : (
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-white/[0.08]">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover -scale-x-100"
            />
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 mt-5">
          <button
            onClick={startCamera}
            className="button-secondary flex-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset camera
          </button>

          <button
            onClick={handleSnap}
            disabled={Boolean(cameraError)}
            className="button-primary flex-1"
          >
            <Camera className="w-4 h-4" />
            Take photo
          </button>
        </div>
      </div>
    </div>
  );
};
