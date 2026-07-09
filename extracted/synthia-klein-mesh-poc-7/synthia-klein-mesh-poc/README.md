# synthia-klein-mesh (POC)

Pure JavaScript. 8 standalone tools, each implementing a real Sheldon Klein
system from his actual UW-Madison bibliography (not invented). They connect
through one EventMesh with **emergent channels** — nothing is pre-wired;
a channel materializes the first time any tool publishes to it.

No tool calls an LLM. One MCP hub (`src/mcp/mcpHub.js`) exposes all 8 over
stdio JSON-RPC, hand-rolled with zero npm dependencies, so any MCP client
(or none) can attach without this thing depending on an API key to run.

## The 8 tools

| Tool | Klein source | What it actually does |
|---|---|---|
| AutoLing | 1968, UWCS TR#43 | Same rule table drives generation AND recognition (bidirectional) |
| Diseminer | 1968 | Distributional semantics via co-occurrence + cosine similarity |
| NovelWriter | 1973, UWCS TR#186 | Propp-function narrative generator, seeded PRNG |
| Messy | 1976, UWCS TR#272 | Generic state-transition sim (maps to your organ_base.py cycle) |
| AnalogyEngine | 1983 | A:B::C:? solved via Boolean feature-vector XOR delta |
| IChingGrammar | 1996 | Hexagram (6 lines) -> trigram feature vectors |
| LanguageContact | 1974 | Stochastic grammar-blending over generations |
| HistoricalMonteCarlo | 1966 | Monte Carlo drift simulation over weighted rule variants |

## Run it

```bash
npm run demo   # runs all 8 once, prints emergent mesh topology
npm run mcp    # starts the MCP hub on stdio
```

## What's NOT done yet (be clear-eyed about this)

- **codegen()**: only AutoLing has a real `codegen()` that emits runnable JS.
  The other 7 only return data/semantics right now. You asked for tools that
  "code at least js" — that's the next pass, not yet built.
- **Supabase sync**: wired but no-op until `SUPABASE_URL`/`SUPABASE_KEY` env
  vars are set and `@supabase/supabase-js` is installed (`npm i @supabase/supabase-js`).
- **Second MCP hub**: you said up to 2 are fine; only 1 exists. Add a second
  only if you have a concrete reason (e.g. one hub for read tools, one for
  tools that mutate state).
- **No-blue palette**: not relevant here — no UI in this POC yet.

## Lattice integration

`IChingGrammar.run({ lines })` outputs a feature vector keyed the same way
your 69,120-address lattice expects gate/line data — wire its output
directly into `AnalogyEngine` or `AutoLing` to drive gate-based generation.
