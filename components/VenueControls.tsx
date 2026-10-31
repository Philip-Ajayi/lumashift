
'use client';

import React from 'react';
import { VenueProfile } from '@/lib/types';
import { VENUE_PRESETS } from '@/lib/sample-data';
import {
  Sun,
  Flame,
  Building2,
  Video,
  Globe,
  Camera,
} from 'lucide-react';

interface VenueControlsProps {
  selectedVenue: VenueProfile;
  onSelectPreset: (venue: VenueProfile) => void;
  onCustomChange: (updated: Partial<VenueProfile>) => void;
  isCalibrating: boolean;
  onTriggerCalibration: () => void;
}

export const VenueControls: React.FC<VenueControlsProps> = ({
  selectedVenue,
  onSelectPreset,
  onCustomChange,
  isCalibrating,
  onTriggerCalibration,
}) => {
  const getIcon = (id: string) => {
    switch (id) {
      case 'auditorium':
        return <Building2 className="w-4 h-4" />;
      case 'candlelight_bistro':
        return <Flame className="w-4 h-4" />;
      case 'executive_webcam':
        return <Video className="w-4 h-4" />;
      case 'overcast_daylight':
        return <Sun className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  return (
    <section className="panel">
      <div className="panel-content">
        <div className="panel-header">
          <div>
            <p className="eyebrow mb-2">01 / Lighting</p>
            <h3 className="section-title">Set the scene</h3>
            <p className="section-description mt-2">
              Choose a setting or adjust the light yourself.
            </p>
          </div>
        </div>

        <div className="preset-grid">
          {VENUE_PRESETS.map(preset => {
            const isSelected = selectedVenue.id === preset.id;

            return (
              <button
                key={preset.id}
                onClick={() => onSelectPreset(preset)}
                data-selected={isSelected}
                className="preset-card"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isSelected
                        ? 'bg-[#c9b28a]/15 text-[#c9b28a]'
                        : 'bg-white/[0.04] text-zinc-400'
                    }`}
                  >
                    {getIcon(preset.id)}
                  </div>

                  <span className="preset-name truncate">
                    {preset.name}
                  </span>
                </div>

                <p className="preset-detail">
                  {preset.kelvin}K · {preset.lux} lx
                </p>
              </button>
            );
          })}
        </div>

        <div className="mt-6 space-y-6">
          <div className="control-group">
            <div className="control-row">
              <label className="control-label">
                Color temperature
              </label>
              <span className="control-value">
                {selectedVenue.kelvin.toLocaleString()} K
              </span>
            </div>

            <input
              type="range"
              min={1800}
              max={9000}
              step={100}
              value={selectedVenue.kelvin}
              onChange={e =>
                onCustomChange({
                  kelvin: Number(e.target.value),
                  id: 'custom',
                })
              }
            />

            <div className="flex justify-between mt-3 text-[10px] text-zinc-500">
              <span>Warm</span>
              <span>Neutral</span>
              <span>Cool</span>
            </div>
          </div>

          <div>
            <div className="control-row">
              <label className="control-label">
                Light intensity
              </label>
              <span className="control-value">
                {selectedVenue.lux} lx
              </span>
            </div>

            <input
              type="range"
              min={20}
              max={2000}
              step={20}
              value={selectedVenue.lux}
              onChange={e =>
                onCustomChange({
                  lux: Number(e.target.value),
                  id: 'custom',
                })
              }
            />

            <div className="flex justify-between mt-3 text-[10px] text-zinc-500">
              <span>Soft</span>
              <span>Bright</span>
            </div>
          </div>

          <div>
            <div className="control-row">
              <label className="control-label">
                Color accuracy
              </label>
              <span
                className={`control-value ${
                  selectedVenue.cri < 80 ? '!text-[#e2a5a5]' : ''
                }`}
              >
                Ra {selectedVenue.cri}
              </span>
            </div>

            <input
              type="range"
              min={50}
              max={100}
              step={1}
              value={selectedVenue.cri}
              onChange={e =>
                onCustomChange({
                  cri: Number(e.target.value),
                  id: 'custom',
                })
              }
            />

            <div className="flex justify-between mt-3 text-[10px] text-zinc-500">
              <span>Lower accuracy</span>
              <span>Higher accuracy</span>
            </div>
          </div>
        </div>

        <div className="mt-7">
          <button
            onClick={onTriggerCalibration}
            disabled={isCalibrating}
            className="button-primary w-full"
          >
            <Camera className="w-4 h-4" />
            {isCalibrating ? 'Creating your preview…' : 'Create new preview'}
          </button>

          <p className="text-center text-[10px] text-zinc-500 mt-3">
            Your original photo stays unchanged.
          </p>
        </div>
      </div>
    </section>
  );
};
