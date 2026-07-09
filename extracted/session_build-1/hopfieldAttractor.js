// hopfieldAttractor.js
//
// Real Hopfield network (Hopfield, 1982): patterns stored as stable
// attractor states in an energy landscape. No gradient descent, no
// training loop -- weights are set once via the Hebbian rule from the
// patterns you want stored, and retrieval is literally "roll downhill
// into the nearest energy minimum." This is a genuinely strong match for
// "crystallization" -- a triple settling into a stable state IS a
// Hopfield network converging.
//
// Uses the real gate data already built tonight (spectrum position,
// King Wen binary lines) as the pattern content -- not arbitrary vectors.

import { gateSpectrumPosition } from './spectrumColor.js';
import { gateToLines } from './kingWen.js';

/**
 * Convert a gate's real data into a bipolar (-1/+1) pattern vector -- the
 * format Hopfield networks use. Combines the 6 King Wen lines (already
 * -1/+1 after conversion) with the gate's spectrum position, binarized.
 */
export function gateToPattern(gate) {
  const lines = gateToLines(gate).map((bit) => (bit === 1 ? 1 : -1)); // 0/1 -> -1/+1
  const spectrumPos = gateSpectrumPosition(gate); // 0-63
  const spectrumBits = spectrumPos
    .toString(2)
    .padStart(6, "0")
    .split("")
    .map((b) => (b === "1" ? 1 : -1));
  return [...lines, ...spectrumBits]; // 12-dimensional bipolar pattern
}

/**
 * Build a Hopfield network by storing a set of gate patterns. Weight
 * matrix set ONCE via the Hebbian outer-product rule -- this is the
 * entire "training" step, and it's a single deterministic calculation,
 * not an iterative gradient process.
 */
export function buildHopfieldNetwork(gates) {
  const patterns = gates.map(gateToPattern);
  const n = patterns[0].length;
  const weights = Array.from({ length: n }, () => Array(n).fill(0));

  for (const pattern of patterns) {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i !== j) weights[i][j] += pattern[i] * pattern[j];
      }
    }
  }
  // Normalize by number of stored patterns (standard Hopfield convention)
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      weights[i][j] /= patterns.length;
    }
  }

  return { weights, storedGates: gates, dimensions: n };
}

/** Energy of a given state under the network -- the "how far from a
 * stable attractor" measure. Lower = closer to / at a stored pattern. */
export function energy(network, state) {
  const { weights, dimensions } = network;
  let e = 0;
  for (let i = 0; i < dimensions; i++) {
    for (let j = 0; j < dimensions; j++) {
      e += weights[i][j] * state[i] * state[j];
    }
  }
  return -0.5 * e;
}

/**
 * Given a partial/noisy input pattern, let the network settle downhill
 * into the nearest stored attractor -- asynchronous update, one neuron
 * at a time, until stable. This is real pattern completion: feed in a
 * corrupted/partial gate signature, get back the nearest whole one.
 */
export function settle(network, inputPattern, maxIterations = 100) {
  const { weights, dimensions } = network;
  let state = [...inputPattern];
  const energyTrace = [energy(network, state)];

  for (let iter = 0; iter < maxIterations; iter++) {
    let changed = false;
    for (let i = 0; i < dimensions; i++) {
      let sum = 0;
      for (let j = 0; j < dimensions; j++) {
        sum += weights[i][j] * state[j];
      }
      const newVal = sum >= 0 ? 1 : -1;
      if (newVal !== state[i]) {
        state[i] = newVal;
        changed = true;
      }
    }
    energyTrace.push(energy(network, state));
    if (!changed) break; // settled -- reached a stable attractor
  }

  return { finalState: state, energyTrace, iterations: energyTrace.length - 1 };
}

/** Identify which stored gate (if any) a settled state matches exactly. */
export function identifyAttractor(network, settledState) {
  for (const gate of network.storedGates) {
    const pattern = gateToPattern(gate);
    if (pattern.every((v, i) => v === settledState[i])) {
      return gate;
    }
  }
  return null; // settled into a spurious/unrecognized attractor -- real Hopfield networks do this
}

// ============================================================
// Self-test
// ============================================================
function _selfTest() {
  // Store a few gates we've verified tonight as attractors
  const storedGates = [6, 28, 55, 56, 59];
  const network = buildHopfieldNetwork(storedGates);
  console.log(`Hopfield network built: ${network.dimensions}D, ${storedGates.length} stored patterns (gates ${storedGates.join(", ")})`);

  // Corrupt gate 56's pattern (flip 2 of 12 bits) and see if it settles back
  const truePattern = gateToPattern(56);
  const corrupted = [...truePattern];
  corrupted[0] *= -1;
  corrupted[7] *= -1;
  console.log("\nGate 56, true pattern:     ", truePattern);
  console.log("Corrupted input (2 bits flipped):", corrupted);

  const result = settle(network, corrupted);
  console.log("Settled state:             ", result.finalState);
  console.log("Energy trace (should decrease):", result.energyTrace.map((e) => e.toFixed(2)));
  console.log("Converged in", result.iterations, "iterations");

  const identified = identifyAttractor(network, result.finalState);
  console.log("Identified attractor gate:", identified, identified === 56 ? "(correct recovery!)" : "(settled elsewhere)");
}

try {
  const isDirectRun =
    typeof process !== "undefined" &&
    import.meta.url === `file://${process.argv[1]}`;
  if (isDirectRun) _selfTest();
} catch (_) { /* browser context, skip */ }
