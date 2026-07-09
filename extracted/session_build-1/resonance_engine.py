"""
resonance_engine.py

Consolidated build from tonight's session. Every constant and function here
is either (a) computed directly from real math, or (b) sourced from a
verified primary text (Black Book 1991 / Book of Letters 1995 / Personality
External Color Book), with the citation in the comment. Anything not yet
verified is marked UNVERIFIED and left as a clear TODO -- not guessed at.

No decimals shown to the user by default. Internal math uses floats
(required), but all display goes through decimal_to_dms().
"""

import math

# ============================================================
# 1. THE ADDRESS SPACE: Gate.Line.Color.Tone.Base
# ============================================================
# Total states = 64 * 6 * 6 * 6 * 5 = 69,120 (locked address space number)

GATE_WHEEL = [
    25, 17, 21, 51, 42, 3, 27, 24, 2, 23, 8, 20, 16, 35, 45, 12,
    15, 52, 39, 53, 62, 56, 31, 33, 7, 4, 29, 59, 40, 64, 47, 6,
    46, 18, 48, 57, 32, 50, 28, 44, 1, 43, 14, 34, 9, 5, 26, 11,
    10, 58, 38, 54, 61, 60, 41, 19, 13, 49, 30, 55, 37, 63, 22, 36,
]

# UNVERIFIED: wheel rotation offset. Structurally the division logic below
# is sound; numerically it won't match calibrated HD software until your
# real_ephemeris.py's verified offset (checked against the 2017 eclipse +
# Mean Lunar Node) is dropped in here.
WHEEL_OFFSET = 0.0

N_GATES, N_LINES, N_COLORS, N_TONES, N_BASES = 64, 6, 6, 6, 5

GATE_ARC = 360.0 / N_GATES                 # 5.625 deg  = 5deg 37' 30"  (confirmed, Book of Letters: "each constellation has an arc of 5°37'30\"")
LINE_ARC = GATE_ARC / N_LINES              # 0.9375 deg
COLOR_ARC = LINE_ARC / N_COLORS            # 0.15625 deg
TONE_ARC = COLOR_ARC / N_TONES             # 0.02604166... deg
BASE_ARC = TONE_ARC / N_BASES              # 0.00520833... deg = 18.75 arcsec -- the finest resolution unit

TOTAL_STATES = N_GATES * N_LINES * N_COLORS * N_TONES * N_BASES  # 69,120


def decimal_to_dms(deg: float) -> str:
    """Render decimal degrees as D°M'S" for display. Same number, different
    format -- DMS is not more precise or differently-computed than decimal,
    it's just how this system displays results."""
    sign = "-" if deg < 0 else ""
    deg = abs(deg)
    d = int(deg)
    m_full = (deg - d) * 60
    m = int(m_full)
    s = (m_full - m) * 60
    return f"{sign}{d}\u00b0{m}'{s:.2f}\""


