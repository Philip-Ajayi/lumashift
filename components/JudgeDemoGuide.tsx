
'use client';

import React from 'react';
import { Play, Sun, Flame, BriefcaseBusiness } from 'lucide-react';
import { VENUE_PRESETS } from '@/lib/sample-data';
import { VenueProfile } from '@/lib/types';

interface JudgeDemoGuideProps {
  onLoadScenario: (venue: VenueProfile) => void;
}

export const JudgeDemoGuide: React.FC<JudgeDemoGuideProps> = ({
  onLoadScenario,
}) => {
  const scenarios = [
    {
      venue: VENUE_PRESETS[0],
      title: 'Under bright lights',
      description: 'See how your look changes in a bright indoor setting.',
      icon: <Sun className="w-4 h-4" />,
    },
    {
      venue: VENUE_PRESETS[1],
      title: 'A warm evening',
      description: 'Explore a softer, candlelit atmosphere.',
      icon: <Flame className="w-4 h-4" />,
    },
    {
      venue: VENUE_PRESETS[2],
      title: 'From work to dinner',
      description: 'Take your look from daylight to a warm evening.',
      icon: <BriefcaseBusiness className="w-4 h-4" />,
    },
  ];

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="eyebrow mb-2">A few places to start</p>
          <h2 className="text-base font-medium tracking-tight">
            Explore different lighting
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {scenarios.map((scenario, index) => (
          <button
            key={index}
            onClick={() => onLoadScenario(scenario.venue)}
            className="group text-left p-4 rounded-2xl bg-[#121215] border border-white/[0.07] hover:border-[#c9b28a]/40 hover:bg-[#19191d] transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-9 h-9 rounded-xl bg-white/[0.04] text-[#c9b28a] flex items-center justify-center">
                {scenario.icon}
              </div>

              <Play className="w-3.5 h-3.5 text-zinc-500 group-hover:text-[#c9b28a] transition-colors" />
            </div>

            <h3 className="text-xs font-medium text-zinc-100">
              {scenario.title}
            </h3>

            <p className="text-[11px] text-zinc-500 leading-5 mt-2">
              {scenario.description}
            </p>
          </button>
        ))}
      </div>
    </section>
  );
};
