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
import { Loader2, Upload, Camera, AlertTriangle } from 'lucide-react';

export default function LumaShiftStudio() {
  const [selectedVenue, setSelectedVenue] = useState<VenueProfile>(VENUE_PRESETS[0]);
  const [sourceImage, setSourceImage] = useState<string>(DEFAULT_DEMO_PORTRAIT);
  const [calibratedImage, setCalibratedImage] = useState<string>(DEFAULT_DEMO_PORTRAIT);
  const [rawBase64, setRawBase64] = useState<string | null>(null);

  const [isCalibrating, setIsCalibrating] = useState<boolean>(false);
  const [calibrationStatus, setCalibrationStatus] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isConsoleOpen, setIsConsoleOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isWebcamOpen, setIsWebcamOpen] = useState<boolean>(false);

  const [activeMode, setActiveMode] = useState<string>('physics_simulation_sandbox');
  const [strictProductionMode, setStrictProductionMode] = useState<boolean>(false);
  const [customKeys, setCustomKeys] = useState<{ apiKey: string; apiSecret: string } | null>(null);

  const agent = new ChromaticAgent();
  const [compensation, setCompensation] = useState(agent.synthesizeCompensation(VENUE_PRESETS[0]));
  const [telemetryLog, setTelemetryLog] = useState<any[]>([
    {
      step: 'System Ready',
      durationMs: 5,
      status: 'ok',
      detail: 'Planckian engine loaded. Connect API keys for live production S2S or run sandbox.',
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
    setCalibrationStatus('Synthesizing Chromatic Matrix...');
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
          strictProductionMode,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Server processing error');
      }

      setCompensation(data.compensation);
      setActiveMode(data.mode);

      if (data.telemetry) {
        setTelemetryLog(prev => [
          ...prev,
          { ...data.telemetry, durationMs: Date.now() - start },
        ]);
      }

      if (data.mode === 'real_youcam_api' && data.taskId) {
        setCalibrationStatus('Waiting for Perfect Corp GPU rendering...');
        await pollCloudResult(data.taskId, overrideKeys?.apiKey);
      } else {
        setCalibratedImage(imgToUse);
      }
    } catch (err: any) {
      setErrorMessage(err.message);
      setTelemetryLog(prev => [
        ...prev,
        {
          step: 'Execution Terminated',
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

  const pollCloudResult = async (taskId: string, apiKey?: string) => {
    const maxAttempts = 20;
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise(r => setTimeout(r, 2000));
      setCalibrationStatus(`Processing on Cloud AI (${(i + 1) * 2}s)...`);

      const pollRes = await fetch('/api/calibrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'poll', taskId, apiKey }),
      });

      const pollData = await pollRes.json();
      if (pollData.status === 'success' && pollData.resultUrl) {
        setCalibratedImage(pollData.resultUrl);
        setTelemetryLog(prev => [
          ...prev,
          {
            step: 'YouCam Render Returned',
            durationMs: (i + 1) * 2000,
            status: 'ok',
            detail: 'Neural virtual try-on render completed successfully.',
          },
        ]);
        return;
      }
      if (pollData.status === 'failed') {
        throw new Error(pollData.error || 'Task failed remotely on Perfect Corp GPU');
      }
    }
    throw new Error('AI polling timed out.');
  };

  const handleSelectPreset = (venue: VenueProfile) => {
    setSelectedVenue(venue);
    runCalibration(venue, sourceImage, rawBase64);
  };

  const handleCustomChange = (updated: Partial<VenueProfile>) => {
    const merged = { ...selectedVenue, ...updated, id: 'custom' as const, name: 'Custom Rig' };
    setSelectedVenue(merged);
    setCompensation(agent.synthesizeCompensation(merged));
  };

  // Handle local file upload converted directly to Base64
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = async () => {
      const base64 = reader.result as string;
      setRawBase64(base64);
      setSourceImage(base64);
      setCalibratedImage(base64);
      await runCalibration(selectedVenue, base64, base64);
    };

    reader.readAsDataURL(file);
  };

  const handleWebcamCapture = async (capturedBase64: string) => {
    setRawBase64(capturedBase64);
    setSourceImage(capturedBase64);
    setCalibratedImage(capturedBase64);
    await runCalibration(selectedVenue, capturedBase64, capturedBase64);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-blue-500 selection:text-white">
      <Navbar
        onOpenSettings={() => setIsSettingsOpen(true)}
        onToggleConsole={() => setIsConsoleOpen(prev => !prev)}
        isConsoleOpen={isConsoleOpen}
        activeMode={activeMode}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 flex flex-col gap-6">
        {/* Error notification banner */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-[11px] underline hover:text-white"
            >
              Dismiss
            </button>
          </div>
        )}

        <JudgeDemoGuide onLoadScenario={handleSelectPreset} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 flex flex-col gap-4">
            <DualSplitSlider
              sourceImage={sourceImage}
              calibratedImage={calibratedImage}
              venue={selectedVenue}
              compensation={compensation}
              isLiveApiResult={activeMode === 'real_youcam_api' && calibratedImage !== sourceImage}
            />

            {/* Live Data Action Bar */}
            <div className="flex flex-wrap items-center justify-between p-3.5 rounded-xl bg-surface border border-white/10 text-xs gap-3">
              <div className="flex items-center gap-2">
                {isCalibrating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                    <span className="text-zinc-200 font-medium">{calibrationStatus}</span>
                  </>
                ) : (
                  <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
                    <input
                      type="checkbox"
                      checked={strictProductionMode}
                      onChange={e => setStrictProductionMode(e.target.checked)}
                      className="rounded accent-blue-500"
                    />
                    <span>Strict Live AI Mode (Fail on remote errors)</span>
                  </label>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsWebcamOpen(true)}
                  disabled={isCalibrating}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-medium transition-colors border border-white/10"
                >
                  <Camera className="w-3.5 h-3.5 text-blue-400" />
                  <span>Live Webcam</span>
                </button>

                <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white cursor-pointer font-medium transition-colors shadow-lg shadow-blue-600/20">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Image</span>
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
          </div>

          <div className="lg:col-span-5 flex flex-col gap-6">
            <VenueControls
              selectedVenue={selectedVenue}
              onSelectPreset={handleSelectPreset}
              onCustomChange={handleCustomChange}
              isCalibrating={isCalibrating}
              onTriggerCalibration={() => runCalibration(selectedVenue, sourceImage, rawBase64)}
            />

            <MakeupApparelInspector compensation={compensation} />
          </div>
        </div>
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