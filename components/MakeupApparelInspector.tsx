'use client';

import React from 'react';
import { ChromaticCompensation } from '@/lib/types';
import { Layers, ShieldAlert, Sparkles, Check, Shirt } from 'lucide-react';

interface MakeupApparelInspectorProps {
  compensation: ChromaticCompensation;
}

export const MakeupApparelInspector: React.FC<MakeupApparelInspectorProps> = ({
  compensation,
}) => {
  const { foundation, lip, contour, apparel, diagnostics } = compensation;

  return (
    <div className="flex flex-col gap-4 p-5 rounded-2xl bg-surface border border-white/10">
      <div>
        <h3 className="text-sm font-semibold text-white tracking-wide uppercase flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-400" />
          <span>2. Parametric Formulation & Apparel Matrix</span>
        </h3>
        <p className="text-xs text-zinc-400 mt-1">
          Exact YouCam REST API payload dispatched to neutralize optical color shift.
        </p>
      </div>

      {/* Foundation & Lip Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Foundation */}
        <div className="p-3.5 rounded-xl bg-surface-elevated/60 border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-200">Foundation Calibration</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">
              {foundation.undertoneShiftDelta > 0 ? `+${foundation.undertoneShiftDelta}% Warmth` : `${foundation.undertoneShiftDelta}% Cool`}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg shadow-inner border border-white/20 shrink-0"
              style={{ backgroundColor: foundation.hex }}
            />
            <div className="text-xs space-y-0.5 font-mono">
              <div className="text-white font-bold">{foundation.hex}</div>
              <div className="text-zinc-400 text-[11px]">Coverage: {foundation.coverage}% • Glow: {foundation.glow}%</div>
            </div>
          </div>
        </div>

        {/* Lipstick */}
        <div className="p-3.5 rounded-xl bg-surface-elevated/60 border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-200">Lip Formulation</span>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300">
              {lip.texture} Finish
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg shadow-inner border border-white/20 shrink-0"
              style={{ backgroundColor: lip.hex }}
            />
            <div className="text-xs space-y-0.5 font-mono">
              <div className="text-white font-bold">{lip.hex}</div>
              <div className="text-zinc-400 text-[11px]">
                Intensity: {lip.intensity}% • Suppr: {lip.specularSuppression}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contour & Anti-Glare Apparel Row */}
      <div className="p-3.5 rounded-xl bg-surface-elevated/60 border border-white/5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shirt className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-semibold text-white">Apparel V3 Anti-Glare Ensemble</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            {apparel.antiGlareRating}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg shadow-inner border border-white/20 shrink-0"
            style={{ backgroundColor: apparel.recommendedHex }}
          />
          <div className="text-xs">
            <div className="text-white font-medium">{apparel.garmentType}</div>
            <div className="text-zinc-400 text-[11px] font-mono">
              Finish: {apparel.fabricFinish} • Contrast: {apparel.contrastRatio}
            </div>
          </div>
        </div>
      </div>

      {/* Diagnostic Alert Box */}
      <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-500/20 text-xs space-y-1">
        <div className="flex items-center gap-1.5 text-blue-400 font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Chromatic Agent Optical Assessment</span>
        </div>
        <p className="text-zinc-300 leading-relaxed text-[11px]">
          {diagnostics.technicalExplanation}
        </p>
        {diagnostics.r9DeficiencyWarning && (
          <div className="flex items-center gap-1 text-amber-400 text-[11px] pt-1">
            <ShieldAlert className="w-3 h-3" />
            <span>Low venue CRI detected: Injected +15% peach subcutaneous compensator.</span>
          </div>
        )}
      </div>
    </div>
  );
};
