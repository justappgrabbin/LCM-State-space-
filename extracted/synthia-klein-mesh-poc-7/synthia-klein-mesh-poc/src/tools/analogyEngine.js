// analogyEngine.js
// Klein 1983: "Analogy and Mysticism and the Structure of Culture" — analogy
// solved structurally via Boolean feature-vector transformation, not by
// surface similarity. Solves A:B::C:? by computing the feature delta
// between A and B (as a Boolean/bitmask vector) and applying that same
// transformation to C.

import { ToolBase } from './ToolBase.js';

function toBits(features, vocab) {
  return vocab.map((f) => (features.includes(f) ? 1 : 0));
}

function xor(a, b) {
  return a.map((bit, i) => bit ^ b[i]);
}

function fromBits(bits, vocab) {
  return vocab.filter((_, i) => bits[i] === 1);
}

export class AnalogyEngine extends ToolBase {
  constructor(mesh) {
    super(mesh, 'AnalogyEngine', 'reason.analogy');
  }

  /**
   * input = {
   *   vocab: string[],            // full feature universe
   *   A: string[], B: string[],   // feature sets for A and B
   *   C: string[],                // feature set for C
   * }
   * Solves: A is to B as C is to ?  (applies A->B's Boolean delta onto C)
   */
  run(input) {
    const { vocab, A, B, C } = input;
    const bitsA = toBits(A, vocab);
    const bitsB = toBits(B, vocab);
    const bitsC = toBits(C, vocab);
    const delta = xor(bitsA, bitsB);       // the transformation A->B
    const bitsD = xor(bitsC, delta);       // apply same transformation to C
    const D = fromBits(bitsD, vocab);

    return {
      ok: true,
      transformation: fromBits(delta, vocab),
      result: D,
      explanation: `A->B changed features [${fromBits(delta, vocab).join(', ')}]; applying that same change to C yields D.`,
    };
  }
}
