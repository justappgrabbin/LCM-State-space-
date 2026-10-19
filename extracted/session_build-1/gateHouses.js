// gateHouses.js  (added 2026-10-19, branch fill/lcm-20261019)
//
// Fills the TODO in resonance_engine.js / resonance_engine.py section 3:
//   "TODO: full 64-gate -> house membership (grouped by shared lower
//    trigram) not yet extracted from source."
// Her TODO text and HOUSE_LEADING_GATES are left exactly as they are.
//
// RULE (her source, quoted in resonance_engine.js s.3): Book of Letters
// (Ra Uru Hu, 1995/96): "the 64 Hexagrams are divided into Eight (8) Houses.
// Each House is made up of 8 Hexagrams each of which has the same trigram
// base... Each of the eight gates of the G center are the leading hexagrams
// of each of the eight houses."
// "trigram base" is read as the LOWER trigram, as her own TODO says.
// INVESTIGATING: confirm against the Black Book wheel diagrams (her TODO
// points at "pages ~42"); not yet read from the page image.
// NOTE: this is NOT the classical Jing Fang "eight palaces", which group the
// 64 differently (by line-by-line transformation from the pure hexagrams).
//
// DATA: line bits from Hatcher's binary table (Bradford Hatcher, Yijing vol.1,
// 2009, on her Drive), as checked in research/open-questions/calc/
// hexagram_distance.py KW_HATCHER against the trigram tables for all 64.
// Bottom-to-top, 1 = yang.
// FLAG FOR ALEXIS (not changed): her kingWen.js GATE_TO_LINES has gates 39
// and 40 swapped. 39 (Jian, Obstruction) is Gen below / Kan above = 001010;
// 40 (Xie, Deliverance) is Kan below / Zhen above = 010100. kingWen.js has
// 39 = 010100 and 40 = 001010. Every other gate matches Hatcher. kingWen.js
// is left as she has it; this file uses Hatcher's table so 39/40 land in the
// right houses. Her decision whether to correct kingWen.js.
// Trigram names: standard Fu Xi names as in research/scenes/scene.py TRI_NAME.

import { HOUSE_LEADING_GATES } from "./resonance_engine.js";

export const KW_BITS = {
  1:"111111", 2:"000000", 3:"100010", 4:"010001", 5:"111010", 6:"010111", 7:"010000", 8:"000010",
  9:"111011",10:"110111",11:"111000",12:"000111",13:"101111",14:"111101",15:"001000",16:"000100",
 17:"100110",18:"011001",19:"110000",20:"000011",21:"100101",22:"101001",23:"000001",24:"100000",
 25:"100111",26:"111001",27:"100001",28:"011110",29:"010010",30:"101101",31:"001110",32:"011100",
 33:"001111",34:"111100",35:"000101",36:"101000",37:"101011",38:"110101",39:"001010",40:"010100",
 41:"110001",42:"100011",43:"111110",44:"011111",45:"000110",46:"011000",47:"010110",48:"011010",
 49:"101110",50:"011101",51:"100100",52:"001001",53:"001011",54:"110100",55:"101100",56:"001101",
 57:"011011",58:"110110",59:"010011",60:"110010",61:"110011",62:"001100",63:"101010",64:"010101",
};

export const TRIGRAM_NAME = {
  "111": "Qian", "110": "Dui", "101": "Li", "100": "Zhen",
  "011": "Xun", "010": "Kan", "001": "Gen", "000": "Kun",
};

export function lowerTrigram(gate) {
  const b = KW_BITS[gate];
  if (!b) throw new Error(`lowerTrigram: no gate ${gate}`);
  return b.slice(0, 3);
}

export function upperTrigram(gate) {
  const b = KW_BITS[gate];
  if (!b) throw new Error(`upperTrigram: no gate ${gate}`);
  return b.slice(3, 6);
}

/** Build house leader -> 8 member gates. Throws if her source's claim fails. */
export function buildGateHouses() {
  const leaders = Object.keys(HOUSE_LEADING_GATES).map(Number);
  const byTri = {};
  for (const g of leaders) {
    const t = lowerTrigram(g);
    if (byTri[t] !== undefined)
      throw new Error(`leading gates ${byTri[t]} and ${g} share lower trigram ${t}`);
    byTri[t] = g;
  }
  const houses = {};
  for (const g of leaders) houses[g] = [];
  for (let gate = 1; gate <= 64; gate++) houses[byTri[lowerTrigram(gate)]].push(gate);
  for (const g of leaders)
    if (houses[g].length !== 8) throw new Error(`house ${g} has ${houses[g].length} gates, not 8`);
  return houses;
}

export const GATE_HOUSES = buildGateHouses();

/** Gate (1-64) -> its house. */
export function houseOfGate(gate) {
  const tri = lowerTrigram(gate);
  for (const [leader, members] of Object.entries(GATE_HOUSES)) {
    if (members.includes(gate)) {
      return {
        gate,
        houseLeader: Number(leader),
        houseLeaderName: HOUSE_LEADING_GATES[leader],
        lowerTrigram: tri,
        lowerTrigramName: TRIGRAM_NAME[tri],
        members,
      };
    }
  }
  throw new Error(`houseOfGate: gate ${gate} not placed`);
}
