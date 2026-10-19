// verifiedWheel.js  (added 2026-10-19, branch fill/lcm-20261019)
//
// Fills the open item in README.md "Wheel rotation offset" and the
// UNVERIFIED WHEEL_OFFSET in resonance_engine.js. Her resonance_engine.js is
// NOT edited: WHEEL_OFFSET there stays 0.0 with her UNVERIFIED comment. This
// file adds a verified offset next to it and passes it in explicitly.
//
// SOURCE: /workspace/research/hd-math-verification.md section 1 (checked
// 2026-09-26 against three published gate tables + the human-design-py
// source; recomputed in research/calc/gates.py, 0 mismatches):
//   "Gate 41 starts at 302 deg 00'00" (2 deg 00' Aquarius). Every gate is
//    exactly 5 deg 37'30" (5.625 deg) wide. Gate 25 runs from 28 deg 15'
//    Pisces to 3 deg 52'30" Aries."  human-design-py: HD_START_DEGREE = 358.25.
// Her GATE_WHEEL starts at gate 25 (index 0), so index 0 must begin at 358.25.
// resolveAddress computes (lon + offset) % 360, so offset = 360 - 358.25 = 1.75.
// Check: 302 + 1.75 = 303.75 = 54 * 5.625, and GATE_WHEEL[54] === 41.
//
// ZODIAC: the 302 deg anchor is on the TROPICAL zodiac (same file, section 1:
// "The Human Design wheel cuts the tropical zodiac"). Her stated requirement
// is Fagan-Bradley sidereal. INVESTIGATING: which zodiac the GATE should be
// read on is her call; this file does not change her requirement. Gates
// below are read from the tropical longitude you pass in; if you also pass a
// Fagan-Bradley ayanamsa, the sidereal sign/degree is reported alongside.

import { resolveAddress, GATE_ARC } from "./resonance_engine.js";

export const VERIFIED_WHEEL_OFFSET = 1.75;
export const GATE_41_START_TROPICAL = 302.0; // hd-math-verification.md s.1
export const GATE_25_START_TROPICAL = 358.25; // human-design-py HD_START_DEGREE

export const SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

/** Her resolveAddress, with the verified offset passed in. */
export function resolveAddressVerified(tropicalLongitudeDeg) {
  return resolveAddress(tropicalLongitudeDeg, VERIFIED_WHEEL_OFFSET);
}

/** Start of a gate on the tropical wheel (deg), from the 302 deg anchor. */
export function gateStartTropical(gate) {
  const ORDER_FROM_41 = [41,19,13,49,30,55,37,63,22,36,25,17,21,51,42,3,27,24,2,23,8,20,16,35,45,12,15,52,39,53,62,56,31,33,7,4,29,59,40,64,47,6,46,18,48,57,32,50,28,44,1,43,14,34,9,5,26,11,10,58,38,54,61,60];
  const k = ORDER_FROM_41.indexOf(gate);
  if (k < 0) throw new Error(`gateStartTropical: no gate ${gate}`);
  return (GATE_41_START_TROPICAL + k * GATE_ARC) % 360;
}

function signDms(lon) {
  const x = ((lon % 360) + 360) % 360;
  const s = Math.floor(x / 30);
  let rem = (x - 30 * s) * 3600; // arcseconds into the sign
  const degree = Math.floor(rem / 3600); rem -= degree * 3600;
  const minute = Math.floor(rem / 60); rem -= minute * 60;
  const second = Math.floor(rem + 1e-9);
  return { zodiac: SIGNS[s], degree, minute, second, secondExact: rem };
}

/**
 * Her 13 spaces for one position, in her order:
 *   Planetary, Dimension, Gate, Line, Color, Tone, Base, Degree, Min, Sec,
 *   Arc-Sec, zodiac, house
 * (Alexis, chat 2026-10-19; recorded in research/open-questions/14-finer-breakdown.md)
 *
 * opts.planet          - name of the body (Planetary). Passed through as given.
 * opts.ayanamsaDeg     - optional Fagan-Bradley ayanamsa for the moment, deg.
 *                        Sidereal lon = tropical - ayanamsa (Swiss Ephemeris
 *                        docs s.2.8 via hd-math-verification.md s.5; FB at J2000
 *                        = 24.7403 deg mean). Not computed here (needs an ephemeris).
 */
export function thirteenSpaces(tropicalLongitudeDeg, opts = {}) {
  const a = resolveAddressVerified(tropicalLongitudeDeg);
  const trop = signDms(tropicalLongitudeDeg);
  const out = {
    planetary: opts.planet ?? null,
    // INVESTIGATING: her five dimensions (Being, Movement, Evolution, Design,
    // Space) have no published per-planet or per-position rule yet.
    dimension: { status: "investigating", value: null },
    gate: a.gate, line: a.line, color: a.color, tone: a.tone, base: a.base,
    degree: trop.degree, minute: trop.minute, second: trop.second,
    // INVESTIGATING: her list has both "Sec" and "Arc-Sec". In the sources an
    // arcsecond IS a second of arc (14-finer-breakdown.md). The candidate
    // below (fractional seconds) is 'filled in, no source'.
    arcSecond: { status: "investigating", candidate: Number(trop.secondExact.toFixed(3)) },
    zodiac: trop.zodiac,
    zodiacSystem: "tropical",
    // INVESTIGATING: astrological house needs birth time, place and a house
    // system; none is specified in her sources. Not computed.
    house: { status: "investigating", value: null },
    address: a.address,
  };
  if (typeof opts.ayanamsaDeg === "number") {
    const sid = signDms(tropicalLongitudeDeg - opts.ayanamsaDeg);
    out.sidereal = { system: "Fagan-Bradley (ayanamsa supplied by caller)", ...sid };
    delete out.sidereal.secondExact;
  }
  return out;
}