def resolve_address(longitude_deg: float, wheel_offset: float = WHEEL_OFFSET) -> dict:
    """Raw ecliptic longitude -> Gate.Line.Color.Tone.Base via nested
    remainder division. No table below Gate -- every level is division
    applied to the leftover fraction of the level above."""
    lon = (longitude_deg + wheel_offset) % 360.0

    gate_index = int(lon // GATE_ARC) % N_GATES
    gate = GATE_WHEEL[gate_index]
    r1 = lon - gate_index * GATE_ARC

    line = int(r1 // LINE_ARC) + 1
    r2 = r1 - (line - 1) * LINE_ARC

    color = int(r2 // COLOR_ARC) + 1
    r3 = r2 - (color - 1) * COLOR_ARC

    tone = int(r3 // TONE_ARC) + 1
    r4 = r3 - (tone - 1) * TONE_ARC

    base = int(r4 // BASE_ARC) + 1
    r5 = r4 - (base - 1) * BASE_ARC  # what's left below Base -- exists, unresolvable further in this system

    return {
        "input_dms": decimal_to_dms(longitude_deg),
        "gate": gate, "line": line, "color": color, "tone": tone, "base": base,
        "address": f"{gate}.{line}.{color}.{tone}.{base}",
        "below_base_deg": r5,
        "below_base_arcsec": r5 * 3600,  # real, exists, but this system has no finer unit to name it with
        "base_resolution_arcsec": BASE_ARC * 3600,
    }


def twin_divergence(lon_a: float, lon_b: float, wheel_offset: float = WHEEL_OFFSET) -> dict:
    """Where two close birth moments (e.g. twins) diverge in the address,
    and by how many arcseconds."""
    a, b = resolve_address(lon_a, wheel_offset), resolve_address(lon_b, wheel_offset)
    diverges_at = next((lvl for lvl in ("gate", "line", "color", "tone", "base") if a[lvl] != b[lvl]), None)
    return {
        "a": a["address"], "b": b["address"],
        "diverges_at": diverges_at or "identical (same 69,120th state)",
        "separation_arcsec": abs(lon_a - lon_b) * 3600,
    }


# ============================================================
# 2. COLOR MOTIVATIONS + HARMONIC PAIRS
# ============================================================
# Source: Personality External Color Book (Ra Uru Hu, 2006)

COLOR_MOTIVATION = {
    1: "Survival (Fear)",     # "Survival, in this frame, is what you fear..."
    2: "Possibility",
    3: "UNVERIFIED",
    4: "Wanting",             # "what is missing, what is lacking, what is needed, what is wanting"
    5: "Probability",
    6: "Personal (non-motivation)",
}

# "In that lies our themes of harmonics... the 1-4, the 2-5, and the 3-6."
COLOR_HARMONIC_PAIRS = {1: 4, 4: 1, 2: 5, 5: 2, 3: 6, 6: 3}

# Documented exception: every Color defaults to its harmonic partner when
# distracted, EXCEPT Color 4, which defaults toward Color 1 (Survival)
# instead of its harmonic partner. ("its natural tendency is to go to the
# survival" -- Ra, Personality Resonance Mapping, Lesson 4)
COLOR_4_DISTRACTION_EXCEPTION = {"defaults_to": 1, "not_to_harmonic_partner": 1}


# ============================================================
# 3. THE 8 I-CHING HOUSES (distinct from the 12-sign zodiac wheel)
# ============================================================
# Source: Book of Letters (Ra Uru Hu, 1995/96):
# "the 64 Hexagrams are divided into Eight (8) Houses. Each House is made
# up of 8 Hexagrams each of which has the same trigram base... Each of the
# eight gates of the G center are the leading hexagrams of each of the
# eight houses."

HOUSE_LEADING_GATES = {
    # Cross of the Sphinx -- Direction
    1: "The Creative (Self-expression)",
    2: "The Receptive (Direction of the Self)",
    7: "The Army (Role of the Self in interaction)",
    13: "Fellowship of Man (Openness of the Self in interaction)",
    # Cross of the Vessel -- Love
    10: "Treading (Behavior of the Self)",
    15: "Modesty (Rhythm of the Self)",
    25: "Innocence (Spirit of the Self)",
    46: "Pushing Upward (Determination of the Self)",
}
# TODO: full 64-gate -> house membership (grouped by shared lower trigram)
# not yet extracted from source. The 8 anchor gates above are confirmed;
# the other 56 gates' house assignments still need pulling from the I Ching
# trigram tables in the Black Book (pages ~42, the wheel diagrams).


# ============================================================
# 4. COMPOSITE CONNECTION TYPES (how two charts complete each other)
# ============================================================
# Source: Book of Letters, "Composite" glossary entry.

COMPOSITE_TYPES = {
    "electro_magnetic": "Same channel, partners open OPPOSITE gates -- attraction and repulsion. This is the only type where NEITHER person has the channel alone; it can only complete between them.",
    "compromise": "One partner defines the whole channel; the other opens only one gate and compromises to it.",
    "dominance": "One partner defines the channel; the other activates none of it -- can only be accepted/surrendered to.",
    "companionship": "Both partners open the same gate or channel -- shared experience, potential friendship.",
}


def classify_composite(person_a_gates: set, person_b_gates: set, channel: tuple) -> str:
    """
    channel = (gate_x, gate_y) -- the two gates that define one channel.
    Returns which of the 4 composite types applies between two people
    for this specific channel.
    """
    gx, gy = channel
    a_has_x, a_has_y = gx in person_a_gates, gy in person_a_gates
    b_has_x, b_has_y = gx in person_b_gates, gy in person_b_gates

    a_complete = a_has_x and a_has_y
    b_complete = b_has_x and b_has_y

    if a_complete and b_complete:
        return "companionship"
    if a_complete and not (b_has_x or b_has_y):
        return "dominance (A dominant)"
    if b_complete and not (a_has_x or a_has_y):
        return "dominance (B dominant)"
    if a_complete and (b_has_x or b_has_y):
        return "compromise (B compromises to A)"
    if b_complete and (a_has_x or a_has_y):
        return "compromise (A compromises to B)"
    if (a_has_x and b_has_y and not a_has_y and not b_has_x) or \
       (a_has_y and b_has_x and not a_has_x and not b_has_y):
        return "electro_magnetic"
    return "no connection on this channel"


if __name__ == "__main__":
    print(f"Total address space: {TOTAL_STATES}")
    print(f"Base resolution: {BASE_ARC*3600:.2f} arcsec\n")

    result = resolve_address(117.916373)  # Apollo 11 Sun longitude, real JPL data
    print("Apollo 11 touchdown Sun address:", result["address"])
    print("  input:", result["input_dms"])
    print("  below Base:", f"{result['below_base_arcsec']:.2f}\" (exists, unresolved by this system)\n")

    print("Color 1 motivation:", COLOR_MOTIVATION[1])
    print("Color 4 motivation:", COLOR_MOTIVATION[4])
    print("Harmonic partner of Color 1:", COLOR_HARMONIC_PAIRS[1], "\n")

    # Example composite check on the Mating channel (59/6)
    print(classify_composite({59}, {6}, (59, 6)))
