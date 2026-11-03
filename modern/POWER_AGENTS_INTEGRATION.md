# Power Agents — local integration notes

This is an **additive integration inside LCM**, on `feature/klein-multimodal-adapters-20261102`. It is **not** a new Tool Factory, a new MESSY, a new renderer, a neural model, or a completed coherent agent.

## Original modules reused unchanged

- `modern/vendor/tool-factory/src/integrated-tool-factory.mjs`: exact source copy from the user's `justappgrabbin/fantastic4` `runtime/vendor/tool-factory/src/integrated-tool-factory.mjs`; original Git blob `eb05b89f808debc72ec86666410fd508c37a84b7`. This is the actual **Cynthia Integrated Tool Factory v1.6.0**, not a reimplementation. Its original `generate`, lifecycle, lineage and eight structural levels are retained.
- `modern/vendor/tool-factory/src/ato-native-bridge.mjs`: exact unmodified source copy from `fantastic4/runtime/vendor/tool-factory/src/ato-native-bridge.mjs`; original Git blob `d4e8580892866b4201eab71ed2b35028f2655bbb`. Its ATO mounting entry points remain available for an eventual ATO host. No new ATO engine is constructed.
- `modern/vendor/king-wen.mjs`: exact unmodified source copy from `fantastic4/runtime/vendor/ato-core/src/king-wen.mjs`; original Git blob `7af065f29d3f9b0849e7e74bbf5be779ec4fc7ce`. This is *hexagram reference bits*, not a fixed lookup table of allowed channels.
- Existing LCM `extracted/synthia-klein-mesh-poc-7/.../src/tools/messy.js` supplies **MESSY.run()** and **MESSY.codegen()**; `src/mesh/EventMesh.js` supplies the local event bus.
- Existing LCM `modern/client-computer.mjs` supplies the permissioned, typed capability registry/planner. `modern/python-faces.mjs`, `modern/klein_modern.py`, and `modern/faces.manifest.json` supply the **existing** creation/editing operations for code, images and videos. No new media generator was written.

## Only new functionality added

`modern/power-agents.mjs` assigns up to **64 occupied gate slots in each of the existing five dimensional places** (Movement/Evolution/Being/Design/Space) through the original Tool Factory, or attaches a real existing Klein tool instance. It forms executable links only when Hamming distance is **exactly 1 at an independently inspected level** (Gate, Line, Color, Tone, Base, Degree, Minute, Second, or Arc where specified). Gate bits come from `gateToLines`. No 36-channel Human Design fixed-pair table is used to decide connectivity. Missing fine-arc values are unknown, not fabricated.

Self-reference is *not* mislabeled as Hamming-1: `feedback` offers a capped (1–8 steps) local recurrence with history. `registerLink` exposes a real edge to the existing `CapabilityRegistry`, preserving `ClientComputer` permission checks. Runtime requires no remote API or second repository. The original repo `fantastic4` was **not modified**.

`messyWorld` reuses the original MESSY simulation and canvas generator. **Important:** MESSY's HTML currently animates default bouncing motion; it does not serialize arbitrary simulation rule callbacks into HTML. The existing Python Klein media adapters do image and MP4 create/edit; they are not pretrained generative image or video AI.

### 45° and different kinds of output

The existing `modern/klein_modern.py` `transform_image(...,[{'action':'rotate','degrees':45}])` already supports a **45-degree image rotation** without mutating its source. A separate test probes it. This is a media projection, not a substitute for the per-level Hamming-1 topology rule. If the user's “45°” designates a distinct structural orientation, its canonical semantics must be sourced before changing topology.

## The future world and offspring boundary

Reproduction is **not active**, and this adapter cannot create offspring. `reproductionStatus()` reports a locked state. Even if later code confirms completion, a real verifier, an explicit model/permission contract, and the actual offspring operation must be implemented and tested *after* the world is completed. No pretend babies, surrogate agent-spawning mechanism, or self-copy loophole is included.

## Verification

```bash
node --test modern/tests/*.test.mjs
python -m pytest -q modern/tests
```

GitHub Actions `.github/workflows/klein-modern.yml` runs the JS tests and existing Python tests. The vendor sources remain identical to the original Git blobs; the only production runtime logic newly authored is the adapter. Existence of this tested integration alone does **not** establish a neural language model, correct canonical Klein joint operator, fully autonomous agent, or a completed subjective world.

## Integration example

```js
import { PowerAgent } from './modern/power-agents.mjs';
import { CapabilityRegistry, ClientComputer } from './modern/client-computer.mjs';

const agent = new PowerAgent({id:'local-client'});
const left = agent.assign({dimension:'Movement',gate:1,purpose:'analyze observations',level:4});
const right = agent.assign({dimension:'Design',gate:43,purpose:'analyze patterns',level:4});
const link = agent.connect({
  from:{dimension:'Movement',gate:1},
  to:{dimension:'Design',gate:43},
  level:'gate'
}); // actual canonical line-bit Hamming 1, never a hardcoded channel
const registry = new CapabilityRegistry();
const goal = agent.registerLink(registry,link.id);
const client = new ClientComputer({id:'local-client',registry,permissions:['power.execute']});
const result = await client.execute(goal,{'power.input':'alpha beta'},{
  address:'gate:1→43',
  toolIds:[left.tool.id,right.tool.id]
});
console.log(result.output);
```
