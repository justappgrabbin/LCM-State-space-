// stateSpace.js
//
// Consolidated 64-gate state space. Everything confirmed tonight, wired
// into one importable module. Honest completion status noted per section
// -- nothing here claims more coverage than what's actually verified.

import { resolveAddress, GATE_WHEEL } from './resonance_engine.js';
import { gateToLines, gateToFeatures } from './kingWen.js';
import { gateSpectrumColor } from './spectrumColor.js';

// ============================================================
// GATE KEYNOTES -- 24 of 64 confirmed with individual write-ups in the
// Black Book (this specific volume). The other 40 gates are NOT in this
// file's source material with the same depth -- listed as null, not
// guessed at. If other Black Book volumes exist, they'd fill these in.
// ============================================================
export const GATE_KEYNOTES = {
  1: null, 2: null,
  3: "Difficulty at the Beginning",
  4: null,
  5: "Waiting",
  6: "Conflict",
  7: null,
  8: "Holding Together",
  9: "Taming Power of the Small",
  10: null, 11: null, 12: null,
  13: "Fellowship of Man",
  14: null, 15: null, 16: null, 17: null,
  18: "Work on What Has Been Spoilt",
  19: null,
  20: "Contemplation",
  21: "Biting Through",
  22: "Grace",
  23: "Splitting Apart",
  24: null,
  25: "Innocence",
  26: null,
  27: "Nourishment",
  28: "Preponderance of the Great",   // confirmed earlier this session, 28.1 = Preparation
  29: null,
  30: "The Clinging Fire",
  31: "Influence",
  32: "Duration",
  33: null,
  34: "Power of the Great",
  35: null,
  36: "Darkening of the Light",
  37: null, 38: null, 39: null, 40: null, 41: null, 42: null, 43: null,
  44: null, 45: null, 46: null,
  47: "Oppression",
  48: null, 49: null, 50: null,
  51: "The Arousing",
  52: "Keeping Still",
  53: null, 54: null,
  55: "Abundance",              // confirmed earlier this session (55.3 = Innocence)
  56: "The Wanderer",           // confirmed earlier this session (56.3 = Alienation)
  57: "The Gentle",
  58: "The Joyous",
  59: "Dispersion",             // matches real King Wen "Huan/Dispersion", flagged by person directly
  60: null, 61: null, 62: null,
  63: "After Completion",
  64: null,
};

// Separately confirmed via primary-source line-level checks earlier this
// session (Black Book direct quotes), independent of the header sweep above
const VERIFIED_LINES = {
  "6.4": "Triumph",
  "28.1": "Preparation",
  "28.4": "Holding On",
  "55.3": "Innocence",
  "56.3": "Alienation",
};

// ============================================================
// GRAPH & DIMENSIONAL TOPOLOGY UTILITIES
// ============================================================

/** Finds adjacent gates in the 6-dimensional hypercube space (Hamming
 * Distance = 1). gateToLines() returns an ARRAY (e.g. [0,0,1,1,0,1]) --
 * uses array comparison, not string methods. */
export function getHypercubeNeighbors(gate) {
  const currentLines = gateToLines(gate);
  if (!currentLines || currentLines.length !== 6) return [];

  const neighbors = [];
  for (let i = 0; i < 6; i++) {
    const mutated = [...currentLines];
    mutated[i] = mutated[i] === 1 ? 0 : 1;
    for (let g = 1; g <= 64; g++) {
      const candidateLines = gateToLines(g);
      if (candidateLines.every((bit, idx) => bit === mutated[idx])) {
        neighbors.push({ gate: g, lineMutated: i + 1 });
        break;
      }
    }
  }
  return neighbors;
}

/** Finds the exact polarity opposite gate (180 degrees away on the wheel).
 * Structurally sound math; numerically depends on GATE_WHEEL's rotational
 * offset, which is still flagged unverified in resonance_engine.js. */
export function getPolarityOpposite(gate) {
  const currentIndex = GATE_WHEEL.indexOf(gate);
  if (currentIndex === -1) return null;
  const oppositeIndex = (currentIndex + 32) % 64;
  return GATE_WHEEL[oppositeIndex];
}

// ============================================================
// SEMANTIC TRIPLE GENERATOR
// ============================================================
export function generateFullSemanticTriples() {
  const triples = [];
  for (let gate = 1; gate <= 64; gate++) {
    const currentState = getGateState(gate);
    const currentName = currentState.keynote || `Gate_${gate}`;

    getHypercubeNeighbors(gate).forEach(({ gate: neighborGate, lineMutated }) => {
      const neighborState = getGateState(neighborGate);
      const neighborName = neighborState.keynote || `Gate_${neighborGate}`;
      triples.push({
        subject: currentName,
        predicate: `MUTATES_LINE_${lineMutated}`,
        object: neighborName,
        metadata: { type: "hypercube_dimension", fromGate: gate, toGate: neighborGate, axis: lineMutated },
      });
    });

    const oppositeGate = getPolarityOpposite(gate);
    if (oppositeGate) {
      const oppositeState = getGateState(oppositeGate);
      const oppositeName = oppositeState.keynote || `Gate_${oppositeGate}`;
      triples.push({
        subject: currentName,
        predicate: "OPPOSES_AXIAL",
        object: oppositeName,
        metadata: { type: "axial_dimension", fromGate: gate, toGate: oppositeGate },
      });
    }
  }
  return triples;
}


// single object: keynote, King Wen binary lines, hexagram features,
// spectrum color, and codon/amino-acid family (loaded separately since
// that table lives in codon_mapping.py -- JS port noted as still owed).
// ============================================================
export function getGateState(gate, iChingGrammarTool) {
  const lines = gateToLines(gate);
  const state = {
    gate,
    keynote: GATE_KEYNOTES[gate] ?? null,
    lines,
    spectrum: gateSpectrumColor(gate),
    topology: {
      hypercubeNeighbors: getHypercubeNeighbors(gate),
      polarityOpposite: getPolarityOpposite(gate),
    },
  };
  if (iChingGrammarTool) {
    state.hexagramFeatures = gateToFeatures(gate, iChingGrammarTool);
  }
  return state;
}

/** Resolve a raw zodiac degree all the way to full gate state in one call. */
export function resolveFullState(longitudeDeg, iChingGrammarTool) {
  const address = resolveAddress(longitudeDeg);
  const gateState = getGateState(address.gate, iChingGrammarTool);
  return { ...address, ...gateState };
}

export function completionReport() {
  const keynoteCount = Object.values(GATE_KEYNOTES).filter((v) => v !== null).length;
  return {
    gate_keynotes: `${keynoteCount}/64 confirmed (this Black Book volume)`,
    verified_lines: `${Object.keys(VERIFIED_LINES).length} individual lines confirmed`,
    codon_table: "64/64 complete -- see codon_mapping.py (JS port still owed)",
    spectrum_color: "64/64 computable -- pure function, no gaps",
    king_wen_lines: "64/64 complete -- see kingWen.js",
    resolver: "complete -- wheel offset still unverified, see resonance_engine.js",
    houses: "8/64 confirmed (anchor gates only) -- see resonance_engine.js",
  };
}

if (typeof process !== "undefined") {
  try {
    if (import.meta.url === `file://${process.argv[1]}`) {
      console.log("=== State Space Completion ===");
      console.table(completionReport());
      console.log("\nExample -- Gate 56 (confirmed: Wanderer / 56.3 Alienation):");
      console.log(getGateState(56));
    }
  } catch (_) { /* browser context, skip */ }
}
