// languageContact.js
// Klein 1974: "Computer Simulation of Language Contact Models" — two rule
// systems in contact produce borrowed/blended forms over time. Implemented
// as a stochastic merge: each generation, rules from grammar B have a
// probability of replacing the corresponding rule in grammar A.

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

export class LanguageContact extends ToolBase {
  constructor(mesh) {
    super(mesh, 'LanguageContact', 'lang.contact');
  }

  /**
   * input = {
   *   grammarA: { [ruleName]: value },
   *   grammarB: { [ruleName]: value },
   *   contactRate: number (0..1, probability B's rule wins per generation),
   *   generations: number,
   *   seed?: number
   * }
   */
  run(input) {
    const { grammarA, grammarB, contactRate = 0.15, generations = 10, seed = 1 } = input;
    const rng = mulberry32(seed);
    let current = { ...grammarA };
    const trajectory = [{ generation: 0, grammar: { ...current } }];

    for (let g = 1; g <= generations; g++) {
      const next = { ...current };
      for (const rule of Object.keys(grammarB)) {
        if (rng() < contactRate) next[rule] = grammarB[rule];
      }
      current = next;
      trajectory.push({ generation: g, grammar: { ...current } });
    }

    const borrowedCount = Object.keys(grammarB).filter((r) => current[r] === grammarB[r] && grammarA[r] !== grammarB[r]).length;

    return { ok: true, finalGrammar: current, borrowedCount, trajectory };
  }
}
