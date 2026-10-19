# Fill notes, 2026-10-19 (branch fill/lcm-20261019, local only, not pushed)

Additions only. None of the existing files were edited.

| New file | What it fills | Source |
|---|---|---|
| verifiedWheel.js | README "Wheel rotation offset" / WHEEL_OFFSET UNVERIFIED. Adds VERIFIED_WHEEL_OFFSET = 1.75 and resolveAddressVerified(). Adds thirteenSpaces() for her 13 spaces. | hd-math-verification.md s.1 (gate 41 at 302.0, 5.625 per gate; human-design-py 358.25), s.5 (Fagan-Bradley) |
| gateHouses.js, gate_houses.py | TODO "full 64-gate -> house membership (grouped by shared lower trigram)" | Book of Letters quote already in resonance_engine.js s.3; Hatcher Yijing vol.1 bits |
| codonMapping.js | README "JS port of codon_mapping.py -- still owed" | her codon_mapping.py, verbatim |
| tests/ | node:test (7) + unittest (4) | |

Run: `node --experimental-detect-module --test tests/` and `python3 -m unittest tests.test_fill` from this folder.

## Flags for Alexis (nothing changed, your call)
- kingWen.js has gates 39 and 40 swapped (39 should be 001010 Gen below/Kan above, 40 should be 010100). Files that import kingWen.js inherit this.
- With offset 0.0 the Apollo 11 self-test reads gate 62; with the verified offset it reads gate 56 (56 spans 116.375-122.0 tropical).
- The verified wheel is tropical. Your requirement is Fagan-Bradley. thirteenSpaces() reports the gate on the tropical wheel and the sidereal sign if you pass an ayanamsa. Which zodiac the gate should be read on: investigating.

## investigating
- "trigram base" read as lower trigram (your TODO says so); not yet checked against the Black Book wheel pages (~p.42).
- dimension, house, and Arc-Sec (vs Sec) in the 13 spaces.

## filled in, no source
- thirteenSpaces().arcSecond.candidate (fractional seconds) - placeholder value only.
