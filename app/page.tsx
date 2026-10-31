
'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { DualSplitSlider } from '@/components/DualSplitSlider';
import { VenueControls } from '@/components/VenueControls';
import { MakeupApparelInspector } from '@/components/MakeupApparelInspector';
import { DevConsoleDrawer } from '@/components/DevConsoleDrawer';
import { JudgeDemoGuide } from '@/components/JudgeDemoGuide';
import { ApiSettingsModal } from '@/components/ApiSettingsModal';
import { WebcamModal } from '@/components/WebcamModal';
import { VENUE_PRESETS, DEFAULT_DEMO_PORTRAIT } from '@/lib/sample-data';
import { VenueProfile } from '@/lib/types';
import { ChromaticAgent } from '@/lib/chromatic-agent';
import { Loader2, Upload, Camera, AlertTriangle, Key } from 'lucide-react';

export default function LumaShiftStudio() {
  const [selectedVenue, setSelectedVenue] = useState<VenueProfile>(VENUE_PRESETS[0]);
  const [sourceImage, setSourceImage] = useState<string>(DEFAULT_DEMO_PORTRAIT);
  const [calibratedImage, setCalibratedImage] = useState<string>('');
  const [rawBase64, setRawBase64] = useState<string | null>(null);

  const [isCalibrating, setIsCalibrating] = useState<boolean>(false);
  const [calibrationStatus, setCalibrationStatus] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [needsApiKey, setNeedsApiKey] = useState<boolean>(false);

  const [isConsoleOpen, setIsConsoleOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isWebcamOpen, setIsWebcamOpen] = useState<boolean>(false);

  const [customKeys, setCustomKeys] = useState<{
    apiKey: string;
    apiSecret: string;
  } | null>(null);

  const agent = new ChromaticAgent();

  const [compensation, setCompensation] = useState(
    agent.synthesizeCompensation(VENUE_PRESETS[0])
  );

  const [telemetryLog, setTelemetryLog] = useState<any[]>([
    {
      step: 'System Ready',
      durationMs: 5,
      status: 'ok',
      detail: 'Appearance preview system initialized.',
    },
  ]);

  const runCalibration = async (
    venueToUse = selectedVenue,
    imgToUse = sourceImage,
    base64ToUse = rawBase64,
    overrideKeys = customKeys
  ) => {
    setIsCalibrating(true);
    setErrorMessage(null);
    setNeedsApiKey(false);
    setCalibrationStatus('Preparing your preview…');

    const start = Date.now();

    try {
      const res = await fetch('/api/calibrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: base64ToUse ? undefined : imgToUse,
          imageBase64: base64ToUse,
          venueId: venueToUse.id,
          customVenue: venueToUse,
          apiKey: overrideKeys?.apiKey,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.requiresKey || res.status === 401) {
          setNeedsApiKey(true);
        }

        throw new Error(data.error || 'Something went wrong.');
      }

      setCompensation(data.compensation);

      if (data.telemetry) {
        setTelemetryLog(prev => [
          ...prev,
          { ...data.telemetry, durationMs: Date.now() - start },
        ]);
      }

      if (data.taskId) {
        setCalibrationStatus('Creating your new look…');

        await pollCloudResult(data.taskId, overrideKeys?.apiKey);
      }
    } catch (err: any) {
      setErrorMessage(err.message);

      setTelemetryLog(prev => [
        ...prev,
        {
          step: 'Execution Error',
          durationMs: Date.now() - start,
          status: 'warn',
          detail: err.message,
        },
      ]);
    } finally {
      setIsCalibrating(false);
      setCalibrationStatus('');
    }
  };

  const pollCloudResult = async (
    taskId: string,
    apiKey?: string,
    taskType: string = 'makeup-vto'
  ) => {
    const maxAttempts = 25;

    for (let i = 0; i < maxAttempts; i++) {
      await new Promise(r => setTimeout(r, 2000));

      setCalibrationStatus(`Creating your preview… ${(i + 1) * 2}s`);

      const pollRes = await fetch('/api/calibrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'poll', taskId, apiKey, taskType }),
      });

      const pollData = await pollRes.json();

      if (pollData.status === 'success' && pollData.resultUrl) {
        setCalibratedImage(pollData.resultUrl);

        setTelemetryLog(prev => [
          ...prev,
          {
            step: 'Preview Ready',
            durationMs: (i + 1) * 2000,
            status: 'ok',
            detail: 'Your appearance preview is ready.',
          },
        ]);

        return;
      }

      if (pollData.status === 'failed') {
        throw new Error(pollData.error || 'The preview could not be created.');
      }
    }

    throw new Error('The preview took too long. Please try again.');
  };

  const handleSelectPreset = (venue: VenueProfile) => {
    setSelectedVenue(venue);
    runCalibration(venue, sourceImage, rawBase64);
  };

  const handleCustomChange = (updated: Partial<VenueProfile>) => {
    const merged = {
      ...selectedVenue,
      ...updated,
      id: 'custom' as const,
      name: 'Custom lighting',
    };

    setSelectedVenue(merged);
    setCompensation(agent.synthesizeCompensation(merged));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;

    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = async () => {
      const base64 = reader.result as string;

      setRawBase64(base64);
      setSourceImage(base64);
      setCalibratedImage('');

      await runCalibration(selectedVenue, base64, base64);
    };

    reader.readAsDataURL(file);
  };

  const handleWebcamCapture = async (capturedBase64: string) => {
    setRawBase64(capturedBase64);
    setSourceImage(capturedBase64);
    setCalibratedImage('');

    await runCalibration(selectedVenue, capturedBase64, capturedBase64);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar
        onOpenSettings={() => setIsSettingsOpen(true)}
        onToggleConsole={() => setIsConsoleOpen(prev => !prev)}
        isConsoleOpen={isConsoleOpen}
      />

      <main className="workspace flex-1">
        {/* Intro */}
        <div className="mb-8 sm:mb-10">
          <p className="eyebrow mb-3">Appearance studio</p>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-[32px] sm:text-[42px] font-medium tracking-[-0.06em] leading-tight">
                Every light tells
                <br className="sm:hidden" /> a different story.
              </h1>

              <p className="text-xs text-zinc-400 mt-4 leading-6 max-w-lg">
                See how your complexion, makeup, and clothing look in
                different lighting before you step out.
              </p>
            </div>

            <div className="flex items-center gap-2 text-[10px] text-zinc-500 pb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#a8c7ad]" />
              Appearance workspace
            </div>
          </div>
        </div>

        {/* Missing API key */}
        {needsApiKey && (
          <div className="alert alert-warning flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-start gap-3">
              <Key className="w-4 h-4 shrink-0 mt-1" />

              <div>
                <p className="text-xs font-medium">
                  Connect Perfect Corp to create live previews
                </p>

                <p className="text-[11px] mt-1 opacity-80">
                  Add your API credentials to continue.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="button-secondary !min-h-[36px]"
            >
              Connect account
            </button>
          </div>
        )}

        {/* Error notification */}
        {errorMessage && !needsApiKey && (
          <div className="alert alert-error flex items-start justify-between gap-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>

            <button
              onClick={() => setErrorMessage(null)}
              className="text-[10px] underline shrink-0"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Optional lighting inspiration */}
        <JudgeDemoGuide onLoadScenario={handleSelectPreset} />

        {/* Main workspace */}
        <div className="workspace-grid">
          <div className="workspace-column">
            <DualSplitSlider
              sourceImage={sourceImage}
              calibratedImage={calibratedImage}
              venue={selectedVenue}
              compensation={compensation}
              isCalibrating={isCalibrating}
              calibrationStatus={calibrationStatus}
            />

            {/* Photo actions */}
            <div className="panel">
              <div className="panel-content !py-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium text-zinc-200">
                      Use your own photo
                    </p>

                    <p className="text-[10px] text-zinc-500 mt-1">
                      Upload a photo or take one with your camera.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setIsWebcamOpen(true)}
                      disabled={isCalibrating}
                      className="button-secondary"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      Take photo
                    </button>

                    <label className="button-primary !min-h-[42px] cursor-pointer">
                      <Upload className="w-3.5 h-3.5" />
                      Upload photo

                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={isCalibrating}
                      />
                    </label>
                  </div>
                </div>

                {isCalibrating && (
                  <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/[0.06]">
                    <Loader2 className="w-4 h-4 text-[#c9b28a] animate-spin" />

                    <p className="text-[11px] text-zinc-300">
                      {calibrationStatus}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="workspace-column">
            <VenueControls
              selectedVenue={selectedVenue}
              onSelectPreset={handleSelectPreset}
              onCustomChange={handleCustomChange}
              isCalibrating={isCalibrating}
              onTriggerCalibration={() =>
                runCalibration(selectedVenue, sourceImage, rawBase64)
              }
            />

            <MakeupApparelInspector compensation={compensation} />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-5 border-t border-white/[0.06] flex flex-col sm:flex-row justify-between gap-3">
          <p className="text-[10px] text-zinc-500">
            LumaShift · Appearance Studio
          </p>

          <p className="text-[10px] text-zinc-600">
            Explore your look in a different light.
          </p>
        </footer>
      </main>

      <WebcamModal
        isOpen={isWebcamOpen}
        onClose={() => setIsWebcamOpen(false)}
        onCapture={handleWebcamCapture}
      />

      <DevConsoleDrawer
        isOpen={isConsoleOpen}
        onClose={() => setIsConsoleOpen(false)}
        telemetryLog={telemetryLog}
      />

      <ApiSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSaveKeys={(key, secret) => {
          const keys = { apiKey: key, apiSecret: secret };

          setCustomKeys(keys);

          runCalibration(selectedVenue, sourceImage, rawBase64, keys);
        }}
      />
    </div>
  );
}
