
'use client';

import React, { useState, useRef, useCallback } from 'react';
import { VenueProfile, ChromaticCompensation } from '@/lib/types';
import { SlidersHorizontal, Sun, Loader2, Sparkles } from 'lucide-react';

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

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging.current || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));

      setSliderPos((x / rect.width) * 100);
    },
    []
  );

  const hasResult = calibratedImage && calibratedImage !== sourceImage;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">Your preview</p>
          <h2 className="text-[22px] sm:text-[28px] font-medium tracking-[-0.05em]">
            The difference is in the light.
          </h2>
        </div>

        <span className="hidden sm:flex items-center gap-2 text-[10px] text-zinc-400 pb-1">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Drag to compare
        </span>
      </div>

      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerMove={handlePointerMove}
        className="comparison-shell w-full aspect-[4/5] sm:aspect-[4/4.2] max-h-[720px] select-none cursor-ew-resize touch-pan-y"
      >
        <div className="absolute inset-0">
          <img
            src={sourceImage}
            alt="Your original photo"
            className="comparison-image"
            draggable={false}
          />

          <div className="absolute top-4 left-4 z-10 comparison-label">
            Original
          </div>
        </div>

        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            clipPath: `polygon(${sliderPos}% 0%, 100% 0%, 100% 100%, ${sliderPos}% 100%)`,
          }}
        >
          {hasResult ? (
            <img
              src={calibratedImage}
              alt="Your appearance under the selected lighting"
              className="comparison-image"
              draggable={false}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8 bg-[#18181a]">
              {isCalibrating ? (
                <>
                  <Loader2 className="w-8 h-8 text-[#c9b28a] animate-spin mb-5" />
                  <p className="text-sm font-medium text-white">
                    {calibrationStatus}
                  </p>
                  <p className="text-xs text-zinc-500 mt-2 max-w-[240px] leading-6">
                    Your new preview is on its way.
                  </p>
                </>
              ) : (
                <>
                  <Sparkles className="w-7 h-7 text-[#c9b28a] mb-4" />
                  <p className="text-sm text-zinc-200">
                    Your new look will appear here.
                  </p>
                  <p className="text-xs text-zinc-500 mt-2 leading-6">
                    Choose your lighting and start a preview.
                  </p>
                </>
              )}
            </div>
          )}

          <div className="absolute top-4 right-4 z-10 comparison-label">
            New lighting
          </div>
        </div>

        <div
          className="absolute top-0 bottom-0 comparison-divider pointer-events-none"
          style={{ left: `${sliderPos}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 comparison-handle flex items-center justify-center">
            <SlidersHorizontal className="w-4 h-4 rotate-90" />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <Sun className="w-3.5 h-3.5 text-[#c9b28a]" />
          <span>{venue.name}</span>
        </div>

        <div className="flex items-center gap-3 text-[10px] text-zinc-500 font-mono">
          <span>{venue.kelvin}K</span>
          <span>{venue.lux} lx</span>
          <span>Ra {venue.cri}</span>
        </div>
      </div>
    </div>
  );
};
