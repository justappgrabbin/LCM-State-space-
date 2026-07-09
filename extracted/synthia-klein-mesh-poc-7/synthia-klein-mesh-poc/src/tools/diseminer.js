// diseminer.js
// Klein, Lieman & Lindstrom 1968: "DISEMINER: A Distributional-Semantics
// Inference Maker." Infers semantic relatedness from distributional
// co-occurrence, not from a hand-built ontology. This implementation builds
// term vectors from co-occurrence counts in a small corpus and infers
// nearest neighbors via cosine similarity.

import { ToolBase } from './ToolBase.js';

function tokenize(text) {
  return text.toLowerCase().match(/[a-z0-9]+/g) || [];
}

function buildCooccurrence(corpus, windowSize = 2) {
  const vocab = new Set();
  const vectors = new Map(); // term -> Map(otherTerm -> count)

  for (const line of corpus) {
    const tokens = tokenize(line);
    tokens.forEach((t) => vocab.add(t));
    for (let i = 0; i < tokens.length; i++) {
      const center = tokens[i];
      if (!vectors.has(center)) vectors.set(center, new Map());
      for (let j = Math.max(0, i - windowSize); j <= Math.min(tokens.length - 1, i + windowSize); j++) {
        if (j === i) continue;
        const ctx = tokens[j];
        const v = vectors.get(center);
        v.set(ctx, (v.get(ctx) || 0) + 1);
      }
    }
  }
  return { vocab, vectors };
}

function cosine(vecA, vecB) {
  let dot = 0, magA = 0, magB = 0;
  const keys = new Set([...vecA.keys(), ...vecB.keys()]);
  for (const k of keys) {
    const a = vecA.get(k) || 0;
    const b = vecB.get(k) || 0;
    dot += a * b;
    magA += a * a;
    magB += b * b;
  }
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

export class Diseminer extends ToolBase {
  constructor(mesh) {
    super(mesh, 'Diseminer', 'lang.diseminer');
  }

  /** input = { corpus: string[], term: string, topN?: number } */
  run(input) {
    const { corpus, term, topN = 5 } = input;
    const { vectors } = buildCooccurrence(corpus);
    const target = vectors.get(term.toLowerCase());
    if (!target) return { ok: false, error: `"${term}" not found in corpus` };

    const scored = [];
    for (const [other, vec] of vectors) {
      if (other === term.toLowerCase()) continue;
      scored.push({ term: other, similarity: cosine(target, vec) });
    }
    scored.sort((a, b) => b.similarity - a.similarity);

    return { ok: true, term, neighbors: scored.slice(0, topN) };
  }
}
