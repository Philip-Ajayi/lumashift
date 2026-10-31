
'use client';

import React from 'react';
import {
  Terminal,
  X,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';

interface DevConsoleDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  telemetryLog: Array<{
    step: string;
    durationMs: number;
    status: 'ok' | 'warn' | 'info';
    detail: string;
  }>;
}

export const DevConsoleDrawer: React.FC<DevConsoleDrawerProps> = ({
  isOpen,
  onClose,
  telemetryLog,
}) => {
  if (!isOpen) return null;

  return (
    <aside
      aria-label="Activity log"
      className="console-panel fixed bottom-0 right-0 z-50 w-full sm:w-[440px] h-[420px] flex flex-col rounded-t-2xl sm:rounded-tl-2xl"
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07]">
        <div className="flex items-center gap-3">
          <Terminal className="w-4 h-4 text-[#c9b28a]" />

          <div>
            <h3 className="text-sm font-medium text-white">
              Activity
            </h3>

            <p className="text-[10px] text-zinc-500 mt-1">
              {telemetryLog.length} recorded events
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          aria-label="Close activity"
          className="button-quiet p-2 rounded-lg"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-2">
        {telemetryLog.length === 0 ? (
          <div className="text-xs text-zinc-500 py-8 text-center">
            Nothing here yet.
          </div>
        ) : (
          telemetryLog.map((log, idx) => (
            <div key={idx} className="console-event">
              <div className="flex items-start gap-3">
                {log.status === 'ok' && (
                  <CheckCircle2 className="w-4 h-4 text-[#a8c7ad] shrink-0 mt-0.5" />
                )}

                {log.status === 'warn' && (
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                )}

                {log.status === 'info' && (
                  <Info className="w-4 h-4 text-[#a6b9ff] shrink-0 mt-0.5" />
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-medium text-zinc-200">
                      {log.step}
                    </p>

                    <span className="text-[10px] text-zinc-500 font-mono shrink-0">
                      {log.durationMs}ms
                    </span>
                  </div>

                  <p className="text-[11px] text-zinc-500 leading-5 mt-2">
                    {log.detail}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="px-5 py-3 border-t border-white/[0.07] flex items-center justify-between text-[10px] text-zinc-500">
        <span>Session activity</span>
        <span>{telemetryLog.length} events</span>
      </div>
    </aside>
  );
};
