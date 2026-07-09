/**
 * resonance_engine.js
 *
 * Motor-layer port of resonance_engine.py. Same math, same sourcing, same
 * honesty about what's verified vs. not. This runs client-side with no
 * backend -- Python stays as the non-motor layer (or drives this from a
 * server context if you need it there too).
 *
 * Every constant/function is either (a) pure math, computed live, or
 * (b) sourced from a verified primary text, cited in the comment.
 * Anything unverified is marked UNVERIFIED -- not guessed at.
 */

// ============================================================
// 1. THE ADDRESS SPACE: Gate.Line.Color.Tone.Base
// ============================================================
// Total states = 64 * 6 * 6 * 6 * 5 = 69,120 (locked address space number)

export const GATE_WHEEL = [
  25, 17, 21, 51, 42, 3, 27, 24, 2, 23, 8, 20, 16, 35, 45, 12,
  15, 52, 39, 53, 62, 56, 31, 33, 7, 4, 29, 59, 40, 64, 47, 6,
  46, 18, 48, 57, 32, 50, 28, 44, 1, 43, 14, 34, 9, 5, 26, 11,
  10, 58, 38, 54, 61, 60, 41, 19, 13, 49, 30, 55, 37, 63, 22, 36,
];

// UNVERIFIED: wheel rotation offset. Division logic below is structurally
// sound; numbers won't match calibrated HD software until the verified
// offset from real_ephemeris.py (checked against the 2017 eclipse + Mean
// Lunar Node) is dropped in here.
export const WHEEL_OFFSET = 0.0;

export const N_GATES = 64;
export const N_LINES = 6;
export const N_COLORS = 6;
export const N_TONES = 6;
export const N_BASES = 5;

export const GATE_ARC = 360.0 / N_GATES;      // 5.625 deg = 5deg 37' 30" (Book of Letters: "each constellation has an arc of 5°37'30\"")
export const LINE_ARC = GATE_ARC / N_LINES;   // 0.9375 deg
export const COLOR_ARC = LINE_ARC / N_COLORS; // 0.15625 deg
export const TONE_ARC = COLOR_ARC / N_TONES;  // 0.026041666... deg
export const BASE_ARC = TONE_ARC / N_BASES;   // 0.005208333... deg = 18.75 arcsec -- finest resolution unit

export const TOTAL_STATES = N_GATES * N_LINES * N_COLORS * N_TONES * N_BASES; // 69,120

/**
 * Render decimal degrees as D°M'S" for display. Same number, different
 * format -- DMS is not more precise or differently-computed than decimal,
 * it's a display convention, not a different math.
 */
export function decimalToDms(deg) {
  const sign = deg < 0 ? "-" : "";
  deg = Math.abs(deg);
  const d = Math.floor(deg);
  const mFull = (deg - d) * 60;
  const m = Math.floor(mFull);
  const s = (mFull - m) * 60;
  return `${sign}${d}\u00b0${m}'${s.toFixed(2)}"`;
}

/**
 * Raw ecliptic longitude -> Gate.Line.Color.Tone.Base via nested remainder
 * division. No lookup table below Gate -- every level is division applied
 * to the leftover fraction of the level above.
 */
export function resolveAddress(longitudeDeg, wheelOffset = WHEEL_OFFSET) {
  const lon = ((longitudeDeg + wheelOffset) % 360.0 + 360.0) % 360.0;

  const gateIndex = Math.floor(lon / GATE_ARC) % N_GATES;
  const gate = GATE_WHEEL[gateIndex];
  const r1 = lon - gateIndex * GATE_ARC;

  const line = Math.floor(r1 / LINE_ARC) + 1;
  const r2 = r1 - (line - 1) * LINE_ARC;

  const color = Math.floor(r2 / COLOR_ARC) + 1;
  const r3 = r2 - (color - 1) * COLOR_ARC;

  const tone = Math.floor(r3 / TONE_ARC) + 1;
  const r4 = r3 - (tone - 1) * TONE_ARC;

  const base = Math.floor(r4 / BASE_ARC) + 1;
  const r5 = r4 - (base - 1) * BASE_ARC; // below Base -- exists, unresolvable further in this system

  return {
    inputDms: decimalToDms(longitudeDeg),
    gate, line, color, tone, base,
    address: `${gate}.${line}.${color}.${tone}.${base}`,
    belowBaseDeg: r5,
    belowBaseArcsec: r5 * 3600,
    baseResolutionArcsec: BASE_ARC * 3600,
  };
}

/**
 * Where two close birth moments (e.g. twins) diverge in the address, and
 * by how many arcseconds.
 */
export function twinDivergence(lonA, lonB, wheelOffset = WHEEL_OFFSET) {
  const a = resolveAddress(lonA, wheelOffset);
  const b = resolveAddress(lonB, wheelOffset);
  const levels = ["gate", "line", "color", "tone", "base"];
  const divergesAt = levels.find((lvl) => a[lvl] !== b[lvl]);

  return {
    a: a.address,
    b: b.address,
    divergesAt: divergesAt || "identical (same 69,120th state)",
    separationArcsec: Math.abs(lonA - lonB) * 3600,
  };
}

// ============================================================
// 2. COLOR MOTIVATIONS + HARMONIC PAIRS
// ============================================================
// Source: Personality External Color Book (Ra Uru Hu, 2006)

