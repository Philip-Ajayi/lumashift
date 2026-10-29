'use client';

import React, { useRef, useEffect } from 'react';
import { kelvinToRGB } from '@/lib/optical-physics';

interface ViewportSimulatorProps {
  imageSrc: string;
  kelvin: number;
  lux: number;
  cri: number;
  applyCompensation: boolean;
  compensationHex?: string;
  foundationShift?: number;
  className?: string;
}

export const ViewportSimulator: React.FC<ViewportSimulatorProps> = ({
  imageSrc,
  kelvin,
  lux,
  cri,
  applyCompensation,
  foundationShift = 0,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();

    // Only set crossOrigin for remote URLs; data: or blob: will throw a SecurityError in some browsers
    if (!imageSrc.startsWith('data:') && !imageSrc.startsWith('blob:')) {
      img.crossOrigin = 'anonymous';
    }
    img.src = imageSrc;

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const illuminant = kelvinToRGB(kelvin);
        const lightFactor = {
          r: illuminant.r / 255,
          g: illuminant.g / 255,
          b: illuminant.b / 255,
        };

        const luxScale = Math.min(1.4, Math.max(0.4, lux / 450));
        const redDrop = cri < 80 ? (80 - cri) * 0.006 : 0;

        for (let i = 0; i < data.length; i += 4) {
          let r = data[i];
          let g = data[i + 1];
          let b = data[i + 2];

          if (applyCompensation) {
            const compGain = 1 + (foundationShift / 100) * 0.4;
            r = r * compGain;
            g = g * (1 + (foundationShift > 0 ? -0.05 : 0.05));
          }

          r = r * lightFactor.r * (1 - redDrop) * luxScale;
          g = g * lightFactor.g * luxScale;
          b = b * lightFactor.b * luxScale;

          data[i] = Math.min(255, Math.max(0, r));
          data[i + 1] = Math.min(255, Math.max(0, g));
          data[i + 2] = Math.min(255, Math.max(0, b));
        }

        ctx.putImageData(imageData, 0, 0);
      } catch (e) {
        // Fallback: draw original image if cross-origin restrictions block pixel read
        ctx.drawImage(img, 0, 0);
      }
    };
  }, [imageSrc, kelvin, lux, cri, applyCompensation, foundationShift]);

  return (
    <div className={`relative overflow-hidden rounded-xl bg-black ${className}`}>
      <canvas ref={canvasRef} className="w-full h-full object-cover rounded-xl" />
    </div>
  );
};
