'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { DualSplitSlider } from '@/components/DualSplitSlider';
import { VenueControls } from '@/components/VenueControls';
import { MakeupApparelInspector } from '@/components/MakeupApparelInspector';
import { DevConsoleDrawer } from '@/components/DevConsoleDrawer';
import { JudgeDemoGuide } from '@/components/JudgeDemoGuide';
import { ApiSettingsModal } from '@/components/ApiSettingsModal';
import { VENUE_PRESETS, DEFAULT_DEMO_PORTRAIT } from '@/lib/sample-data';
import { VenueProfile, CalibrationResponse } from '@/lib/types';
import { ChromaticAgent } from '@/lib/chromatic-agent';
import { Loader2, Upload } from 'lucide-react';

export default function LumaShiftStudio() {
  const [selectedVenue, setSelectedVenue] = useState<VenueProfile>(VENUE_PRESETS[0]);
  const [sourceImage, setSourceImage] = useState<string>(DEFAULT_DEMO_PORTRAIT);
  const [calibratedImage, setCalibratedImage] = useState<string>(DEFAULT_DEMO_PORTRAIT);
  const [isCalibrating, setIsCalibrating] = useState<boolean>(false);
  const [calibrationStatus, setCalibrationStatus] = useState<string>('');
  const [isConsoleOpen, setIsConsoleOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [activeMode, setActiveMode] = useState<string>('physics_simulation_sandbox');
  const [customKeys, setCustomKeys] = useState<{ apiKey: string; apiSecret: string } | null>(null);

  const agent = new ChromaticAgent();
  const [compensation, setCompensation] = useState(agent.synthesizeCompensation(VENUE_PRESETS[0]));
  const [telemetryLog, setTelemetryLog] = useState<any[]>([
    {
      step: 'System Ready',
      durationMs: 5,
      status: 'ok',
      detail: 'Planckian engine loaded. Ready for one-click judge demo or live AI calibration.',
    },
  ]);

  // Main calibration trigger
  const runCalibration = async (
    venueToUse = selectedVenue,
    imgToUse = sourceImage,
    overrideKeys = customKeys
  ) => {
    setIsCalibrating(true);
    setCalibrationStatus('Synthesizing Chromatic Matrix...');
    const start = Date.now();

    try {
      const res = await fetch('/api/calibrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: imgToUse,
          venueId: venueToUse.id,
          customVenue: venueToUse,
          apiKey: overrideKeys?.apiKey,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Server error');

      setCompensation(data.compensation);
      setActiveMode(data.mode);

      if (data.telemetry) {
        setTelemetryLog(prev => [
          ...prev,
          { ...data.telemetry, durationMs: Date.now() - start },
        ]);
      }

      // If a cloud task was created, poll until complete
      if (data.mode === 'real_youcam_api' && data.taskId) {
        setCalibrationStatus('Waiting for Perfect Corp GPU rendering...');
        await pollCloudResult(data.taskId, imgToUse, overrideKeys?.apiKey);
      } else {
        setCalibratedImage(imgToUse);
        setCalibrationStatus('');
      }
    } catch (err: any) {
      console.warn('Execution error:', err.message);
      setCalibratedImage(imgToUse);
      setActiveMode('physics_simulation_sandbox');
    } finally {
      setIsCalibrating(false);
      setCalibrationStatus('');
    }
  };

  // Client-side polling for Perfect Corp tasks (avoids Vercel function timeouts)
  const pollCloudResult = async (taskId: string, fallbackImg: string, apiKey?: string) => {
    const maxAttempts = 15;
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise(r => setTimeout(r, 2000));
      setCalibrationStatus(`Processing on Cloud AI... (${(i + 1) * 2}s)`);

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
            detail: 'Neural transfer completed successfully.',
          },
        ]);
        return;
      }
      if (pollData.status === 'failed') {
        throw new Error(pollData.error || 'Task failed remotely');
      }
    }
    throw new Error('AI polling timed out, showing physical preview');
  };

  const handleSelectPreset = (venue: VenueProfile) => {
    setSelectedVenue(venue);
    runCalibration(venue, sourceImage);
  };

  const handleCustomChange = (updated: Partial<VenueProfile>) => {
    const merged = { ...selectedVenue, ...updated, id: 'custom' as const, name: 'Custom Rig' };
    setSelectedVenue(merged);
    setCompensation(agent.synthesizeCompensation(merged));
  };

  // Upload selfie via temporary public endpoint so Perfect Corp can fetch it
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];

    setIsCalibrating(true);
    setCalibrationStatus('Hosting image for cloud analysis...');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSourceImage(data.url);
      setCalibratedImage(data.url);
      await runCalibration(selectedVenue, data.url);
    } catch (err: any) {
      alert(`Could not upload photo: ${err.message}`);
    } finally {
      setIsCalibrating(false);
      setCalibrationStatus('');
    }
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

            {/* Upload & Status Bar */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface border border-white/10 text-xs">
              <div className="flex items-center gap-2">
                {isCalibrating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                    <span className="text-zinc-200 font-medium">{calibrationStatus}</span>
                  </>
                ) : (
                  <span className="text-zinc-400">Upload any test face or use preset:</span>
                )}
              </div>

              <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white cursor-pointer font-medium transition-colors shadow-lg shadow-blue-600/20">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Selfie</span>
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

          <div className="lg:col-span-5 flex flex-col gap-6">
            <VenueControls
              selectedVenue={selectedVenue}
              onSelectPreset={handleSelectPreset}
              onCustomChange={handleCustomChange}
              isCalibrating={isCalibrating}
              onTriggerCalibration={() => runCalibration(selectedVenue, sourceImage)}
            />

            <MakeupApparelInspector compensation={compensation} />
          </div>
        </div>
      </main>

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
          runCalibration(selectedVenue, sourceImage, keys);
        }}
      />
    </div>
  );
}