export const COLOR_MOTIVATION = {
  1: "Survival (Fear)",   // "Survival, in this frame, is what you fear..."
  2: "Possibility",
  3: "UNVERIFIED",
  4: "Wanting",           // "what is missing, what is lacking, what is needed, what is wanting"
  5: "Probability",
  6: "Personal (non-motivation)",
};

// "In that lies our themes of harmonics... the 1-4, the 2-5, and the 3-6."
export const COLOR_HARMONIC_PAIRS = { 1: 4, 4: 1, 2: 5, 5: 2, 3: 6, 6: 3 };

// Documented exception: every Color defaults to its harmonic partner when
// distracted, EXCEPT Color 4, which defaults toward Color 1 (Survival)
// instead. ("its natural tendency is to go to the survival" -- Ra,
// Personality Resonance Mapping, Lesson 4)
export const COLOR_4_DISTRACTION_EXCEPTION = { defaultsTo: 1, notToHarmonicPartner: 1 };

// ============================================================
// 3. THE 8 I-CHING HOUSES (distinct from the 12-sign zodiac wheel)
// ============================================================
// Source: Book of Letters (Ra Uru Hu, 1995/96): "the 64 Hexagrams are
// divided into Eight (8) Houses. Each House is made up of 8 Hexagrams
// each of which has the same trigram base... Each of the eight gates of
// the G center are the leading hexagrams of each of the eight houses."

export const HOUSE_LEADING_GATES = {
  // Cross of the Sphinx -- Direction
  1: "The Creative (Self-expression)",
  2: "The Receptive (Direction of the Self)",
  7: "The Army (Role of the Self in interaction)",
  13: "Fellowship of Man (Openness of the Self in interaction)",
  // Cross of the Vessel -- Love
  10: "Treading (Behavior of the Self)",
  15: "Modesty (Rhythm of the Self)",
  25: "Innocence (Spirit of the Self)",
  46: "Pushing Upward (Determination of the Self)",
};
// TODO: full 64-gate -> house membership (grouped by shared lower
// trigram) not yet extracted from source. The 8 anchor gates above are
// confirmed; the other 56 gates' house assignments still need pulling
// from the I Ching trigram tables in the Black Book.

// ============================================================
// 4. COMPOSITE CONNECTION TYPES (how two charts complete each other)
// ============================================================
// Source: Book of Letters, "Composite" glossary entry.

export const COMPOSITE_TYPES = {
  electro_magnetic: "Same channel, partners open OPPOSITE gates -- attraction and repulsion. The only type where NEITHER person has the channel alone; it can only complete between them.",
  compromise: "One partner defines the whole channel; the other opens only one gate and compromises to it.",
  dominance: "One partner defines the channel; the other activates none of it -- can only be accepted/surrendered to.",
  companionship: "Both partners open the same gate or channel -- shared experience, potential friendship.",
};

/**
 * channel = [gateX, gateY] -- the two gates that define one channel.
 * Returns which of the 4 composite types applies between two people
 * (each represented as a Set of their open gate numbers) for this channel.
 */
export function classifyComposite(personAGates, personBGates, channel) {
  const [gx, gy] = channel;
  const aHasX = personAGates.has(gx), aHasY = personAGates.has(gy);
  const bHasX = personBGates.has(gx), bHasY = personBGates.has(gy);

  const aComplete = aHasX && aHasY;
  const bComplete = bHasX && bHasY;

  if (aComplete && bComplete) return "companionship";
  if (aComplete && !(bHasX || bHasY)) return "dominance (A dominant)";
  if (bComplete && !(aHasX || aHasY)) return "dominance (B dominant)";
  if (aComplete && (bHasX || bHasY)) return "compromise (B compromises to A)";
  if (bComplete && (aHasX || aHasY)) return "compromise (A compromises to B)";
  if ((aHasX && bHasY && !aHasY && !bHasX) || (aHasY && bHasX && !aHasX && !bHasY)) {
    return "electro_magnetic";
  }
  return "no connection on this channel";
}

// ============================================================
// Self-test -- runs automatically when this file is the entry point,
// whether loaded as an ES module (`node resonance_engine.js`) or
// imported into a bundler/browser context (in which case this block
// simply won't fire, since import.meta.url won't match process argv).
// ============================================================
function _selfTest() {
  console.log(`Total address space: ${TOTAL_STATES}`);
  console.log(`Base resolution: ${(BASE_ARC * 3600).toFixed(2)} arcsec\n`);

  const result = resolveAddress(117.916373); // Apollo 11 Sun longitude, real JPL data
  console.log("Apollo 11 touchdown Sun address:", result.address);
  console.log("  input:", result.inputDms);
  console.log(`  below Base: ${result.belowBaseArcsec.toFixed(2)}" (exists, unresolved by this system)\n`);

  console.log("Color 1 motivation:", COLOR_MOTIVATION[1]);
  console.log("Color 4 motivation:", COLOR_MOTIVATION[4]);
  console.log("Harmonic partner of Color 1:", COLOR_HARMONIC_PAIRS[1], "\n");

  console.log(classifyComposite(new Set([59]), new Set([6]), [59, 6]));
}

try {
  const isDirectRun =
    typeof process !== "undefined" &&
    import.meta.url === `file://${process.argv[1]}`;
  if (isDirectRun) _selfTest();
} catch (_) {
  /* running in a browser/bundler context with no process -- fine, skip */
}
