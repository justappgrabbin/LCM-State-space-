"""gate_houses.py (added 2026-10-19, branch fill/lcm-20261019)

Python side of gateHouses.js. Fills the TODO in resonance_engine.py s.3
("full 64-gate -> house membership (grouped by shared lower trigram)").
resonance_engine.py is not edited.

Rule: Book of Letters (Ra Uru Hu, 1995/96) as quoted in her
resonance_engine.py: "Each House is made up of 8 Hexagrams each of which has
the same trigram base ... Each of the eight gates of the G center are the
leading hexagrams of each of the eight houses." "trigram base" = lower
trigram, per her TODO. INVESTIGATING: confirm against Black Book p.~42.

Line bits: Hatcher, Yijing vol.1 (2009) binary table, as checked in
research/open-questions/calc/hexagram_distance.py (KW_HATCHER, bottom first),
identical to her kingWen.js GATE_TO_LINES (checked in tests).
"""
from resonance_engine import HOUSE_LEADING_GATES

KW_BITS = {
 1:'111111', 2:'000000', 3:'100010', 4:'010001', 5:'111010', 6:'010111', 7:'010000', 8:'000010',
 9:'111011',10:'110111',11:'111000',12:'000111',13:'101111',14:'111101',15:'001000',16:'000100',
17:'100110',18:'011001',19:'110000',20:'000011',21:'100101',22:'101001',23:'000001',24:'100000',
25:'100111',26:'111001',27:'100001',28:'011110',29:'010010',30:'101101',31:'001110',32:'011100',
33:'001111',34:'111100',35:'000101',36:'101000',37:'101011',38:'110101',39:'001010',40:'010100',
41:'110001',42:'100011',43:'111110',44:'011111',45:'000110',46:'011000',47:'010110',48:'011010',
49:'101110',50:'011101',51:'100100',52:'001001',53:'001011',54:'110100',55:'101100',56:'001101',
57:'011011',58:'110110',59:'010011',60:'110010',61:'110011',62:'001100',63:'101010',64:'010101'}

TRIGRAM_NAME = {"111": "Qian", "110": "Dui", "101": "Li", "100": "Zhen",
                "011": "Xun", "010": "Kan", "001": "Gen", "000": "Kun"}


def lower_trigram(gate: int) -> str:
    return KW_BITS[gate][:3]


def build_gate_houses() -> dict:
    by_tri = {}
    for g in HOUSE_LEADING_GATES:
        t = lower_trigram(g)
        if t in by_tri:
            raise ValueError(f"leading gates {by_tri[t]} and {g} share lower trigram {t}")
        by_tri[t] = g
    houses = {g: [] for g in HOUSE_LEADING_GATES}
    for gate in range(1, 65):
        houses[by_tri[lower_trigram(gate)]].append(gate)
    for g, m in houses.items():
        if len(m) != 8:
            raise ValueError(f"house {g} has {len(m)} gates")
    return houses


GATE_HOUSES = build_gate_houses()


def house_of_gate(gate: int) -> dict:
    for leader, members in GATE_HOUSES.items():
        if gate in members:
            t = lower_trigram(gate)
            return {"gate": gate, "house_leader": leader,
                    "house_leader_name": HOUSE_LEADING_GATES[leader],
                    "lower_trigram": t, "lower_trigram_name": TRIGRAM_NAME[t],
                    "members": members}
    raise KeyError(gate)


if __name__ == "__main__":
    for leader, members in GATE_HOUSES.items():
        print(leader, TRIGRAM_NAME[lower_trigram(leader)], members)
