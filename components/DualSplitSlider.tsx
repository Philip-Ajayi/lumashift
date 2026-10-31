'use client';

import React, { useState, useRef, useCallback } from 'react';
import { VenueProfile, ChromaticCompensation } from '@/lib/types';
import { Sliders, Sun, ShieldAlert, Sparkles, Loader2 } from 'lucide-react';

interface DualSplitSliderProps {
  sourceImage: string;
  calibratedImage: string;
  venue: VenueProfile;
  compensation: ChromaticCompensation;
  isCalibrating: boolean;
  calibrationStatus: string;
}

export const DualSplitSlider: React.FC<DualSplitSliderProps> = ({
  sourceImage,
  calibratedImage,
  venue,
  compensation,
  isCalibrating,
  calibrationStatus,
}) => {
  const [sliderPos, setSliderPos] = useState<number>(50);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isDragging = useRef<boolean>(false);

  const handlePointerDown = () => {
    isDragging.current = true;
  };
  const handlePointerUp = () => {
    isDragging.current = false;
  };

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    setSliderPos((x / rect.width) * 100);
  }, []);

  const hasResult = calibratedImage && calibratedImage !== sourceImage;

  return (
    <div className="relative flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between text-xs text-zinc-400">
        <div className="flex items-center gap-1.5 text-rose-400 font-medium">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>LEFT: Original Uncalibrated Portrait</span>
        </div>
        <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          <span>RIGHT: Live YouCam S2S AI Output</span>
        </div>
      </div>

      {/* Split Viewer */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerMove={handlePointerMove}
        className="relative w-full aspect-[4/5] sm:aspect-[16/11] max-h-[640px] rounded-2xl overflow-hidden select-none cursor-ew-resize border border-white/10 shadow-2xl bg-black"
      >
        {/* Layer 1: Left - Original Uncalibrated Photo */}
        <div className="absolute inset-0 w-full h-full">
          <img
            src={sourceImage}
            alt="Original Portrait"
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-lg bg-black/75 backdrop-blur-md border border-rose-500/30 text-rose-300 text-xs font-mono">
            Original Input
          </div>
        </div>

        {/* Layer 2: Right - Live YouCam Result */}
        <div
          className="absolute inset-0 w-full h-full overflow-hidden"
          style={{ clipPath: `polygon(${sliderPos}% 0%, 100% 0%, 100% 100%, ${sliderPos}% 100%)` }}
        >
          {hasResult ? (
            <img
              src={calibratedImage}
              alt="YouCam Live Result"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-zinc-950 flex flex-col items-center justify-center p-6 text-center text-zinc-400">
              {isCalibrating ? (
                <>
                  <Loader2 className="w-8 h-8 animate-spin text-blue-400 mb-3" />
                  <p className="text-sm font-semibold text-white">{calibrationStatus}</p>
                  <p className="text-xs text-zinc-500 mt-1">Perfect Corp GPU cluster is rendering your try-on...</p>
                </>
              ) : (
                <>
                  <Sparkles className="w-8 h-8 text-blue-400/50 mb-2" />
                  <p className="text-sm text-zinc-300">Click &quot;Calibrate Appearance&quot; to run YouCam S2S Virtual Try-On.</p>
                </>
              )}
            </div>
          )}

          <div className="absolute top-4 right-4 z-10 px-3 py-1.5 rounded-lg bg-black/75 backdrop-blur-md border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>YouCam S2S Render</span>
          </div>
        </div>

        {/* Slider Divider Bar */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)] pointer-events-none"
          style={{ left: `${sliderPos}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-black flex items-center justify-center shadow-xl">
            <Sliders className="w-4 h-4 rotate-90" />
          </div>
        </div>
      </div>

      {/* Target Venue Specs */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-surface border border-white/5 text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <Sun className="w-4 h-4 text-amber-400" />
          <span>Destination Illuminant: <strong className="text-white">{venue.kelvin}K</strong></span>
        </div>
        <div>Lux: <strong className="text-white">{venue.lux} lx</strong></div>
        <div>CRI Ra: <strong className="text-white">{venue.cri}</strong></div>
        <div className="text-blue-400 font-mono">Drag slider to compare</div>
      </div>
    </div>
  );
};