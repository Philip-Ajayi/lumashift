
'use client';

import React, { useState } from 'react';
import { X, KeyRound, ShieldCheck, Check } from 'lucide-react';

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
    <div className="modal-backdrop">
      <div className="modal-card relative text-white">
        <button
          onClick={onClose}
          aria-label="Close settings"
          className="absolute top-5 right-5 button-quiet p-2 rounded-lg"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-11 h-11 rounded-xl bg-[#c9b28a]/10 text-[#c9b28a] flex items-center justify-center mb-5">
          <KeyRound className="w-5 h-5" />
        </div>

        <p className="eyebrow mb-2">Settings</p>

        <h3 className="text-xl font-medium tracking-tight">
          Connect your account
        </h3>

        <p className="text-xs text-zinc-400 leading-6 mt-3 mb-7">
          Add your Perfect Corp credentials to create live appearance previews.
        </p>

        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="field-label">
              API key
            </label>

            <input
              type="password"
              placeholder="Enter your API key"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              className="field-input"
            />
          </div>

          <div>
            <label className="field-label">
              API secret
            </label>

            <input
              type="password"
              placeholder="Enter your API secret"
              value={apiSecret}
              onChange={e => setApiSecret(e.target.value)}
              className="field-input"
            />
          </div>

          <div className="flex gap-3 rounded-xl bg-white/[0.025] border border-white/[0.06] p-3.5">
            <ShieldCheck className="w-4 h-4 text-[#a8c7ad] shrink-0 mt-0.5" />

            <p className="text-[10px] text-zinc-400 leading-5">
              Keep your credentials private. Only use keys issued to your account.
            </p>
          </div>

          <button type="submit" className="button-primary w-full">
            {saved ? (
              <>
                <Check className="w-4 h-4" />
                Saved
              </>
            ) : (
              'Save credentials'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
