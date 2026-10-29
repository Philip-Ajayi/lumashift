export type VenueId =
  | 'auditorium'
  | 'candlelight_bistro'
  | 'overcast_daylight'
  | 'executive_webcam'
  | 'ballroom_reception'
  | 'custom';

export type LipTexture = 'matte' | 'gloss' | 'satin' | 'holographic' | 'metallic' | 'sheer' | 'shimmer';

export interface VenueProfile {
  id: VenueId;
  name: string;
  category: 'Stage' | 'Hospitality' | 'Outdoor' | 'Digital' | 'Custom';
  description: string;
  kelvin: number;           // Correlated Color Temperature (1800K - 10000K)
  lux: number;              // Illuminance in Lux (10 - 2500 lx)
  cri: number;              // Color Rendering Index Ra (50 - 100)
  sensorExposure: number;   // Camera EV compensation (-2 to +2 EV)
  recommendedGarment: {
    type: string;
    label: string;
    colorHex: string;
    fabricFinish: 'matte_wool' | 'anti_glare_crepe' | 'heavy_twill' | 'lustrous_silk';
    antiGlareIndex: number; // 0 to 100%
  };
}

export interface ChromaticCompensation {
  foundation: {
    hex: string;
    originalHex: string;
    undertoneShiftDelta: number; // e.g. +18% peach/warmth
    coverage: number;            // 0 - 100
    glow: number;                // 0 - 100
  };
  lip: {
    hex: string;
    originalHex: string;
    texture: LipTexture;
    intensity: number;           // 0 - 100
    specularSuppression: number; // 0 - 100%
  };
  contour: {
    hex: string;
    intensity: number;           // 0 - 100
    depthOffset: number;         // mm node adjustment
  };
  blush: {
    hex: string;
    intensity: number;
  };
  apparel: {
    garmentType: string;
    recommendedHex: string;
    fabricFinish: string;
    contrastRatio: string;
    antiGlareRating: string;
  };
  diagnostics: {
    opticalDeficit: string;
    r9DeficiencyWarning: boolean;
    specularClippingRisk: boolean;
    recommendedCameraFocalDistance: string;
    technicalExplanation: string;
  };
}

export interface CalibrationResponse {
  success: boolean;
  timestamp: string;
  executionTimeMs: number;
  mode: 'real_youcam_api' | 'physics_simulation_sandbox';
  sourceImage: string;
  calibratedImage: string;
  simulatedEnvironmentImage: string;
  venueProfile: VenueProfile;
  compensation: ChromaticCompensation;
  telemetryLog: Array<{
    step: string;
    durationMs: number;
    status: 'ok' | 'warn' | 'info';
    detail: string;
  }>;
}
