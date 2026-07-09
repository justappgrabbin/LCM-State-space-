// head.js — THE HEAD
//
// Takes anything in, decides what it is, decides where it belongs in the
// mesh, and files it onto that tool's channel. This is the dispatcher role:
// it doesn't generate or extract anything itself, it routes. Deterministic
// pattern-matching, no model call — classification is structural (shape of
// the input object), not semantic guessing.

import { ToolBase } from './ToolBase.js';

// Each rule: a predicate over the input shape, and the channel it belongs on.
// Order matters — first match wins, so put more specific shapes first.
const ROUTES = [
  { test: (x) => Array.isArray(x.lines) && x.lines.length === 6, channel: 'symbol.iching', tool: 'IChingGrammar' },
  { test: (x) => Array.isArray(x.agents) && Array.isArray(x.rules), channel: 'sim.messy', tool: 'Messy' },
  { test: (x) => x.vocab && x.A && x.B && x.C, channel: 'reason.analogy', tool: 'AnalogyEngine' },
  { test: (x) => x.grammarA && x.grammarB, channel: 'lang.contact', tool: 'LanguageContact' },
  { test: (x) => x.variants && typeof x.generations === 'number', channel: 'sim.montecarlo', tool: 'HistoricalMonteCarlo' },
  { test: (x) => Array.isArray(x.corpus) && x.term, channel: 'lang.diseminer', tool: 'Diseminer' },
  { test: (x) => x.query && (x.language !== undefined || x.maxResults !== undefined), channel: 'code.githubrag', tool: 'GitHubRAG' },
  { test: (x) => x.mode === 'generate' || x.mode === 'recognize', channel: 'lang.autoling', tool: 'AutoLing' },
  { test: (x) => x.provider && x.prompt, channel: 'hub.ninthcenter', tool: 'AIHub' },
  { test: (x) => typeof x.seed === 'number' && !x.lines, channel: 'narrative.novelwriter', tool: 'NovelWriter' },
  { test: (x) => typeof x.code === 'string', channel: 'sandbox.code', tool: 'sandboxRunner.submitCode' },
  { test: (x) => typeof x.content === 'string' && x.title, channel: 'sandbox.paper', tool: 'sandboxRunner.submitPaper' },
];

export class Head extends ToolBase {
  constructor(mesh) {
    super(mesh, 'Head', 'head.dispatch');
    this.registry = new Map(); // toolName -> tool instance, for real invocation
  }

  /** Register a live tool instance so Head can actually call it, not just route to it. */
  register(toolName, toolInstance) {
    this.registry.set(toolName, toolInstance);
  }

  /** Classify input, file it onto the matching channel, return the decision. */
  run(input) {
    for (const route of ROUTES) {
      if (route.test(input)) {
        return { ok: true, filedTo: route.channel, handledBy: route.tool, reason: `matched shape for ${route.tool}` };
      }
    }
    return { ok: false, filedTo: 'mesh.unfiled', handledBy: null, reason: 'no route matched this shape — needs a human or a new rule' };
  }

  /**
   * Classify, publish the routing decision, AND actually invoke the
   * matched tool if it's registered. This is the real auto-dispatch loop —
   * without register(), dispatch() degrades to filing-only (still useful,
   * but nothing executes).
   */
  async dispatch(input) {
    const decision = this.run(input);
    this.mesh.publish(this.channel, this.name, decision); // log the routing decision

    const tool = this.registry.get(decision.handledBy);
    if (!tool) {
      this.mesh.publish(decision.filedTo, this.name, input); // filed only, no executor registered
      return { ...decision, executed: false };
    }

    const result = await tool.runAndPublish(input); // ACTUALLY RUNS the matched tool
    return { ...decision, executed: true, result };
  }
}
