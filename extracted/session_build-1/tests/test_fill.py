"""Run: python3 -m unittest discover -s tests -t . (from session_build-1)"""
import json, subprocess, sys, unittest, os
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, HERE)
import gate_houses as gh
import codon_mapping as cm


class T(unittest.TestCase):
    def test_bits_match_research(self):
        sys.path.insert(0, "/workspace/research/open-questions/calc")
        try:
            from hexagram_distance import KW_HATCHER
        except Exception:
            self.skipTest("research file not on this computer")
        self.assertEqual(gh.KW_BITS, KW_HATCHER)

    def test_houses(self):
        self.assertEqual(sorted(gh.GATE_HOUSES), [1, 2, 7, 10, 13, 15, 25, 46])
        self.assertEqual(sorted(g for m in gh.GATE_HOUSES.values() for g in m), list(range(1, 65)))
        self.assertEqual(gh.house_of_gate(23)["house_leader"], 2)

    def test_python_and_js_agree(self):
        js = "import('./gateHouses.js').then(m=>console.log(JSON.stringify(m.GATE_HOUSES)))"
        out = subprocess.run(["node", "--experimental-detect-module", "--input-type=module", "-e", js],
                             cwd=HERE, capture_output=True, text=True, check=True).stdout
        self.assertEqual({int(k): v for k, v in json.loads(out).items()}, gh.GATE_HOUSES)

    def test_codon_js_port_equals_python(self):
        js = "import('./codonMapping.js').then(m=>console.log(JSON.stringify(m.CODON_TABLE)))"
        out = subprocess.run(["node", "--experimental-detect-module", "--input-type=module", "-e", js],
                             cwd=HERE, capture_output=True, text=True, check=True).stdout
        self.assertEqual(json.loads(out), cm.CODON_TABLE)


if __name__ == "__main__":
    unittest.main()
