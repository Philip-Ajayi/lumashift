import { LipTexture } from './types';

/**
 * Optical Physics & Blackbody Chromatic Locus Mathematical Engine
 * Implements Tanner-Kelvin approximations, Planckian spectral locus,
 * Von Kries Chromatic Adaptation, and CRI R9 red-wavelength deficiency models.
 */

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface XY {
  x: number;
  y: number;
}

/**
 * Calculates RGB values from Kelvin temperature (1000K to 40000K)
 * Based on Planckian radiator chromaticity curves.
 */
export function kelvinToRGB(kelvin: number): RGB {
  const temp = Math.max(1000, Math.min(40000, kelvin)) / 100;
  let r: number, g: number, b: number;

  // Red
  if (temp <= 66) {
    r = 255;
  } else {
    r = temp - 60;
    r = 329.698727446 * Math.pow(r, -0.1332047592);
    r = Math.max(0, Math.min(255, r));
  }

  // Green
  if (temp <= 66) {
    g = temp;
    g = 99.4708025861 * Math.log(g) - 161.1195681661;
    g = Math.max(0, Math.min(255, g));
  } else {
    g = temp - 60;
    r = 288.1221695283 * Math.pow(g, -0.0755148492);
    g = Math.max(0, Math.min(255, g));
  }

  // Blue
  if (temp >= 66) {
    b = 255;
  } else if (temp <= 19) {
    b = 0;
  } else {
    b = temp - 10;
    b = 138.5177312231 * Math.log(b) - 305.0447927307;
    b = Math.max(0, Math.min(255, b));
  }

  return {
    r: Math.round(r),
    g: Math.round(g),
    b: Math.round(b),
  };
}

/**
 * Hex conversion helper
 */
export function rgbToHex(rgb: RGB): string {
  const toHex = (n: number) => {
    const clamped = Math.max(0, Math.min(255, Math.round(n)));
    return clamped.toString(16).padStart(2, '0');
  };
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`.toUpperCase();
}

export function hexToRGB(hex: string): RGB {
  let clean = hex.replace('#', '');
  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('');
  }
  const intVal = parseInt(clean, 16);
  return {
    r: (intVal >> 16) & 255,
    g: (intVal >> 8) & 255,
    b: intVal & 255,
  };
}

/**
 * Von Kries Chromatic Transform
 * Computes inverse compensation needed so that an object appears neutral/intended
 * under a destination illuminant of specified Kelvin and CRI.
 */
export function calculateVonKriesCompensation(
  sourceKelvin: number,
  targetKelvin: number,
  cri: number,
  baseHex: string
): { compensatedHex: string; deltaWarmth: number } {
  const sourceIlluminant = kelvinToRGB(sourceKelvin);
  const targetIlluminant = kelvinToRGB(targetKelvin);
  const base = hexToRGB(baseHex);

  // Normalize illuminants relative to standard D65 (6500K)
  const normS = {
    r: sourceIlluminant.r / 255,
    g: sourceIlluminant.g / 255,
    b: sourceIlluminant.b / 255,
  };
  const normT = {
    r: targetIlluminant.r / 255,
    g: targetIlluminant.g / 255,
    b: targetIlluminant.b / 255,
  };

  // Von Kries gain coefficients
  const gainR = normS.r / (normT.r || 0.001);
  const gainG = normS.g / (normT.g || 0.001);
  const gainB = normS.b / (normT.b || 0.001);

  // CRI Deficit penalty: low CRI causes extreme R9 red deficiency
  const criPenalty = cri < 85 ? (85 - cri) * 1.6 : 0;
  const redDeficitBoost = 1.0 + (criPenalty / 100);

  // Shift color values
  let compR = base.r * gainR * redDeficitBoost;
  let compG = base.g * gainG;
  let compB = base.b * gainB;

  // Normalize if clipped
  const maxVal = Math.max(compR, compG, compB);
  if (maxVal > 255) {
    const scale = 255 / maxVal;
    compR *= scale;
    compG *= scale;
    compB *= scale;
  }

  const resultHex = rgbToHex({ r: compR, g: compG, b: compB });
  const deltaWarmth = Math.round((gainR - gainB) * 100);

  return { compensatedHex: resultHex, deltaWarmth };
}

/**
 * Calculates sensor specular clipping risk given lux and finish
 */
export function evaluateClippingRisk(lux: number, finish: LipTexture): boolean {
  if (lux > 700 && (finish === 'gloss' || finish === 'holographic' || finish === 'metallic')) {
    return true;
  }
  return false;
}