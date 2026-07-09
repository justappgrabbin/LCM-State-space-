// spectrumColor.js
//
// Source: Black Book, Rave I Ching section -- Ra's own words:
// "From absolutely Yin (The Receptive 2) to the absolutely Yang (The
// Creative 1) the entire spectrum of energy is covered."
//
// Gate 2 = The Receptive = pure Yin = all 6 lines broken (000000) = Earth.
// Gate 1 = The Creative  = pure Yang = all 6 lines solid (111111).
// Every other gate's King Wen binary pattern sits somewhere between those
// two poles. This file turns that real, stated span into an actual color
// gradient -- not a metaphor, a computed position on a 0-63 spectrum.
//
// This is NOT the same as the motivational "Color" (1-6) already built in
// resonance_engine.js, and NOT the 9-center 4-color list (yellow/green/
// brown/red) also found in the Black Book. This is the literal visible
// spectrum, keyed to Yin/Yang density.

import { GATE_TO_LINES } from './kingWen.js';

/**
 * Convert a gate's 6-line binary pattern into its integer position on the
 * Yin(0)-to-Yang(63) spectrum. Gate 2 (all 0s) -> 0. Gate 1 (all 1s) -> 63.
 */
export function gateSpectrumPosition(gate) {
  const lines = GATE_TO_LINES[gate];
  if (!lines) throw new Error(`gateSpectrumPosition: no King Wen entry for gate ${gate}`);
  // lines are bottom-to-top; treat as a 6-bit binary number, bit 0 = bottom line
  let value = 0;
  for (let i = 0; i < 6; i++) {
    value += lines[i] * Math.pow(2, i);
  }
  return value; // 0-63
}

/**
 * Map a gate's spectrum position (0-63) onto an actual HSL color.
 * Default gradient: Yin (Earth, position 0) = deep red (low end, hue 0),
 * Yang (Creative, position 63) = violet (high end, hue 270) -- a real
 * visible-spectrum sweep, red through violet, matching how "spectrum" is
 * conventionally drawn (ROYGBIV), anchored at the two poles Ra names.
 *
 * This is a DEFAULT mapping, not a sourced one -- the Black Book states
 * the SPAN is real (Yin-to-Yang, gate 2 to gate 1), but does not specify
 * which literal hue sits at which end. If you have the actual picture/
 * source for gate-to-hue assignment, that should replace this gradient,
 * not the other way around.
 */
export function gateSpectrumColor(gate, { hueStart = 0, hueEnd = 270, saturation = 80, lightness = 50 } = {}) {
  const position = gateSpectrumPosition(gate); // 0-63
  const t = position / 63; // normalize to 0-1
  const hue = hueStart + t * (hueEnd - hueStart);
  return {
    gate,
    spectrumPosition: position,
    hue: Math.round(hue),
    hsl: `hsl(${Math.round(hue)}, ${saturation}%, ${lightness}%)`,
  };
}

// ============================================================
// Self-test
// ============================================================
function _selfTest() {
  console.log('Gate 2 (The Receptive / Earth, pure Yin):', gateSpectrumColor(2));
  console.log('Gate 1 (The Creative, pure Yang):', gateSpectrumColor(1));
  console.log('Gate 62 (from tonight\'s Apollo 11 test):', gateSpectrumColor(62));
  console.log('Gate 56 (The Wanderer, confirmed 56.3 = Alienation earlier):', gateSpectrumColor(56));
}

try {
  const isDirectRun =
    typeof process !== "undefined" &&
    import.meta.url === `file://${process.argv[1]}`;
  if (isDirectRun) _selfTest();
} catch (_) {
  /* browser/bundler context, no process -- skip */
}
