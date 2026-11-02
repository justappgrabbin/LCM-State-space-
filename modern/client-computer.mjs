/**
 * LCM Client Computer — capability-driven assembly, not a hardcoded tool menu.
 *
 * An individual Klein tool is not treated as a fixed UI action. The same
 * addressed context can be expressed by any registered, approved capability.
 * This runtime is an EXPERIMENTAL adapter; it does not replace the historical
 * tools or the canonical address engine.
 *
 * Node 18+, zero runtime dependencies. Optional mesh: EventMesh instance from
 * extracted/synthia-klein-mesh-poc-7/synthia-klein-mesh-poc/src/mesh/EventMesh.js.
 */
import { createHash, randomUUID } from 'node:crypto';

const canon = (x) => JSON.stringify(sortObject(x));
function sortObject(x) {
  if (Array.isArray(x)) return x.map(sortObject);
  if (x && typeof x === 'object') {
    return Object.fromEntries(Object.keys(x).sort().map(k => [k, sortObject(x[k])]));
  }
  return x;
}
const digest = (x) => createHash('sha256').update(canon(x)).digest('hex');

function normalizedManifest(m) {
  if (!m || !/^[a-z][a-z0-9._-]*$/.test(m.id ?? '') ||
      !/^\d+\.\d+\.\d+$/.test(m.version ?? '') ||
      typeof m.provides !== 'string' || !m.provides ||
      !Array.isArray(m.requires) || m.requires.some(x => typeof x !== 'string' || !x)) {
    throw new Error('manifest needs id, semver, provides and requires[]');
  }
  if (m.requires.includes(m.provides)) throw new Error('self dependency');
  if (new Set(m.requires).size !== m.requires.length) throw new Error('duplicate dependencies');
  if (!m.dimension || !['Movement', 'Evolution', 'Being', 'Design', 'Space'].includes(m.dimension)) {
    throw new Error('manifest must select an EXISTING dimensional lens');
  }
  if (typeof m.permission !== 'string' || !m.permission) throw new Error('explicit permission required');
  const cost = m.cost ?? 1;
  if (!Number.isFinite(cost) || cost < 0) throw new Error('invalid cost');
  return Object.freeze({ id: m.id, version: m.version, requires: Object.freeze([...m.requires]),
    provides: m.provides, dimension: m.dimension, permission: m.permission,
    cost, description: m.description ?? '' });
}

/** Registry is populated by trusted adapters at runtime. No fixed tool paths. */
export class CapabilityRegistry {
  #caps = new Map();
  register(manifest, handler) {
    const m = normalizedManifest(manifest);
    if (typeof handler !== 'function') throw new Error('registered capability must have an executable handler');
    if (this.#caps.has(m.id)) throw new Error('capability already registered: ' + m.id);
    this.#caps.set(m.id, Object.freeze({ manifest: m, handler }));
    return m;
  }
  list() { return [...this.#caps.values()].map(x => x.manifest); }
  candidates(type) {
    return [...this.#caps.values()]
      .filter(x => x.manifest.provides === type)
      .sort((a,b) => a.manifest.cost-b.manifest.cost || a.manifest.id.localeCompare(b.manifest.id));
  }
  get(id) { return this.#caps.get(id); }
}

/** The same registry can drive different personalized client computers. */
export class ClientComputer {
  constructor({ id, registry, permissions = [], mesh = null }) {
    if (!id || !(registry instanceof CapabilityRegistry)) throw new Error('client id + registry required');
    this.id = id;
    this.registry = registry;
    this.permissions = new Set(permissions);
    this.mesh = mesh;
    this.receipts = [];
  }

  /**
   * Backward chain over typed capabilities. Hardcoded workflows are replaced
   * by the graph of declared needs -> providers. The least-total-cost
   * acyclic plan is chosen; requirements may be satisfied by input materials.
   */
  plan(goal, inputs = {}) {
    const provided = new Set(Object.keys(inputs));
    const find = (type, available, visiting) => {
      if (available.has(type)) return { cost: 0, steps: [], available };
      if (visiting.has(type)) return null;
      let best = null;
      for (const entry of this.registry.candidates(type)) {
        const m = entry.manifest;
        if (!this.permissions.has(m.permission)) continue;
        let state = new Set(available), steps = [], cost = m.cost, valid = true;
        for (const dep of m.requires) {
          const sub = find(dep, state, new Set([...visiting, type]));
          if (!sub) { valid = false; break; }
          state = sub.available; steps = [...steps, ...sub.steps]; cost += sub.cost;
        }
        if (!valid) continue;
        state.add(m.provides);
        if (!steps.some(s => s.id === m.id)) steps.push(m);
        const option = { cost, steps, available: state };
        if (!best || option.cost < best.cost ||
            (option.cost === best.cost &&
              option.steps.map(s => s.id).join(':') < best.steps.map(s=>s.id).join(':'))) {
          best = option;
        }
      }
      return best;
    };
    const selected = find(goal, provided, new Set());
    if (!selected) return { status: 'unresolved', goal, missingOrUnauthorized: true, steps: [] };
    return { status: 'planned', goal, cost: selected.cost,
      steps: selected.steps.map(m => ({ ...m })), inputs: [...provided].sort() };
  }

  /** No implicit writes: only explicit, permissioned execute() runs handlers. */
  async execute(goal, inputs = {}, { address, toolIds, dryRun = false } = {}) {
    if (!address || !Array.isArray(toolIds) || toolIds.length < 2 ||
        new Set(toolIds).size !== toolIds.length) {
      throw new Error('canonical node address and >=2 co-active tool IDs required');
    }
    const plan = this.plan(goal, inputs);
    if (dryRun || plan.status !== 'planned') return plan;
    const material = { ...inputs }; // provided inputs are never mutated
    const receipts = [];
    for (const step of plan.steps) {
      if (!this.permissions.has(step.permission)) throw new Error('permission revoked: ' + step.id);
      const handler = this.registry.get(step.id)?.handler;
      if (typeof handler !== 'function') throw new Error('handler missing: ' + step.id);
      const deps = Object.fromEntries(step.requires.map(k => [k, material[k]]));
      const value = await handler(Object.freeze({ ...deps }), Object.freeze({
        clientId: this.id, address, toolIds: Object.freeze([...toolIds]),
        dimensions: Object.freeze(['Movement','Evolution','Being','Design','Space']),
        priorReceipts: Object.freeze([...receipts]) }));
      if (value === undefined) throw new Error('capability produced no result: ' + step.id);
      material[step.provides] = value;
      const receipt = Object.freeze({
        event: randomUUID(), client: this.id, address, toolIds: [...toolIds],
        capability: step.id, version: step.version, dimension: step.dimension,
        requires: [...step.requires], provides: step.provides,
        inputHash: digest(deps), outputHash: digest(value),
        parents: receipts.map(x=>x.event), approvedScope: step.permission
      });
      receipts.push(receipt);
      this.receipts.push(receipt);
      // Existing EventMesh creates channels on first actual publication.
      if (this.mesh) this.mesh.publish('client.capability.executed', step.id, receipt);
    }
    return { status: 'executed', goal, output: material[goal],
      plan: plan.steps.map(s => s.id), receipts };
  }

  /** Tool suggestions remain proposals, not self-installing executable code. */
  proposal(manifest) {
    const m = normalizedManifest(manifest);
    const record = { status: 'pending-review', client: this.id, manifest: m,
      manifestHash: digest(m), reason: 'Requires trusted handler registration and approval' };
    if (this.mesh) this.mesh.publish('client.capability.proposed', this.id, record);
    return record;
  }
}
