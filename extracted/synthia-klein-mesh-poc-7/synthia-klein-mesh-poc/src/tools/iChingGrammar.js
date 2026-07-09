// iChingGrammar.js
// Klein 1996: "Grammars, the I Ching and Levi-Strauss" — maps hexagram
// structure (6 binary lines, two trigrams) onto a feature-vector grammar.
// This gives you the literal bridge from a hexagram number to a semantic
// feature set, usable as input to AnalogyEngine or AutoLing.

import { ToolBase } from './ToolBase.js';

const TRIGRAM_FEATURES = {
  '111': ['creative', 'heaven', 'active'],
  '000': ['receptive', 'earth', 'yielding'],
  '100': ['arousing', 'thunder', 'initiating'],
  '010': ['abysmal', 'water', 'dangerous'],
  '001': ['keeping_still', 'mountain', 'bounded'],
  '011': ['gentle', 'wind', 'penetrating'],
  '101': ['clinging', 'fire', 'clarifying'],
  '110': ['joyous', 'lake', 'open'],
};

export class IChingGrammar extends ToolBase {
  constructor(mesh) {
    super(mesh, 'IChingGrammar', 'symbol.iching');
  }

  /** input = { lines: [1|0, ...6 of them] }  (bottom-to-top, 1=yang, 0=yin) */
  run(input) {
    const { lines } = input;
    if (!Array.isArray(lines) || lines.length !== 6) {
      return { ok: false, error: 'lines must be an array of 6 binary values' };
    }
    const lower = lines.slice(0, 3).join('');
    const upper = lines.slice(3, 6).join('');
    const lowerFeatures = TRIGRAM_FEATURES[lower] || [];
    const upperFeatures = TRIGRAM_FEATURES[upper] || [];
    const binaryValue = parseInt(lines.slice().reverse().join(''), 2);

    return {
      ok: true,
      binaryValue,
      lowerTrigram: lower,
      upperTrigram: upper,
      features: [...new Set([...lowerFeatures, ...upperFeatures])],
      changingLines: lines.map((l, i) => (l === 1 ? i + 1 : null)).filter(Boolean),
    };
  }
}
