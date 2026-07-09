// autoling.js
// Klein 1968: "The AUTOLING System" — a meta-linguistic NLP system whose
// semantic/syntactic production rules are DATA, and the same rule table
// drives both generation (structure -> surface string) and recognition
// (surface string -> structure). That bidirectionality is the whole point;
// this implementation keeps ONE rule table and runs it both ways.

import { ToolBase } from './ToolBase.js';

// Rule table: relation name -> { generate, recognize }
// generate(args) -> surface string
// recognize(tokens) -> { matched, relation, args, rest } | null
const RULES = {
  HAS_PROPERTY: {
    generate: ([obj, prop]) => `${obj} is ${prop}`,
    pattern: /^(\w+) is (\w+)$/,
    recognize(tokens) {
      const m = tokens.join(' ').match(this.pattern);
      return m ? { relation: 'HAS_PROPERTY', args: [m[1], m[2]] } : null;
    },
  },
  ACTS_ON: {
    generate: ([subj, verb, obj]) => `${subj} ${verb} ${obj}`,
    pattern: /^(\w+) (\w+s) (\w+)$/,
    recognize(tokens) {
      const m = tokens.join(' ').match(this.pattern);
      return m ? { relation: 'ACTS_ON', args: [m[1], m[2], m[3]] } : null;
    },
  },
  PART_OF: {
    generate: ([part, whole]) => `${part} belongs to ${whole}`,
    pattern: /^(\w+) belongs to (\w+)$/,
    recognize(tokens) {
      const m = tokens.join(' ').match(this.pattern);
      return m ? { relation: 'PART_OF', args: [m[1], m[2]] } : null;
    },
  },
};

export class AutoLing extends ToolBase {
  constructor(mesh) {
    super(mesh, 'AutoLing', 'lang.autoling');
  }

  /**
   * input = { mode: 'generate', relation: 'HAS_PROPERTY', args: [...] }
   *      or { mode: 'recognize', text: 'gate17 is mutative' }
   */
  run(input) {
    if (input.mode === 'generate') {
      const rule = RULES[input.relation];
      if (!rule) return { ok: false, error: `unknown relation ${input.relation}` };
      return { ok: true, mode: 'generate', surface: rule.generate(input.args) };
    }
    if (input.mode === 'recognize') {
      const tokens = input.text.split(/\s+/);
      for (const [name, rule] of Object.entries(RULES)) {
        const hit = rule.recognize(tokens);
        if (hit) return { ok: true, mode: 'recognize', ...hit };
      }
      return { ok: false, error: 'no rule matched (recognition failed)' };
    }
    return { ok: false, error: 'mode must be generate|recognize' };
  }

  codegen(input) {
    if (!RULES[input.relation]) return `// no such relation: ${input.relation}`;
    const arity = input.args?.length ?? 2;
    const placeholders = Array.from({ length: arity }, (_, i) => `\${args[${i}]}`);
    const sample = RULES[input.relation].generate(placeholders);
    return [
      `export function generate_${input.relation}(args) {`,
      `  // args: array of ${arity} string(s)`,
      `  return \`${sample}\`;`,
      `}`,
    ].join('\n');
  }
}
