// Tests for the 2026-10-19 fills. Run: node --experimental-detect-module --test tests/
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolveAddress, GATE_WHEEL } from "../resonance_engine.js";
import { GATE_TO_LINES } from "../kingWen.js";
import { VERIFIED_WHEEL_OFFSET, resolveAddressVerified, gateStartTropical, thirteenSpaces } from "../verifiedWheel.js";
import { GATE_HOUSES, houseOfGate, lowerTrigram, KW_BITS } from "../gateHouses.js";
import { CODON_TABLE, verifyTable, gateToAminoAcid } from "../codonMapping.js";

// Every start degree from the verified table (hd-math-verification.md s.1),
// parsed from research/calc/gate_table.md when present on this computer.
const TABLE = "/workspace/research/calc/gate_table.md";

test("offset puts gate 41 at 302.0 and gate 25 at 358.25", () => {
  assert.equal(VERIFIED_WHEEL_OFFSET, 1.75);
  assert.equal(resolveAddressVerified(302.0).address, "41.1.1.1.1");
  assert.equal(resolveAddressVerified(358.25).gate, 25);
  assert.equal(resolveAddressVerified(3.8749).gate, 25);
  assert.equal(resolveAddressVerified(3.8751).gate, 17);
  // Jovian Archive's own example is wrong; 10 deg Aries is gate 21 (hd-math-verification.md s.1)
  assert.equal(resolveAddressVerified(10.0).gate, 21);
});

test("all 64 start degrees match the verified table", { skip: !safeExists(TABLE) }, () => {
  const rows = readFileSync(TABLE, "utf8").split("\n").filter((l) => /^\| \d+ \| \*\*/.test(l));
  assert.equal(rows.length, 64);
  for (const r of rows) {
    const c = r.split("|").map((s) => s.trim());
    const gate = Number(c[2].replace(/\*/g, "")), start = Number(c[3]);
    assert.ok(Math.abs(gateStartTropical(gate) - start) < 1e-9, `gate ${gate}`);
    const mid = (start + 5.625 / 2) % 360;
    assert.equal(resolveAddressVerified(mid).gate, gate, `mid of gate ${gate}`);
    assert.equal(resolveAddressVerified(start + 1e-7).line, 1);
  }
});

test("her default offset 0.0 still behaves as before (nothing changed)", () => {
  assert.equal(resolveAddress(117.916373).address, "62.6.5.4.5");
  assert.equal(resolveAddressVerified(117.916373).gate, 56); // 56 spans 116.375-122.0
});

test("thirteen spaces: fields, DMS and Fagan-Bradley sidereal sign", () => {
  const t = thirteenSpaces(302.0 + 0.9375 + 0.5 / 3600, { planet: "Sun", ayanamsaDeg: 24.7403 });
  assert.equal(t.planetary, "Sun");
  assert.equal(t.gate, 41); assert.equal(t.line, 2);
  assert.equal(t.zodiac, "Aquarius"); assert.equal(t.degree, 2); assert.equal(t.minute, 56); assert.equal(t.second, 15);
  assert.equal(t.dimension.status, "investigating");
  assert.equal(t.house.status, "investigating");
  assert.equal(t.arcSecond.status, "investigating");
  assert.equal(t.sidereal.zodiac, "Capricorn"); // 302.94 - 24.74 = 278.2 -> 8 deg Capricorn
  assert.equal(t.sidereal.degree, 8);
});

test("gateHouses KW_BITS equal Hatcher KW_HATCHER; kingWen.js differs only at 39/40", () => {
  const src = readFileSync("/workspace/research/open-questions/calc/hexagram_distance.py", "utf8");
  const m = [...src.matchAll(/(\d+):'([01]{6})'/g)];
  const kw = Object.fromEntries(m.map(([, n, b]) => [Number(n), b]));
  const diff = [];
  for (let g = 1; g <= 64; g++) {
    assert.equal(KW_BITS[g], kw[g], `gate ${g}`);
    if (GATE_TO_LINES[g].join("") !== kw[g]) diff.push(g);
  }
  assert.deepEqual(diff, [39, 40]); // flagged for Alexis, kingWen.js not edited
});

test("houses: 8 leaders, 8 gates each, every gate once, shared lower trigram", () => {
  const leaders = Object.keys(GATE_HOUSES).map(Number).sort((a, b) => a - b);
  assert.deepEqual(leaders, [1, 2, 7, 10, 13, 15, 25, 46]);
  const all = Object.values(GATE_HOUSES).flat().sort((a, b) => a - b);
  assert.deepEqual(all, Array.from({ length: 64 }, (_, i) => i + 1));
  for (const [leader, members] of Object.entries(GATE_HOUSES))
    for (const g of members) assert.equal(lowerTrigram(g), lowerTrigram(Number(leader)));
  assert.deepEqual(GATE_HOUSES[1], [1, 5, 9, 11, 14, 26, 34, 43]);
  assert.equal(houseOfGate(23).houseLeader, 2); // 23 = Kun below, Gen above
  assert.equal(houseOfGate(23).lowerTrigramName, "Kun");
  assert.equal(houseOfGate(39).houseLeader, 15); // Gen below
  assert.equal(houseOfGate(40).houseLeader, 7);  // Kan below
});

test("codon port matches codon_mapping.py exactly", () => {
  const v = verifyTable();
  assert.equal(v.total_gate_slots, 64); assert.equal(v.unique_gates_covered, 64);
  assert.deepEqual(v.missing, []); assert.deepEqual(v.duplicates, {});
  assert.equal(gateToAminoAcid(41).amino_acid, "Methionine");
  assert.equal(gateToAminoAcid(12).amino_acid, "Terminators");
  assert.equal(gateToAminoAcid(25).amino_acid, "Arginine");
  assert.equal(gateToAminoAcid(35).amino_acid, "Tryptophan");
  assert.equal(Object.keys(CODON_TABLE).length, 21);
});

function safeExists(p) { try { readFileSync(p); return true; } catch { return false; } }
