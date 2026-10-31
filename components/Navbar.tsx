'use client';

import React from 'react';
import { Sparkles, Terminal, Settings } from 'lucide-react';

interface NavbarProps {
  onOpenSettings: () => void;
  onToggleConsole: () => void;
  isConsoleOpen: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSettings,
  onToggleConsole,
  isConsoleOpen,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-cyan-400 to-amber-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Sparkles className="w-5 h-5 text-black font-bold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-wider text-white">LUMASHIFT</span>
              <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                YouCam Live S2S
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 hidden sm:block">
              Target Illuminant Calibration to YouCam Neural Virtual Try-On
            </p>
          </div>
        </div>

        {/* Live Engine Indicator */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-white/10 text-xs text-zinc-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Engine:</span>
            <span className="text-white font-mono text-[11px]">
              Perfect Corp Cloud S2S (Live Production)
            </span>
          </div>

          {/* DevTools Drawer Toggle */}
          <button
            onClick={onToggleConsole}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${
              isConsoleOpen
                ? 'bg-blue-600 text-white border-blue-400'
                : 'bg-surface hover:bg-surface-elevated text-zinc-300 border-white/10'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Telemetry</span>
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg bg-surface hover:bg-surface-elevated text-zinc-300 border border-white/10 transition-colors"
            title="API Credentials & Configuration"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};