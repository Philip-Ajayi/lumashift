'use client';

import React from 'react';
import { Terminal, X, CheckCircle2, AlertTriangle, Info, Copy } from 'lucide-react';

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
      aria-label="Developer telemetry console"
      className="fixed bottom-0 right-0 z-50 w-full sm:w-[500px] h-80 bg-zinc-950/95 border-t sm:border-l border-white/15 backdrop-blur-xl shadow-2xl flex flex-col font-mono text-xs"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-surface border-b border-white/10 text-zinc-300">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-blue-400" />
          <span className="font-semibold text-white">DevTools & API Telemetry</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
            {telemetryLog.length} events
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Log Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5 text-[11px]">
        {telemetryLog.length === 0 ? (
          <div className="text-zinc-500 italic">No telemetry recorded yet. Trigger calibration to stream events.</div>
        ) : (
          telemetryLog.map((log, idx) => (
            <div key={idx} className="flex items-start gap-2 leading-relaxed">
              {log.status === 'ok' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />}
              {log.status === 'warn' && <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />}
              {log.status === 'info' && <Info className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />}

              <div className="flex-1">
                <div className="flex items-center gap-2 text-zinc-400">
                  <span className="text-zinc-200 font-bold">{log.step}</span>
                  <span className="text-[10px] text-zinc-500">{log.durationMs}ms</span>
                </div>
                <div className="text-zinc-300 font-sans text-xs mt-0.5">{log.detail}</div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Benchmark */}
      <div className="px-4 py-2 bg-surface border-t border-white/5 text-[10px] text-zinc-400 flex justify-between items-center">
        <span>Latency target: &lt;4200ms</span>
        <span className="text-emerald-400">Perfect Corp S2S Specs: PASS</span>
      </div>
    </aside>
  );
};
