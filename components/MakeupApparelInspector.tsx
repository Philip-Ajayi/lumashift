
'use client';

import React from 'react';
import { ChromaticCompensation } from '@/lib/types';
import { Layers, Shirt, Sparkles, ShieldAlert } from 'lucide-react';

interface MakeupApparelInspectorProps {
  compensation: ChromaticCompensation;
}

export const MakeupApparelInspector: React.FC<
  MakeupApparelInspectorProps
> = ({ compensation }) => {
  const { foundation, lip, apparel, diagnostics } = compensation;

  return (
    <section className="panel">
      <div className="panel-content">
        <div className="panel-header">
          <div>
            <p className="eyebrow mb-2">02 / Appearance</p>
            <h3 className="section-title">Your look, refined</h3>
            <p className="section-description mt-2">
              Colors and finishes suggested for this lighting.
            </p>
          </div>

          <Layers className="w-4 h-4 text-[#c9b28a]" />
        </div>

        <div className="space-y-3">
          <div className="result-card">
            <div className="flex items-center justify-between mb-4">
              <span className="result-name">Complexion</span>
              <span className="text-[10px] text-zinc-500">
                {foundation.undertoneShiftDelta > 0
                  ? `+${foundation.undertoneShiftDelta}% warmth`
                  : `${foundation.undertoneShiftDelta}% cool`}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div
                className="color-swatch"
                style={{ backgroundColor: foundation.hex }}
              />

              <div>
                <p className="text-xs font-medium text-white">
                  {foundation.hex}
                </p>
                <p className="result-meta mt-1">
                  Coverage {foundation.coverage}% · Glow {foundation.glow}%
                </p>
              </div>
            </div>
          </div>

          <div className="result-card">
            <div className="flex items-center justify-between mb-4">
              <span className="result-name">Lip color</span>
              <span className="text-[10px] text-zinc-500">
                {lip.texture} finish
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div
                className="color-swatch"
                style={{ backgroundColor: lip.hex }}
              />

              <div>
                <p className="text-xs font-medium text-white">
                  {lip.hex}
                </p>
                <p className="result-meta mt-1">
                  Intensity {lip.intensity}% · Shine {lip.specularSuppression}%
                </p>
              </div>
            </div>
          </div>

          <div className="result-card">
            <div className="flex items-center justify-between mb-4">
              <span className="result-name">Clothing</span>
              <Shirt className="w-4 h-4 text-[#c9b28a]" />
            </div>

            <div className="flex items-center gap-3">
              <div
                className="color-swatch"
                style={{ backgroundColor: apparel.recommendedHex }}
              />

              <div>
                <p className="text-xs font-medium text-white">
                  {apparel.garmentType}
                </p>
                <p className="result-meta mt-1">
                  {apparel.fabricFinish} · {apparel.contrastRatio} contrast
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
              <span className="text-[10px] text-zinc-500">
                Glare resistance
              </span>
              <span className="text-[10px] text-[#a8c7ad]">
                {apparel.antiGlareRating}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-xl bg-white/[0.025] border border-white/[0.06] p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#c9b28a]" />
            <span className="text-xs font-medium text-zinc-200">
              A note on this look
            </span>
          </div>

          <p className="text-[11px] text-zinc-400 leading-6">
            {diagnostics.technicalExplanation}
          </p>

          {diagnostics.r9DeficiencyWarning && (
            <div className="flex gap-2 mt-3 text-[10px] text-amber-300 leading-5">
              <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>
                Color accuracy is limited in this setting. A warmer complexion
                adjustment has been applied.
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
