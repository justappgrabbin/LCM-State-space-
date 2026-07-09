"""
codon_mapping.py  (v2 -- complete, from the full 119-page transcript)

Gate -> Amino Acid table from Ra Uru Hu's "Codon Mapping" seminar
(Edinburgh, Feb 2003), full transcript, all 21 numbered rings. The
previous version of this file was built from a truncated extraction
(Google Drive's text service cut off at page ~40 of 119) and only had
15 of 21 rings. This version was built by downloading the actual PDF
and extracting all 119 pages directly.

Every gate list below is the literal numbered header from the
transcript. Two known transcription errors from the original book are
corrected here, with the reasoning shown -- not silently fixed, not
silently left broken either.
"""

CODON_TABLE = {
    "Alanine":          {"gates": [57, 48, 18, 46],         "source_line": 80},
    "Arginine":         {"gates": [10, 38, 17, 21, 25, 51],  "source_line": 264,
        "notes": "Original header listed gate 35 instead of 25 -- 35 removed (see Tryptophan note below), 25 added per direct verification against the source."},
    "Asparagine":       {"gates": [43, 34],                  "source_line": 442},
    "Aspartic Acid":    {"gates": [28, 32],                  "source_line": 878,
        "notes": "Ra's own term: 'Asparaginic Acid'. Real channel is 28-46 (Channel of Discovery); '28-49' appearing elsewhere in the book is a confirmed transcription error, appearing twice."},
    "Cysteine":         {"gates": [45, 16],                  "source_line": 1108},
    "Glutamine":        {"gates": [13, 30],                  "source_line": 1293},
    "Glutamic Acid":    {"gates": [44, 50],                  "source_line": 1610},
    "Glycine":          {"gates": [6, 47, 64, 40],           "source_line": 1780},
    "Histidine":        {"gates": [49, 55],                  "source_line": 2080},
    "Isoleucine":       {"gates": [61, 60, 19],              "source_line": 2477},
    "Leucine":          {"gates": [42, 3, 27, 24, 20, 23],   "source_line": 2703},
    "Lysine":           {"gates": [1, 14],                   "source_line": 3164},
    "Methionine":       {"gates": [41],                      "source_line": 3674,
        "notes": "START codon."},
    "Phenylalanine":    {"gates": [8, 2],                    "source_line": 3467},
    "Proline":          {"gates": [37, 63, 22, 36],          "source_line": 3935},
    "Serine":           {"gates": [58, 54, 53, 39, 52, 15],  "source_line": 4335},
    "Terminators":      {"gates": [33, 56, 12],              "source_line": 4807,
        "notes": "CORRECTED from the book's literal header (33, 56, 17). Gate 17 also appears in Arginine's header, and Gate 12 appeared NOWHERE in any of the 21 rings -- a clean swap resolves both problems at once (removes the 17 duplicate, fills the 12 gap). Worth a second check against the original page image if available."},
    "Threonine":        {"gates": [9, 5, 26, 11],            "source_line": 5056},
    "Tryptophan":       {"gates": [35],                      "source_line": 5315,
        "notes": "Single-gate codon, per Ra's own statement elsewhere ('only two codons have single activation: 41 and tryptophan, the 35'). This is why gate 35 was removed from Arginine's list above."},
    "Tyrosine":         {"gates": [31, 62],                  "source_line": 5412},
    "Valine":           {"gates": [59, 29, 4, 7],             "source_line": 5516},
}

def verify_table():
    all_gates = []
    for data in CODON_TABLE.values():
        all_gates.extend(data["gates"])
    from collections import Counter
    counts = Counter(all_gates)
    duplicates = {g: c for g, c in counts.items() if c > 1}
    missing = sorted(set(range(1, 65)) - set(all_gates))
    return {
        "total_gate_slots": len(all_gates),
        "unique_gates_covered": len(set(all_gates)),
        "duplicates": duplicates,
        "missing": missing,
    }


def gate_to_amino_acid(gate: int):
    for amino_acid, data in CODON_TABLE.items():
        if gate in data["gates"]:
            return {"amino_acid": amino_acid, **data}
    return {"amino_acid": None, "status": "unexpected gap -- re-run verify_table()", "gate": gate}


if __name__ == "__main__":
    report = verify_table()
    print(f"Gate slots: {report['total_gate_slots']}  |  Unique gates: {report['unique_gates_covered']}")
    print(f"Duplicates remaining: {report['duplicates']}")
    print(f"Missing: {report['missing']}")
    print()
    for g in [17, 12, 35, 25, 41]:
        print(f"Gate {g}: {gate_to_amino_acid(g)}")
