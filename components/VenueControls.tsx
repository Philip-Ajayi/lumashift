'use client';

import React from 'react';
import { VenueProfile } from '@/lib/types';
import { VENUE_PRESETS } from '@/lib/sample-data';
import { Sun, Flame, Building2, Video, Globe, Camera } from 'lucide-react';

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
        return <Flame className="w-4 h-4 text-amber-500" />;
      case 'executive_webcam':
        return <Video className="w-4 h-4 text-cyan-400" />;
      case 'overcast_daylight':
        return <Sun className="w-4 h-4 text-blue-400" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex flex-col gap-5 p-5 rounded-2xl bg-surface border border-white/10">
      <div>
        <h3 className="text-sm font-semibold text-white tracking-wide uppercase">
          1. Destination Venue Optical Profile
        </h3>
        <p className="text-xs text-zinc-400 mt-1">
          Select target physical lighting environment or tune the Kelvin Planckian slider.
        </p>
      </div>

      {/* Preset Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {VENUE_PRESETS.map(preset => {
          const isSelected = selectedVenue.id === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => onSelectPreset(preset)}
              className={`flex flex-col text-left p-3 rounded-xl border transition-all ${
                isSelected
                  ? 'bg-blue-600/15 border-blue-500 text-white shadow-lg shadow-blue-500/10'
                  : 'bg-surface-elevated/50 border-white/5 text-zinc-400 hover:bg-surface-elevated hover:text-zinc-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {getIcon(preset.id)}
                <span className="font-semibold text-xs text-white truncate">{preset.name}</span>
              </div>
              <span className="text-[11px] font-mono text-blue-400">{preset.kelvin}K • {preset.lux} lx</span>
            </button>
          );
        })}
      </div>

      {/* Fine-Tuning Sliders */}
      <div className="space-y-4 pt-2 border-t border-white/5">
        {/* Kelvin */}
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-zinc-300 font-medium">Color Temperature</span>
            <span className="text-amber-400 font-mono font-semibold">{selectedVenue.kelvin} K</span>
          </div>
          <input
            type="range"
            min={1800}
            max={9000}
            step={100}
            value={selectedVenue.kelvin}
            onChange={e => onCustomChange({ kelvin: Number(e.target.value), id: 'custom' })}
            className="w-full accent-blue-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
            <span>2000K Candle</span>
            <span>3200K Studio</span>
            <span>5500K Daylight</span>
            <span>8000K Sky</span>
          </div>
        </div>

        {/* Lux Illuminance */}
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-zinc-300 font-medium">Illuminance (Lux)</span>
            <span className="text-cyan-400 font-mono font-semibold">{selectedVenue.lux} lx</span>
          </div>
          <input
            type="range"
            min={20}
            max={2000}
            step={20}
            value={selectedVenue.lux}
            onChange={e => onCustomChange({ lux: Number(e.target.value), id: 'custom' })}
            className="w-full accent-cyan-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
          />
        </div>

        {/* CRI Ra */}
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-zinc-300 font-medium">Color Rendering Index (CRI Ra)</span>
            <span className={`font-mono font-semibold ${selectedVenue.cri < 80 ? 'text-rose-400' : 'text-emerald-400'}`}>
              Ra {selectedVenue.cri} {selectedVenue.cri < 80 ? '(R9 Deficit)' : ''}
            </span>
          </div>
          <input
            type="range"
            min={50}
            max={100}
            step={1}
            value={selectedVenue.cri}
            onChange={e => onCustomChange({ cri: Number(e.target.value), id: 'custom' })}
            className="w-full accent-emerald-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
          />
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={onTriggerCalibration}
        disabled={isCalibrating}
        className="w-full mt-2 py-3 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-xl shadow-blue-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
      >
        <Camera className="w-4 h-4" />
        <span>{isCalibrating ? 'Computing Planckian Matrix...' : 'Calibrate Appearance'}</span>
      </button>
    </div>
  );
};
