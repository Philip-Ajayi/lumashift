'use client';

import React, { useState } from 'react';
import { X, Key, ShieldCheck, Check } from 'lucide-react';

interface ApiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveKeys: (key: string, secret: string) => void;
}

export const ApiSettingsModal: React.FC<ApiSettingsModalProps> = ({
  isOpen,
  onClose,
  onSaveKeys,
}) => {
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveKeys(apiKey, apiSecret);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md p-6 rounded-2xl bg-surface border border-white/15 shadow-2xl text-white">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-surface-elevated"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <Key className="w-5 h-5 text-blue-400" />
          <h3 className="text-base font-bold">YouCam / Perfect Corp API Keys</h3>
        </div>

        <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
          Optionally input your credentials to route to live Perfect Corp servers. If left blank, LumaShift operates seamlessly in high-fidelity mathematical physics sandbox mode.
        </p>

        <form onSubmit={handleSave} className="space-y-3.5">
          <div>
            <label className="block text-xs font-mono text-zinc-300 mb-1">
              YOUCAM_API_KEY
            </label>
            <input
              type="password"
              placeholder="Enter your Perfect Corp API Key"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-surface-elevated border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-zinc-300 mb-1">
              YOUCAM_API_SECRET
            </label>
            <input
              type="password"
              placeholder="Enter your Client Secret"
              value={apiSecret}
              onChange={e => setApiSecret(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-surface-elevated border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-300 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
            <span>Developer voucher code: <strong>ytmakerthrive</strong> (500 free units)</span>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold text-xs flex items-center justify-center gap-2 transition-colors mt-2"
          >
            {saved ? (
              <>
                <Check className="w-4 h-4" />
                <span>Saved!</span>
              </>
            ) : (
              <span>Save & Connect</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
