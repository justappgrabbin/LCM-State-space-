# MIGRATION MAP

## Goal

Consolidate the uploaded prototypes and loose modules into one canonical monorepo without redesigning the product.

The runtime base is the kiosk/runtime project unless later inspection of remaining uploads proves a stronger runtime spine.

---

## Canonical Monorepo Target

```text
repo/
  apps/
    runtime/
    browser-shell/

  packages/
    ontology/
    state-space/
    mesh/
    bus/
    activation/
    projection/
    identity-center/
    types/
    persistence/
    ingestion/
    hd-graph/
    self-supervised/
    resonance-core/
    ui/
    organs-autoling/
    organs-diseminer/
    organs-novel-writer/

  services/
    resonance-market-api/
    oracle-py/
    chart-oracle/

  shared/
    config/
    schemas/
    utils/

  docs/
    FOUNDATION.md
    ONTOLOGY.md
    MESH.md
    ACTIVATION.md
    MIGRATION_MAP.md
    ARCHIVE_POLICY.md

  archived/
```

---

## Intake Classification

### 1. `synthia-kiosk-2(1).zip`

**Status:** Keep as canonical base

**Destination:** `apps/runtime`

**Reason:**
- strongest current runtime candidate
- already includes server/runtime structure
- already includes message-bus substrate
- already includes orchestration-oriented source layout

**Action:**
- move runtime app into `apps/runtime`
- extract reusable logic into packages
- leave only boot/orchestration code in the app

---

### 2. `synthia-browser(2).zip`

**Status:** Keep as browser shell

**Destination:** `apps/browser-shell`

**Reason:**
- clear React/Vite browser-facing app
- good candidate for canonical UI shell
- should not remain a second backend or second runtime

**Action:**
- move browser app into `apps/browser-shell`
- extract shared components into `packages/ui`
- extract reusable browser logic into `packages/projection` or `packages/ui`

---

### 3. `synthia-v9.1(2).zip`

**Status:** Partial extraction, likely archive after extraction

**Destination:**
- reusable parts -> `packages/resonance-core`
- leftovers -> `archived/synthia-v9.1/`

**Reason:**
- appears to contain valuable domain modules
- should not remain a competing app/runtime

**Action:**
- extract unique domain logic only
- reject duplicate app/runtime patterns
- archive residual prototype structure intact

---

### 4. `synthia-ast-engine-2.zip`

**Status:** Keep as module

**Destination:** `packages/ingestion`

**Reason:**
- isolated engine concern
- belongs in file/AST ingestion pipeline

**Action:**
- convert into canonical ingestion package
- connect to runtime through mesh/bus
- remove any standalone app assumptions

---

### 5. `HDGraphEngine-1.ts`

**Status:** Keep as module

**Destination:** `packages/hd-graph`

**Reason:**
- graph engine concern
- should become canonical graph package

**Action:**
- move into graph package
- normalize exports
- align types to shared ontology/types package

---

### 6. `Tensor.ts`

**Status:** Keep as supporting module

**Destination:** `packages/hd-graph`

**Reason:**
- likely graph/math support for HD graph engine

**Action:**
- colocate with graph engine
- keep only if used by canonical graph path

---

### 7. `synthia-self-supervised-engine (2).ts`

**Status:** Keep as module

**Destination:** `packages/self-supervised`

**Reason:**
- independent engine concern
- should not be embedded ad hoc in runtime app

**Action:**
- wrap with shared interfaces
- connect through bus/mesh
- remove standalone assumptions

---

### 8. `ResonanceMarketClient.ts`

**Status:** Keep as service module

**Destination:** `services/resonance-market-api`

**Reason:**
- external integration concern
- belongs behind service boundary

**Action:**
- wrap into stable service API
- normalize request/response contracts
- expose through shared types only

---

### 9. `AutopoeticResonanceEngine_v7-1.zip`

**Status:** Partial extraction, likely archive after extraction

**Destination:**
- useful logic -> `packages/persistence`, `packages/projection`, or `packages/resonance-core`
- leftovers -> `archived/AutopoeticResonanceEngine/`

**Reason:**
- likely contains useful ideas/components
- should not remain a competing organism/runtime

**Action:**
- extract only unique pieces
- archive the rest intact with note

---

### 10. `DebateCopilot(1).zip`

**Status:** Archive for now

**Destination:** `archived/DebateCopilot/`

**Reason:**
- Android/Kotlin client appears out-of-band relative to canonical JS/TS organism body
- not needed for first canonical monorepo spine

**Action:**
- archive intact
- revisit only if a mobile client becomes explicitly in scope

---

## Incoming PDFs and Reference Material

### Klein reference set
- AUTOLING
- DISEMINER
- Automatic Novel Writing
- MESSY / meta-symbolic material
- grammar / simulation / language-contact papers

**Status:** Reference canon

**Destination:**
- `docs/references/` or preserved external research archive

**Reason:**
- conceptual and architectural reference
- not directly product runtime code

**Action:**
- use for doctrine, naming, organ boundaries, and historical grounding
- do not treat as runtime source code

---

## Canonical Package Responsibilities

