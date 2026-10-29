'use client';

import React from 'react';
import { Play, Sparkles, Video, CheckCircle2 } from 'lucide-react';
import { VENUE_PRESETS } from '@/lib/sample-data';
import { VenueProfile } from '@/lib/types';

interface JudgeDemoGuideProps {
  onLoadScenario: (venue: VenueProfile) => void;
}

export const JudgeDemoGuide: React.FC<JudgeDemoGuideProps> = ({ onLoadScenario }) => {
  return (
    <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900/30 via-purple-900/20 to-blue-950/40 border border-blue-500/20 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            Judge & Reviewer Fast-Track Demos
          </h4>
        </div>
        <span className="text-[10px] font-mono text-zinc-400">1-Click Live Scripts</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {/* Concept 1 */}
        <button
          onClick={() => onLoadScenario(VENUE_PRESETS[0])}
          className="flex flex-col text-left p-2.5 rounded-xl bg-surface/70 hover:bg-surface border border-white/10 hover:border-blue-400/50 transition-all text-xs group"
        >
          <div className="font-semibold text-white group-hover:text-blue-400 flex items-center justify-between">
            <span>1. Executive Crisis</span>
            <Play className="w-3 h-3 text-zinc-400 group-hover:text-blue-400" />
          </div>
          <span className="text-[10px] text-zinc-400 mt-1">
            5500K Cold Auditorium wash test. Fixes chalky face with +18% warmth.
          </span>
        </button>

        {/* Concept 2 */}
        <button
          onClick={() => onLoadScenario(VENUE_PRESETS[1])}
          className="flex flex-col text-left p-2.5 rounded-xl bg-surface/70 hover:bg-surface border border-white/10 hover:border-amber-400/50 transition-all text-xs group"
        >
          <div className="font-semibold text-white group-hover:text-amber-400 flex items-center justify-between">
            <span>2. Candlelight Bistro</span>
            <Play className="w-3 h-3 text-zinc-400 group-hover:text-amber-400" />
          </div>
          <span className="text-[10px] text-zinc-400 mt-1">
            2100K Low-Lux Candle test. Fixes dark lip void with high-shine gloss.
          </span>
        </button>

        {/* Concept 3 */}
        <button
          onClick={() => onLoadScenario(VENUE_PRESETS[2])}
          className="flex flex-col text-left p-2.5 rounded-xl bg-surface/70 hover:bg-surface border border-white/10 hover:border-cyan-400/50 transition-all text-xs group"
        >
          <div className="font-semibold text-white group-hover:text-cyan-400 flex items-center justify-between">
            <span>3. Desk-to-Dinner</span>
            <Play className="w-3 h-3 text-zinc-400 group-hover:text-cyan-400" />
          </div>
          <span className="text-[10px] text-zinc-400 mt-1">
            Circadian shift: 5000K ring light to intimate 2800K gala cocktail.
          </span>
        </button>
      </div>
    </div>
  );
};
