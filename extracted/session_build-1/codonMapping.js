// codonMapping.js  (added 2026-10-19, branch fill/lcm-20261019)
//
// Fills README.md open item "JS port of codon_mapping.py -- still owed".
// This is a straight port: every gate list, source_line and note below is
// copied verbatim from her codon_mapping.py (v2, Ra Uru Hu "Codon Mapping"
// seminar, Edinburgh Feb 2003, full 119-page transcript). Her two corrections
// (Terminators 33-56-12, gate 25 into Arginine) are kept as she made them.
// No gate was added, moved or removed in the port. codon_mapping.py itself
// is unchanged and remains the source of truth.

export const CODON_TABLE = {
  "Alanine": {
    "gates": [
      57,
      48,
      18,
      46
    ],
    "source_line": 80
  },
  "Arginine": {
    "gates": [
      10,
      38,
      17,
      21,
      25,
      51
    ],
    "source_line": 264,
    "notes": "Original header listed gate 35 instead of 25 -- 35 removed (see Tryptophan note below), 25 added per direct verification against the source."
  },
  "Asparagine": {
    "gates": [
      43,
      34
    ],
    "source_line": 442
  },
  "Aspartic Acid": {
    "gates": [
      28,
      32
    ],
    "source_line": 878,
    "notes": "Ra's own term: 'Asparaginic Acid'. Real channel is 28-46 (Channel of Discovery); '28-49' appearing elsewhere in the book is a confirmed transcription error, appearing twice."
  },
  "Cysteine": {
    "gates": [
      45,
      16
    ],
    "source_line": 1108
  },
  "Glutamine": {
    "gates": [
      13,
      30
    ],
    "source_line": 1293
  },
  "Glutamic Acid": {
    "gates": [
      44,
      50
    ],
    "source_line": 1610
  },
  "Glycine": {
    "gates": [
      6,
      47,
      64,
      40
    ],
    "source_line": 1780
  },
  "Histidine": {
    "gates": [
      49,
      55
    ],
    "source_line": 2080
  },
  "Isoleucine": {
    "gates": [
      61,
      60,
      19
    ],
    "source_line": 2477
  },
  "Leucine": {
    "gates": [
      42,
      3,
      27,
      24,
      20,
      23
    ],
    "source_line": 2703
  },
  "Lysine": {
    "gates": [
      1,
      14
    ],
    "source_line": 3164
  },
  "Methionine": {
    "gates": [
      41
    ],
    "source_line": 3674,
    "notes": "START codon."
  },
  "Phenylalanine": {
    "gates": [
      8,
      2
    ],
    "source_line": 3467
  },
  "Proline": {
    "gates": [
      37,
      63,
      22,
      36
    ],
    "source_line": 3935
  },
  "Serine": {
    "gates": [
      58,
      54,
      53,
      39,
      52,
      15
    ],
    "source_line": 4335
  },
  "Terminators": {
    "gates": [
      33,
      56,
      12
    ],
    "source_line": 4807,
    "notes": "CORRECTED from the book's literal header (33, 56, 17). Gate 17 also appears in Arginine's header, and Gate 12 appeared NOWHERE in any of the 21 rings -- a clean swap resolves both problems at once (removes the 17 duplicate, fills the 12 gap). Worth a second check against the original page image if available."
  },
  "Threonine": {
    "gates": [
      9,
      5,
      26,
      11
    ],
    "source_line": 5056
  },
  "Tryptophan": {
    "gates": [
      35
    ],
    "source_line": 5315,
    "notes": "Single-gate codon, per Ra's own statement elsewhere ('only two codons have single activation: 41 and tryptophan, the 35'). This is why gate 35 was removed from Arginine's list above."
  },
  "Tyrosine": {
    "gates": [
      31,
      62
    ],
    "source_line": 5412
  },
  "Valine": {
    "gates": [
      59,
      29,
      4,
      7
    ],
    "source_line": 5516
  }
};

export function verifyTable() {
  const all = Object.values(CODON_TABLE).flatMap((d) => d.gates);
  const counts = {};
  for (const g of all) counts[g] = (counts[g] || 0) + 1;
  const duplicates = Object.fromEntries(Object.entries(counts).filter(([, c]) => c > 1));
  const set = new Set(all);
  const missing = [];
  for (let g = 1; g <= 64; g++) if (!set.has(g)) missing.push(g);
  return { total_gate_slots: all.length, unique_gates_covered: set.size, duplicates, missing };
}

export function gateToAminoAcid(gate) {
  for (const [amino_acid, data] of Object.entries(CODON_TABLE)) {
    if (data.gates.includes(gate)) return { amino_acid, ...data };
  }
  return { amino_acid: null, status: "unexpected gap -- re-run verifyTable()", gate };
}