### `packages/ontology`
Source of truth for:
- dimensions
- planets
- centers
- gates/hexagrams
- lines
- colors
- tones
- bases
- macro/micro correspondences
- provisional arc structures

### `packages/state-space`
Source of truth for:
- latent state definitions
- addressing model
- state activation addressing
- discrete + continuous state composition

### `packages/mesh`
Source of truth for:
- message routing
- channel traversal
- morphing rules
- edge creation
- convergence logic

### `packages/bus`
Source of truth for:
- concrete event transport
- local message delivery
- adapters for runtime communication

### `packages/activation`
Source of truth for:
- activation grammars
- human-design-triggered activation
- response-pattern-triggered activation
- recursive activation logic

### `packages/projection`
Source of truth for:
- language projection
- code projection
- image projection
- sound projection
- UI state projection

### `packages/identity-center`
Source of truth for:
- user-alignment hub
- model adapters
- MCP bridges
- tool routing profile
- user semantic preferences

### `packages/types`
Source of truth for:
- shared TypeScript contracts
- typed runtime messages
- shared entity models
- generated schema bindings

### `packages/persistence`
Source of truth for:
- local-first storage
- activation history
- traversal history
- user alignment state
- state snapshots

### `packages/ingestion`
Source of truth for:
- file ingestion
- source parsing
- AST extraction
- normalized raw/parsed artifacts

### `packages/hd-graph`
Source of truth for:
- graph structures
- graph traversal
- tensor support if retained
- graph update projections

### `packages/self-supervised`
Source of truth for:
- self-supervised engine logic
- training and adaptation hooks
- optional local learning logic

### `packages/resonance-core`
Source of truth for:
- extracted reusable resonance/domain logic from v9.1 and related prototypes

### `packages/ui`
Source of truth for:
- shared components
- shared visual primitives
- shell-independent UI pieces

---

## Canonical App Responsibilities

### `apps/runtime`
Only responsible for:
- booting the organism
- loading ontology/state-space
- initializing mesh and bus
- initializing persistence
- mounting identity center
- wiring activation/projection/graph/ingestion modules
- exposing runtime control surface

### `apps/browser-shell`
Only responsible for:
- interacting with runtime
- rendering organism state
- presenting centers/channels/gates/views
- handling user interaction

Apps must not hold duplicate domain logic that should live in packages.

---

## Service Responsibilities

### `services/resonance-market-api`
- external market/resonance integration
- adapter boundary only

### `services/oracle-py`
- reserved for oracle/ephemeris Python logic when uploaded
- auxiliary compute only

### `services/chart-oracle`
- reserved for stable TS bridge in front of Python oracle service

Services are optional attachments, not the organism’s core identity.

---

## Extraction Rules

### Keep
Keep only when the artifact is the strongest implementation of a concern.

### Move
Move when the code belongs to a reusable module and should no longer live inside an app root.

### Wrap
Wrap when the code is useful but must be exposed behind a stricter interface.

### Archive
Archive when:
- it duplicates a canonical concern
- it is a past prototype
- it is interesting but noncanonical
- it is a platform/client out of current scope

---

## Canonicality Rules

1. One runtime only.
2. One browser shell only.
3. One shared type system only.
4. One message substrate only.
5. One persistence layer only.
6. One implementation per concern stays canonical.
7. Everything else is extracted or archived.

---

## First Concrete Migration Sequence

### Phase 1: Freeze truth
1. finalize `FOUNDATION.md`
2. write `ONTOLOGY.md`
3. write `MESH.md`
4. write `ARCHIVE_POLICY.md`

### Phase 2: Build skeleton
1. create monorepo root folders
2. establish workspace config
3. create empty package boundaries
4. create shared package manifests

### Phase 3: Move apps
1. migrate kiosk runtime into `apps/runtime`
2. migrate browser into `apps/browser-shell`
3. remove duplicate domain logic from both apps

### Phase 4: Extract packages
1. extract bus from kiosk runtime
2. extract shared types
3. extract ingestion package
4. extract hd-graph package
5. extract self-supervised package
6. extract resonance-core from v9.1
7. extract shared UI

### Phase 5: Wire runtime
1. runtime loads ontology
2. runtime initializes mesh and bus
3. runtime initializes persistence
4. runtime mounts identity center
5. runtime registers ingestion/graph/self-supervised/services

### Phase 6: Archive duplicates
1. archive residual v9.1 app shape
2. archive residual AutopoeticResonanceEngine prototype shape
3. archive DebateCopilot
4. archive any duplicate root-level variants from SynthOS

---

## Unresolved Items

These remain pending until more uploads are inspected:

- oracle/ephemeris Python source
- chart/oracle wrapper
- exact persistence winner if multiple candidates exist
- exact UI component extraction boundaries
- final mapping of root-level loose files in SynthOS
- final archive list for duplicate App/engine variants

---

## Definition of Done

The migration is complete when:

- the repo has one canonical monorepo shape
- `apps/runtime` is the only runtime entrypoint
- `apps/browser-shell` is the only browser shell
- package concerns are extracted cleanly
- services are optional and bounded
- no archived code is imported by live code
- README explains how to run the organism
- future work can extend the repo without creating competing implementations
