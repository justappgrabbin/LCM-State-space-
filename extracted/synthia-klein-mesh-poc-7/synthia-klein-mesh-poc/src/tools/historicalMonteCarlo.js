// historicalMonteCarlo.js
// Klein 1966: "Historical Change in Language using Monte Carlo Techniques."
// Simulates drift in a set of weighted rule variants over generations:
// each generation, every variant's weight gets a small random perturbation
// (mutation), then weights are renormalized (selection pressure toward
// whichever variants got lucky), tracking the population trajectory.

import { ToolBase } from './ToolBase.js';

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class HistoricalMonteCarlo extends ToolBase {
  constructor(mesh) {
    super(mesh, 'HistoricalMonteCarlo', 'sim.montecarlo');
  }

  /**
   * input = {
   *   variants: { [name]: initialWeight },  // weights need not sum to 1
   *   generations: number,
   *   mutationScale?: number,  // stddev-ish of perturbation, default 0.1
   *   seed?: number,
   * }
   */
  run(input) {
    const { variants, generations = 20, mutationScale = 0.1, seed = 7 } = input;
    const rng = mulberry32(seed);
    let weights = { ...variants };
    const trajectory = [{ generation: 0, weights: normalize(weights) }];

    for (let g = 1; g <= generations; g++) {
      const next = {};
      for (const [name, w] of Object.entries(weights)) {
        const perturb = (rng() - 0.5) * 2 * mutationScale; // [-scale, +scale]
        next[name] = Math.max(0, w * (1 + perturb));
      }
      weights = next;
      trajectory.push({ generation: g, weights: normalize(weights) });
    }

    const final = normalize(weights);
    const dominant = Object.entries(final).sort((a, b) => b[1] - a[1])[0];

    return { ok: true, finalWeights: final, dominantVariant: dominant?.[0], trajectory };
  }
}

function normalize(weights) {
  const total = Object.values(weights).reduce((s, w) => s + w, 0) || 1;
  const out = {};
  for (const [k, v] of Object.entries(weights)) out[k] = v / total;
  return out;
}
