import { VenueProfile, ChromaticCompensation, LipTexture } from './types';
import { calculateVonKriesCompensation, evaluateClippingRisk } from './optical-physics';

/**
 * Chromatic Compensation Agent (Claude 3.5 / Planckian Matrix Bridge)
 * Translates destination venue optical attributes into YouCam S2S API parameters.
 */
export class ChromaticAgent {
  private vanityKelvin = 3000; // Standard bathroom/vanity warm white lighting

  /**
   * Generates parameter matrix for YouCam Makeup and AI Clothes engines
   */
  public synthesizeCompensation(
    venue: VenueProfile,
    baseCosmetics = {
      foundation: '#E5B899', // Natural beige
      lip: '#B82838',        // Classic neutral red
      contour: '#6A4432',     // Medium bronze
      blush: '#C76A68',       // Rosy peach
    }
  ): ChromaticCompensation {
    // 1. Foundation undertone chromatic shift
    const fComp = calculateVonKriesCompensation(
      this.vanityKelvin,
      venue.kelvin,
      venue.cri,
      baseCosmetics.foundation
    );

    // Lux affects required foundation coverage: low lux requires higher contrast,
    // extremely bright 800+ lux highlights micro-flaws.
    let coverage = 75;
    let glow = 40;
    if (venue.lux > 700) {
      coverage = 88;
      glow = 15; // Matte anti-shine under harsh wash
    } else if (venue.lux < 150) {
      coverage = 65;
      glow = 65; // Luminous dewy finish to catch low-light bounce
    }

    // 2. Lip formulation & texture shift
    let lipTexture: LipTexture = 'satin';
    const clippingRisk = evaluateClippingRisk(venue.lux, 'gloss');

    if (venue.lux > 600 || venue.category === 'Stage' || venue.category === 'Digital') {
      lipTexture = 'matte'; // Prevent camera blown-out highlights
    } else if (venue.lux < 250) {
      lipTexture = 'gloss'; // Maximize refraction in dim candlelight
    } else {
      lipTexture = 'satin';
    }

    const lipComp = calculateVonKriesCompensation(
      this.vanityKelvin,
      venue.kelvin,
      venue.cri,
      baseCosmetics.lip
    );

    // 3. Contour node calculation
    // Stage lights flatten bone structure; needs 35-50% deeper contrast
    let contourIntensity = 60;
    let depthOffset = 1.2;
    if (venue.category === 'Stage' || venue.lux > 650) {
      contourIntensity = 84;
      depthOffset = 2.4;
    } else if (venue.lux < 150) {
      contourIntensity = 45;
      depthOffset = 0.8;
    }

    // 4. Apparel Anti-Glare Profile
    const apparelProfile = {
      garmentType: venue.recommendedGarment.type,
      recommendedHex: venue.recommendedGarment.colorHex,
      fabricFinish: venue.recommendedGarment.fabricFinish.replace('_', ' ').toUpperCase(),
      contrastRatio: venue.lux > 600 ? '9.4:1 (Broadcast Studio Certified)' : '5.2:1 (Atmospheric Balance)',
      antiGlareRating: `${venue.recommendedGarment.antiGlareIndex}% Light Absorption`,
    };

    // 5. Diagnostics
    let opticalDeficit = 'Equilibrium reached.';
    if (venue.kelvin >= 5500) {
      opticalDeficit = `Cool Illuminant (${venue.kelvin}K) depletes skin melanin warm reflectance by ${Math.abs(fComp.deltaWarmth)}%.`;
    } else if (venue.kelvin <= 2400) {
      opticalDeficit = `Heavy Amber Cast (${venue.kelvin}K) turns cool berry pigments into dark brown/black voids.`;
    }

    const r9Deficiency = venue.cri < 82;

    return {
      foundation: {
        hex: fComp.compensatedHex,
        originalHex: baseCosmetics.foundation,
        undertoneShiftDelta: fComp.deltaWarmth,
        coverage,
        glow,
      },
      lip: {
        hex: lipComp.compensatedHex,
        originalHex: baseCosmetics.lip,
        texture: lipTexture,
        intensity: venue.lux < 200 ? 92 : 82,
        specularSuppression: clippingRisk ? 85 : 20,
      },
      contour: {
        hex: baseCosmetics.contour,
        intensity: contourIntensity,
        depthOffset,
      },
      blush: {
        hex: baseCosmetics.blush,
        intensity: venue.kelvin > 5000 ? 80 : 60,
      },
      apparel: apparelProfile,
      diagnostics: {
        opticalDeficit,
        r9DeficiencyWarning: r9Deficiency,
        specularClippingRisk: clippingRisk,
        recommendedCameraFocalDistance: venue.lux > 500 ? '50mm - 85mm (Low Distortion)' : '35mm (Wide Aperture f/1.8)',
        technicalExplanation: `Calibrated with Planckian chromatic shift matrix. Adapted ${fComp.deltaWarmth > 0 ? '+' : ''}${fComp.deltaWarmth}% warmth to prevent sallow dermal reflections under ${venue.name}.`,
      },
    };
  }
}
