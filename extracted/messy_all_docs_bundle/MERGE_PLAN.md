# MERGE PLAN

## Goal

Unify the current working pieces into one organism instead of three parallel systems.

The target is:
- one state-space core
- one morph bus
- one Klein tool layer
- one runtime spine
- one multimodal shell

---

## The Three Current Pieces

### 1. State-space core
This is the part that owns:
- coordinates
- gate semantics
- line/color/tone/base structure
- neighbors
- edge math
- attractor logic
- channel architecture mappings

This should remain the canonical truth layer.

### 2. Klein tool / mesh runtime
This is the part that owns:
- AutoLing
- Diseminer
- NovelWriter
- Messy
- MCP / sandbox / tool-facing runtime
- frontend and hub behavior

This should remain the canonical tool/runtime layer.

### 3. MorphBus concept
This is the part that owns:
- state-carrying communication
- channel-gated propagation
- perceptual tensor flow
- integration circuit backbone
- the transition from event bus to organism substrate

This should become the canonical communication layer.

---

## Final Runtime Spine

The runtime should execute in this order:

1. input enters organism
2. input is recognized into coordinate/state candidates
3. state-space core resolves candidate coordinates
4. MorphBus emits state-qualified signal
5. MorphBus checks valid channels and node relations
6. mesostate is computed or updated
7. edge-function emerges or strengthens
8. relevant organs are triggered
9. organs project into output forms
10. memory/persistence stores state transition
11. output is returned to browser shell / MCP / calling context

---

## What Each Layer Must Own

## A. State-space core owns
- coordinate schema
- gate semantic fields
- node contribution definitions
- line/color/tone/base modifiers
- degree/minute/second placement
- planetary qualifiers
- neighboring tendencies
- attractor / hopfield logic
- channel architecture mappings as equivalence tables only

This layer must not depend on the tool runtime.

---

## B. MorphBus owns
- signal tensor transport
- channel-gated propagation
- node-to-node relation checking
- mesostate / liminal state tracking
- edge-function emergence
- channel stabilization / destabilization
- center convergence readiness
- relation history

MorphBus is not only an event bus.
It is the state-aware relation substrate.

---

## C. Klein tools own

### AutoLing
- coordinate recognition from surface input
- coordinate generation into surface output
- bidirectional rule use
- mesh activation from recognition

### Diseminer
- propagation from active coordinates
- composite relation inference
- edge strengthening and semantic spread
- channel-level contextualization

### NovelWriter
- projection of active structures into language, narrative, and later multimodal outputs

### Messy
- state transitions
- recursive resolution
- simulation / codegen / world-model behavior

The tools must consume state-space + MorphBus, not invent their own semantics.

---

## Files To Keep As Canonical

## Keep as state-space core
- resonance engine / address-space / coordinate system files
- state space semantics
- dimensional channel / edge math
- hopfield attractor logic
- channel architecture mapping tables
- pending verification layer for unresolved claims

## Keep as tool/runtime core
- autoling
- diseminer
- novelWriter
- messy
- MCP / sandbox / runtime-facing pieces
- browser/frontend shell pieces that expose tools

## Keep as communication foundation
- MorphBus tensor model
- base/tone/color maps
- valid channel registry
- integration circuit registry

---

## Files To Replace Or Wrap

### Replace generic EventMesh behavior
Current generic event mesh behavior should be replaced or wrapped so that all organ/tool communication goes through MorphBus.

Rule:
- no direct tool-to-tool event passing without state-qualified MorphBus mediation

### Replace flat channel string lookup
Channel names alone are not enough.
A valid channel must also carry:
- relational quality
- process quality
- expression quality
- current mesostate
- edge-function type

### Replace bare gate IDs with node semantics
Every gate/node must eventually have:
- intrinsic contributions
- relational affordances
- polarity
- placement-sensitive modulation

---

## Missing Code That Must Be Added

## 1. Node function registry
A canonical registry describing what each node contributes before relation.

Minimum fields:
- gate id
- intrinsic contributions
- relational affordances
- polarity options
- quality tags
- neighboring tendencies

## 2. Mesostate model
A first-class object for the liminal in-between.

Minimum fields:
- stable / converging / liminal / resolving / stabilized
- tension
- coherence
- instability threshold
- edge weight
- channel confidence

## 3. Channel semantics registry
A registry describing channels as more than names.

Minimum fields:
- gate pair
- channel name
- edge-function type
- relational quality
- process quality
- expression quality
- stabilizing vs destabilizing tendency

## 4. Expanded tensor
The perceptual tensor must eventually include:
- gate
- line
- color
- tone
- base
- phi
- degree
- minute
- second
- optional planet
- optional center context
- optional identity/observer context

## 5. Runtime orchestrator
One explicit runtime that calls:
- state-space resolution
- MorphBus emit
- organ triggering
- projection
- persistence

---

## What To Build First

### Phase 1 — Merge the semantics
1. make state-space core the source of truth
2. wrap or replace EventMesh with MorphBus
3. route AutoLing activation into MorphBus
4. make Diseminer consume active coordinates from MorphBus
5. make NovelWriter consume stabilized structures from MorphBus

### Phase 2 — Add missing mechanics
1. add node function registry
2. add mesostate model
3. add channel semantics registry
4. expand tensor with degree/minute/second and optional planet

### Phase 3 — Add runtime behavior
1. add conversation loop
2. add multimodal projection loop
3. add tool-choice loop
4. add browsing/research loop
5. add identity/user-alignment loop

---

## What The Browser / MCP Layer Should Do

The top layer should not invent meaning.
It should expose organism behavior.

It should be able to:
- chat
- inspect files
- activate coordinates
- browse and research
- call tools
- project outputs
- visualize state-space and channels when useful

It should sit on top of the runtime spine, not beside it.

---

## Definition Of Done

The merge is complete when:
- one state-space core defines all coordinates and meanings
- one MorphBus mediates all organ relations
- one runtime spine orchestrates activation to output
- Klein tools consume shared semantics instead of local placeholders
- mesostates are first-class
- node contribution is represented before channel identity
- browser/MCP layer exposes organism behavior instead of only scaffolding

---

## Immediate Next Action

Do not keep building all pieces in parallel.

Pick one repo root as the merge target.
Then:
- move the state-space files in first
- move the Klein tools in second
- replace EventMesh with MorphBus third
- wire one end-to-end path before doing anything else

That end-to-end path should be:

input -> AutoLing -> state-space resolution -> MorphBus -> Diseminer -> NovelWriter -> output

Once that works, the rest can be layered on top without drifting.
