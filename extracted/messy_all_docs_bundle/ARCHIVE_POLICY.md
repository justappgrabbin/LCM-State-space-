# ARCHIVE POLICY

## Purpose

This repository contains multiple prototypes, remakes, partial extractions, and overlapping implementations.

The purpose of this policy is to prevent the organism from splitting into parallel truths again.

Archiving is not deletion.
Archiving is the act of preserving superseded work without allowing it to continue acting as canonical source.

---

## Core Rule

Only one implementation per concern may remain canonical.

If two or more artifacts solve the same concern, then one must win and the rest must be:

- extracted for unique logic
- wrapped as adapters
- or archived

No duplicate implementation may remain half-live in the main runtime path.

---

## What Counts as a Concern

A concern is any distinct functional responsibility, including but not limited to:

- runtime entrypoint
- browser shell
- message substrate
- mesh routing
- ontology/types
- persistence
- ingestion
- graph engine
- self-supervised engine
- market client
- oracle service
- UI component library
- user identity / alignment hub

Each concern gets one canonical home.

---

## Canonicality Rules

### 1. One Runtime
There must be only one runtime app.

### 2. One Browser Shell
There must be only one browser-facing shell.

### 3. One Shared Type System
All live code must resolve to the same shared contracts.

### 4. One Message Substrate
All live modules must communicate through the same canonical message substrate or mesh adapter layer.

### 5. One Persistence Layer
All live state must persist through the same canonical persistence package.

### 6. One Live Implementation per Concern
No second implementation may remain active just because it is interesting, unfinished, or emotionally hard to delete.

---

## Archive Triggers

A file, folder, or project must be archived when any of the following is true:

### Duplicate
It duplicates a concern already handled by a stronger canonical implementation.

### Superseded
It was useful earlier but has been replaced.

### Parallel Truth
It introduces a competing interpretation of the same runtime, type system, or app boundary.

### Prototype Drift
It represents an experiment or branch that should no longer influence default behavior.

### Platform Out of Scope
It is for a platform or client not currently in the canonical first release path.

### Dead-End Integration
It cannot be reasonably integrated without reintroducing duplication or violating the ontology.

---

## Extraction Before Archive

Before archiving a project, inspect it for unique logic.

If it contains unique value, do this first:

1. identify the unique logic
2. extract only the reusable part
3. move that part into its canonical package
4. archive the remaining shell intact

This prevents accidental loss of valuable ideas while still keeping the live repo coherent.

---

## Archive Categories

### 1. Historical Prototype
A complete earlier version kept for reference.

**Example:** an earlier resonance engine app that is no longer canonical.

### 2. Partial Donor
A project that donated useful code to canonical packages and is then archived.

**Example:** a prototype whose graph logic was extracted but whose app shell is no longer needed.

### 3. Out-of-Scope Client
A platform-specific project that does not belong in the current runtime spine.

**Example:** an Android/Kotlin client while the canonical organism body is TypeScript-first.

### 4. Variant Cluster
Multiple near-duplicate files that reflect repeated rebuilds of the same concern.

**Example:** repeated `App.tsx` variants or repeated engine versions in a loose root.

---

## Archive Structure

Archived artifacts should live under:

```text
archived/
  <artifact-name>/
    ARCHIVED.md
    ...original files...
```

Each archived directory must include an `ARCHIVED.md` file.

---

## Required `ARCHIVED.md` Contents

Each archived item must record:

- artifact name
- original role
- archival date
- archival reason
- canonical replacement
- what unique logic was extracted, if any
- whether the artifact is safe to delete later

### Template

```md
# ARCHIVED

## Name
<artifact name>

## Original Role
<what it used to do>

## Reason for Archival
<duplicate / superseded / out of scope / donor extracted>

## Canonical Replacement
<path to canonical runtime/package/service>

## Extracted Logic
<what was moved out before archival>

## Notes
<any historical relevance or caution>
```

---

## Import Rule

No archived file may be imported by live code.

This is absolute.

If live code imports archived code, then the archive boundary is fake and the repo still has parallel truths.

---

## Naming Rule

Archived code should keep recognizable original names so its history is still understandable.

Do not rename archived projects into meaningless labels.

Good:
- `archived/synthia-v9.1/`
- `archived/AutopoeticResonanceEngine/`
- `archived/DebateCopilot/`

Bad:
- `archived/old1/`
- `archived/misc/`
- `archived/tmp/`

---

## Root Cleanup Rule

Loose root-level duplicates must not remain in the live repo root after classification.

This especially applies to:

- repeated `App.tsx` variants
- repeated graph engine variants
- repeated loose text/zip dumps of the same concern
- copied markdown specs that conflict with canonical docs

After classification, each loose artifact must be:

- moved into its canonical package
- moved into docs/references
- or moved into archived/

---

## Doctrine for Conceptual Material

Reference material is not automatically live code.

Research papers, screenshots, PDFs, diagrams, and conceptual notes should not remain mixed into app/package roots unless they are part of a clearly defined reference directory.

Use:

```text
docs/references/
```

or archive them with context.

---

## Emotional Rule

Difficulty letting go of an old prototype is not a valid reason to keep it live.

If an artifact matters historically, archive it.
If it matters functionally, extract it.
If it matters neither historically nor functionally, delete it.

The organism cannot remain coherent if every previous self is allowed to remain active.

---

## Decision Test

When deciding whether something stays live, ask:

1. What concern does this solve?
2. Is there already a stronger canonical implementation of that concern?
3. Does this contain unique reusable logic?
4. Can that logic be extracted cleanly?
5. If not canonical, why is it still live?

If that fifth question has no strong answer, archive it.

---

## Current First-Pass Archive Candidates

Based on the current intake, likely archive candidates include:

- `DebateCopilot`
- residual `synthia-v9.1` shell after extraction
- residual `AutopoeticResonanceEngine` shell after extraction
- duplicate root-level variants from `SynthOS`
- repeated app/engine variants that do not win canonical concern ownership

This list remains provisional until all uploads are inspected.

---

## Archive and Canonical Pairing Rule

Every archive decision should point to the live replacement.

Example:

- archived: `archived/synthia-v9.1/`
- replacement: `packages/resonance-core/`

This keeps the repo legible to future humans and future models.

---

## Final Rule

The goal of archiving is not cleanliness for its own sake.
The goal is preservation without ambiguity.

Archived work remains visible.
Canonical work remains authoritative.

That distinction is what prevents the system from endlessly rebuilding itself into duplicates.
