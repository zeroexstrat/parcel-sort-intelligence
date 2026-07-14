"""WS4a: ltc_truth_synth.py — the LTC public-build data generator.

Emits the synthetic quiz world from slic_table.northgate.json: a TRUTH_RAW
table in the production grammar (ZIP|SLIC|BAY|BELT_INDEX|STATE|CITY) plus the
config hub-data region (belt color layout permuted with confusability
families following the permutation; synthetic high-miss/exception/air data).
Fictional zips are drawn from zero-occupancy blocks of the REAL truth table's
zip space (--exclude, same structural-sanitization class as the roster IDs).
Stdlib-only, seeded, deterministic. Skips without the world table.
"""

import importlib.util
import json
import re
import unittest
from pathlib import Path

GEN = Path(__file__).resolve().parents[1]
REPO = GEN.parent
SLIC_TABLE = GEN / "world/slic_table.northgate.json"
REAL_TRUTH = REPO / "Label-Training-Certification/js/truth-data.js"
EMITTER = GEN / "world/ltc_truth_synth.py"

ROW_RE = re.compile(r"^(\d{5})\|(\d{4})\|([\w/]+)\|([\d,]+)\|([A-Z]{2})\|(.+)$")


def _load(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def real_truth_zips():
    m = re.search(r"const TRUTH_RAW = `([\s\S]*?)`;", REAL_TRUTH.read_text())
    return {line.split("|")[0] for line in m.group(1).strip().splitlines()}


@unittest.skipUnless(SLIC_TABLE.exists(), "NGATE slic table not present")
class LtcTruthSynthTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.mod = _load("ltc_truth_synth", EMITTER)
        cls.table = json.loads(SLIC_TABLE.read_text())
        cls.lanes = {r["slic"]: r for r in cls.table["bay_map"]}
        cls.world = cls.mod.build_world(cls.table, seed=11,
                                        exclude_zips=real_truth_zips())
        cls.rows = cls.world["truth_rows"]

    def test_rows_match_the_production_grammar(self):
        self.assertGreaterEqual(len(self.rows), 400)
        for row in self.rows:
            self.assertRegex(row, ROW_RE)

    def test_zips_unique_and_structurally_disjoint_from_real_truth(self):
        zips = [r.split("|")[0] for r in self.rows]
        self.assertEqual(len(zips), len(set(zips)), "duplicate synthetic zips")
        overlap = set(zips) & real_truth_zips()
        self.assertEqual(overlap, set(),
                         "synthetic zips must come from zero-occupancy blocks")

    @staticmethod
    def _pd_index(lane):
        m = re.match(r"PD-(\d+)$", str(lane.get("pd") or ""))
        return int(m.group(1)) - 1 if m else None

    def test_every_row_is_consistent_with_its_lane(self):
        for row in self.rows:
            zip_, slic, bay, belts, state, city = ROW_RE.match(row).groups()
            lane = self.lanes.get(slic)
            self.assertIsNotNone(lane, f"row references unknown lane {slic}")
            self.assertEqual(bay, "/".join(lane["bays"]) or "0")
            self.assertEqual([int(b) for b in belts.split(",")],
                             [self._pd_index(lane)])
            self.assertEqual(state, lane["dest_code"][-2:],
                             "state must follow the lane's dest-code grammar")

    def test_every_pd_lane_is_covered_and_only_pd_lanes(self):
        used = {r.split("|")[1] for r in self.rows}
        pd_lanes = {s for s, l in self.lanes.items() if self._pd_index(l) is not None}
        self.assertEqual(used, pd_lanes,
                         "quiz rows must cover exactly the PD lanes "
                         "(air/night-sort lanes are service-routed, not zip-routed)")

    def test_belt_layout_is_a_permutation_with_families_following(self):
        layout = self.world["belt_layout"]
        names, colors, families = layout["names"], layout["colors"], layout["families"]
        self.assertEqual(len(names), 16)
        self.assertEqual(len(colors), 16)
        # PD prefixes stay aligned with truth belt indices
        for i in range(12):
            self.assertTrue(names[i].startswith(f"PD-{i+1:02d} · "), names[i])
        # families reference valid indices and never self
        for k, fam in families.items():
            self.assertNotIn(int(k), fam)
            for j in fam:
                self.assertIn(j, range(16))
        # the color multiset is preserved (a permutation, not an invention)
        perm = layout["permutation"]
        self.assertEqual(sorted(perm), list(range(16)))

    def test_air_rules_are_synthetic_but_structurally_real(self):
        air = self.world["air_rules"]
        self.assertGreaterEqual(len(air), 4)
        for rule in air:
            self.assertIn(rule["belt"], (14, 15))
        # thresholds must differ from the production chart values
        real_thresholds = {"080", "290", "386"}
        synth_thresholds = {r.get("prefixMin") for r in air if r.get("prefixMin")}
        self.assertEqual(synth_thresholds & real_thresholds, set(),
                         "synthetic air thresholds must not be the real chart values")

    def test_high_miss_and_exceptions_reference_only_synthetic_lanes(self):
        for zone in self.world["high_miss_zones"]:
            self.assertIn(zone["slic"], self.lanes)
        for exc in self.world["exceptions"]:
            self.assertIn(exc["slic"], self.lanes)
        self.assertGreaterEqual(len(self.world["high_miss_zones"]), 2)
        self.assertGreaterEqual(len(self.world["exceptions"]), 1)

    def test_admin_block_is_synthetic(self):
        admin = self.world["admin"]
        for emp_id in list(admin["admin_ids"]) + [admin["easter_egg_id"]]:
            self.assertTrue(2200000 <= int(emp_id) <= 3099999,
                            "admin/easter-egg IDs must sit in the zero-occupancy block")
        self.assertEqual(list(admin["admin_ids"].values()), ["Training Admin"])
        # The real easter egg names a real person — harvest the name from the
        # private config at runtime (never literal here) and assert absence.
        ltc_cfg = REPO / "Label-Training-Certification/js/config.js"
        if ltc_cfg.exists():
            import re as _re
            for m in _re.finditer(r"'\d{7}':\s*'([^']+)'", ltc_cfg.read_text()):
                for name in m.group(1).split():
                    self.assertNotIn(name, admin["easter_egg_msg"])

    def test_service_overrides_follow_the_synthetic_layout(self):
        names = self.world["belt_layout"]["names"]
        overrides = self.world["service_overrides"]
        self.assertGreaterEqual(len(overrides), 6)
        for code, o in overrides.items():
            self.assertIn(o["belt"], (14, 15))
            self.assertEqual(o["name"], names[o["belt"]],
                             f"{code} override name must match the synthetic layout")

    def test_deterministic(self):
        again = self.mod.build_world(self.table, seed=11,
                                     exclude_zips=real_truth_zips())
        self.assertEqual(self.world, again)

    def test_emitted_js_parses_and_carries_provenance(self):
        js = self.mod.emit_truth_js(self.world)
        self.assertIn("generated by ltc_truth_synth.py", js)
        m = re.search(r"const TRUTH_RAW = `([\s\S]*?)`;", js)
        self.assertIsNotNone(m)
        self.assertEqual(m.group(1).strip().splitlines(), self.rows)


if __name__ == "__main__":
    unittest.main()
