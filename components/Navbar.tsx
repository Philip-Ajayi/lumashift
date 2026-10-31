
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
    <header className="topbar">
      <div className="topbar-inner">
        <div className="flex items-center gap-3">
          <div className="brand-mark">
            <Sparkles className="w-[18px] h-[18px]" />
          </div>

          <div>
            <div className="brand-name">LUMASHIFT</div>
            <p className="brand-caption">
              See yourself in a different light
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleConsole}
            aria-label="Toggle activity log"
            title="Activity log"
            className={`button-secondary !min-h-[38px] !px-3 ${
              isConsoleOpen ? '!border-[#c9b28a]/50 !bg-[#c9b28a]/10' : ''
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span className="hidden sm:inline">Activity</span>
          </button>

          <button
            onClick={onOpenSettings}
            aria-label="Open settings"
            title="Settings"
            className="button-secondary !min-h-[38px] !w-[38px] !p-0"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
