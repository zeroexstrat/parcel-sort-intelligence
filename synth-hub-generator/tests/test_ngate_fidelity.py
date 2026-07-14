"""WS3.6: the generator-fidelity gates as a pytest — the emitted NGATE bundle
must satisfy the real ingestion pipeline and its own structural contract.

Runs the same gates as fidelity_capsule.py (via import) against the committed
dist bundle. Skips when the bundle isn't present (fresh clone without dist)."""

import importlib.util
import json
import sys
import unittest
from pathlib import Path

GEN = Path(__file__).resolve().parents[1]
REPLAY = GEN / "dist/ngate-demo/replay"
PROFILE = GEN / "world/hub_profile.northgate.json"


def _load(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


@unittest.skipUnless(REPLAY.exists() and (REPLAY / "manifest.json").exists(),
                     "NGATE demo bundle not present")
class NgateFidelityGates(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        fid = _load("fidelity_capsule", GEN / "fidelity_capsule.py")
        adapter = fid.load_adapter()
        cls.baseline = adapter.build_live_sort_baseline(REPLAY, prefix="ngate")
        cls.manifest = json.loads((REPLAY / "manifest.json").read_text())
        cls.profile = json.loads(PROFILE.read_text())
        cls.gates = fid.run_gates(cls.baseline, cls.manifest, cls.profile)

    def test_all_fidelity_gates_pass(self):
        failing = [g for g in self.gates if not g["pass"]]
        self.assertFalse(
            failing,
            "generator fidelity gates failing:\n"
            + "\n".join(f"{g['gate']} {g['check']}: {g['detail']}" for g in failing),
        )

    def test_foreign_prefix_ignores_ngate_bundle(self):
        """The prefix parameter really scopes classification: the same bundle
        under any foreign hub prefix must classify zero hub/emp files."""
        adapter = _load("live_sort_ingestion",
                        GEN.parent / "Operations/adapters/live_sort_ingestion.py")
        base = adapter.build_live_sort_baseline(REPLAY, prefix="otherhub")
        days = base["sort_dates"].values()
        self.assertEqual(sum(d["hub_snapshots"] + d["employee_snapshots"] for d in days), 0)


if __name__ == "__main__":
    unittest.main()
