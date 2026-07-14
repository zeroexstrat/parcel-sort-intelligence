#!/usr/bin/env python3
"""
emit_volume_analytics.py — WS5.4: the public volume/constants page.

The private Post-Sort/volume_analytics.html embeds a year of REAL daily
volumes (peak included), the REAL scorecard κ fits, a REAL monthly-κ series, and
real belt PPH — it stays local forever. This emitter regenerates the page
from the NGATE world's own data, and only from it:

  card 1  daily volume — seeded draws from calibration volume_params
          (per-DOW lognormals). STEADY STATE ONLY: the world deliberately
          models no peak, and the caption says so.
  card 2  κ_Z3 by DOW — the NGATE metric contract's kappa_dow_steady,
          verbatim, with a dashed flat mean (the swing a single flat
          value hides — the same pedagogical point as the real page).
  card 3  volume DOW bands — p25/median/p75 from the calibration.
          DECISION (handoff WS5.4): the real page's monthly-κ card is
          DROPPED — the world models no seasonality, so none is shown.
  card 4  belt-PPH by DOW — the contract γ made visible: an illustrative
          belt level decayed Mon→Fri by γ (Fri/Mon = γ⁴), seeded jitter.

Datasets are embedded as a JSON block (#va-data) that the charts read —
tests assert against data, not chart source. Chart.js is vendored-first
with the sanctioned document.write CDN fallback. No external fonts.

Deterministic for a given --seed (default 11). Stdlib only.

USAGE
    python3 emit_volume_analytics.py                      # → Post-Sort/dist/ngate/
    python3 emit_volume_analytics.py --out page.html --seed 11
"""
import argparse
import datetime as dt
import json
import math
import random
import shutil
import sys
from pathlib import Path

GEN = Path(__file__).resolve().parent
REPO = GEN.parent
CALIBRATION = GEN / "calibration/calibration.json"
NGATE_PROFILE = GEN / "world/hub_profile.northgate.json"
DEFAULT_OUT = REPO / "Post-Sort/dist/ngate/volume_analytics.html"
CHART_VENDOR = REPO / "Post-Sort/vendor/chart.umd.min.js"

WEEKDAYS = ("Monday", "Tuesday", "Wednesday", "Thursday", "Friday")
DOW_SHORT = ("Mon", "Tue", "Wed", "Thu", "Fri")

# Illustrative Z3 belt level (Monday). The page's signal is the RATIO
# (Fri/Mon = γ⁴), not the level; the caption says exactly that.
BELT_PPH_MONDAY = 200.0


def build_datasets(calib, profile, seed):
    rng = random.Random(seed)
    mc = profile["metric_contract"]
    gamma = mc["gamma_weekly"]["canonical_value"]
    kappa = [mc["structural_constants"]["kappa_dow_steady"][d] for d in WEEKDAYS]

    # card 1 — one steady-state "year": 50 weeks of weekdays from the
    # anchor Monday, volumes drawn from the per-DOW lognormals.
    vp = calib["volume_params"]
    anchor = dt.date(2025, 5, 12)  # a Monday; fictional-year axis
    dates, values = [], []
    for week in range(50):
        for dow in range(5):
            day = anchor + dt.timedelta(days=week * 7 + dow)
            p = vp[str(dow)]
            v = int(round(rng.lognormvariate(p["mu_ln"], p["sigma_ln"])))
            dates.append(day.isoformat())
            values.append(v)

    # card 3 — analytic quartiles of the SAME lognormals the Monte Carlo
    # engine consumes, so this card, card 1, the demo history, and packet
    # instances agree by construction. (calibration.building_volume_dow_bands
    # disagrees with volume_params for Wed/Thu — world tension flagged for
    # WS6; the page stays on the operative source.)
    z25 = 0.6744897501960817
    dow_bands = {"median": [], "p25": [], "p75": []}
    for dow in range(5):
        p = vp[str(dow)]
        dow_bands["median"].append(round(math.exp(p["mu_ln"])))
        dow_bands["p25"].append(round(math.exp(p["mu_ln"] - z25 * p["sigma_ln"])))
        dow_bands["p75"].append(round(math.exp(p["mu_ln"] + z25 * p["sigma_ln"])))

    # card 4 — γ decay at an illustrative belt level, small seeded jitter
    # that never disturbs the Fri/Mon ratio (jitter Tue–Thu only).
    belt = [BELT_PPH_MONDAY]
    for k in range(1, 5):
        belt.append(BELT_PPH_MONDAY * gamma ** k)
    for k in (1, 2, 3):
        belt[k] = belt[k] * (1 + rng.uniform(-0.015, 0.015))
    belt = [round(v, 1) for v in belt]

    return {
        "daily_volume": {"dates": dates, "values": values},
        "kappa_dow": kappa,
        "kappa_flat": round(sum(kappa) / len(kappa), 3),
        "volume_dow_bands": dow_bands,
        "belt_pph_dow": belt,
        "gamma": gamma,
        "n_sorts": len(values),
    }


PAGE = """<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{hub} Volume &amp; Constants — Synthetic Steady-State Timeline</title>
<script src="vendor/chart.umd.min.js"></script>
<script>if(!window.Chart){{document.write('<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js"><\\/script>');}}</script>
<style>
:root{{--bg:#F4F6F9;--surface:#FFF;--ink:#16243A;--mute:#5A6878;--line:#DBE0E7;--navy:#1E3A5F;--steel:#2F6DB0;--sage:#3DAE8E;--terra:#BC6A4D}}
*{{box-sizing:border-box;margin:0}}body{{background:var(--bg);color:var(--ink);font-family:system-ui,-apple-system,sans-serif;padding:26px;line-height:1.5}}
body::before{{content:'';position:fixed;inset:0;z-index:0;pointer-events:none;background-image:linear-gradient(to right,rgba(30,58,95,.05) 1px,transparent 1px),linear-gradient(to bottom,rgba(30,58,95,.05) 1px,transparent 1px),radial-gradient(ellipse 60% 38% at 50% -4%,rgba(56,122,190,.13),transparent 70%);background-size:48px 48px,48px 48px,100% 100%}}
.z{{position:relative;z-index:1;max-width:1080px;margin:0 auto}}
h1{{font-family:Georgia,'Times New Roman',serif;font-weight:700;font-size:30px;margin-bottom:4px}}
.sub{{color:var(--mute);font-size:13px;margin-bottom:22px;font-family:ui-monospace,Menlo,monospace}}
.grid{{display:grid;grid-template-columns:1fr 1fr;gap:16px}}@media(max-width:840px){{.grid{{grid-template-columns:1fr}}}}
.card{{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:16px 18px}}.card.wide{{grid-column:1/-1}}
.card h2{{font-family:Georgia,'Times New Roman',serif;font-size:18px;font-weight:600;margin-bottom:2px}}.card p{{color:var(--mute);font-size:12px;margin-bottom:12px}}
.kpis{{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:18px}}
.kpi{{background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:10px 14px;flex:1;min-width:148px}}
.kpi .n{{font-family:ui-monospace,Menlo,monospace;font-size:19px;font-weight:500;color:var(--navy)}}.kpi .n.t{{color:var(--terra)}}.kpi .n.s{{color:#1F7A5F}}
.kpi .l{{font-size:10.5px;color:var(--mute);text-transform:uppercase;letter-spacing:.06em;margin-top:2px}}
canvas{{max-height:260px}}
</style></head><body><div class="z">
<h1>{hub} Volume &amp; Constants — Synthetic Steady-State Timeline</h1>
<div class="sub">NORTHGATE synthetic world · κ = DOW vector (contract) · γ = belt-PPH within-week decay · every number below is generated from the noised calibration — no production data</div>
<div class="kpis">
<div class="kpi"><div class="n">{n_sorts}</div><div class="l">synthetic sorts · one steady-state year</div></div>
<div class="kpi"><div class="n t">{kappa_mon}&rarr;{kappa_fri}</div><div class="l">κ_Z3 Mon&rarr;Fri (contract)</div></div>
<div class="kpi"><div class="n">{kappa_flat}</div><div class="l">κ_Z3 flat mean</div></div>
<div class="kpi"><div class="n s">{gamma}</div><div class="l">γ belt-PPH (Fri/Mon {fri_mon})</div></div>
</div>
<div class="grid">
<div class="card wide"><h2>Hub volume — daily, one synthetic year</h2><p>Seeded draws from the calibration's per-DOW lognormals. Steady state only — the synthetic world deliberately models no peak season.</p><canvas id="c1"></canvas></div>
<div class="card"><h2>κ_Z3 by day of week (contract)</h2><p>The DOW swing a single flat κ hides. Dashed = the flat mean.</p><canvas id="c2"></canvas></div>
<div class="card"><h2>Volume by day of week (calibration lognormals)</h2><p>p25–p75 band + median implied by the same per-DOW lognormals the Monte Carlo engine consumes. Replaces the real page's monthly-κ card: the world models no seasonality, so none is shown.</p><canvas id="c3"></canvas></div>
<div class="card wide"><h2>Belt-level PPH by day of week — the γ signal</h2><p>Illustrative belt level decayed by the synthetic contract γ = {gamma}; the signal is the ratio, Fri/Mon = γ&#8308; &asymp; {fri_mon}.</p><canvas id="c4"></canvas></div>
</div></div>
<script type="application/json" id="va-data">{data_json}</script>
<script>
const VA=JSON.parse(document.getElementById('va-data').textContent);
const mute='#5A6878',navy='#1E3A5F',steel='#2F6DB0',sage='#3DAE8E',terra='#BC6A4D',line='#DBE0E7';
Chart.defaults.font.family="ui-monospace,Menlo,monospace";Chart.defaults.color=mute;Chart.defaults.font.size=10;
new Chart(c1,{{type:'line',data:{{labels:VA.daily_volume.dates,datasets:[{{data:VA.daily_volume.values,borderColor:navy,backgroundColor:'rgba(30,58,95,.06)',borderWidth:1.3,pointRadius:0,fill:true,tension:.2}}]}},options:{{plugins:{{legend:{{display:false}}}},scales:{{x:{{ticks:{{maxTicksLimit:12,autoSkip:true}},grid:{{display:false}}}},y:{{grid:{{color:line}},title:{{display:true,text:'hub volume'}}}}}}}}}});
new Chart(c2,{{type:'bar',data:{{labels:["Mon","Tue","Wed","Thu","Fri"],datasets:[{{label:'contract κ_Z3',data:VA.kappa_dow,backgroundColor:sage,borderRadius:4,order:2}},{{label:'flat mean',type:'line',data:VA.kappa_dow.map(()=>VA.kappa_flat),borderColor:navy,borderDash:[5,4],borderWidth:1.5,pointRadius:0,order:1}}]}},options:{{plugins:{{legend:{{display:true,labels:{{boxWidth:12}}}}}},scales:{{y:{{suggestedMin:0.30,suggestedMax:0.42,grid:{{color:line}}}},x:{{grid:{{display:false}}}}}}}}}});
new Chart(c3,{{type:'line',data:{{labels:["Mon","Tue","Wed","Thu","Fri"],datasets:[{{label:'p75',data:VA.volume_dow_bands.p75,borderColor:'rgba(47,109,176,.45)',borderWidth:1,pointRadius:0,fill:'+1',backgroundColor:'rgba(47,109,176,.10)'}},{{label:'p25',data:VA.volume_dow_bands.p25,borderColor:'rgba(47,109,176,.45)',borderWidth:1,pointRadius:0}},{{label:'median',data:VA.volume_dow_bands.median,borderColor:terra,borderWidth:2,pointRadius:2.5,pointBackgroundColor:terra}}]}},options:{{plugins:{{legend:{{display:true,labels:{{boxWidth:12}}}}}},scales:{{y:{{grid:{{color:line}},title:{{display:true,text:'building volume'}}}},x:{{grid:{{display:false}}}}}}}}}});
new Chart(c4,{{type:'bar',data:{{labels:["Mon","Tue","Wed","Thu","Fri"],datasets:[{{data:VA.belt_pph_dow,backgroundColor:[terra,navy,navy,navy,steel],borderRadius:4}}]}},options:{{plugins:{{legend:{{display:false}}}},scales:{{y:{{suggestedMin:170,grid:{{color:line}},title:{{display:true,text:'Z3 belt PPH (illustrative)'}}}},x:{{grid:{{display:false}}}}}}}}}});
</script></body></html>
"""


def render(calib, profile, seed):
    data = build_datasets(calib, profile, seed)
    return PAGE.format(
        hub=profile["identity"]["hub_code"],
        n_sorts=data["n_sorts"],
        kappa_mon=data["kappa_dow"][0],
        kappa_fri=data["kappa_dow"][4],
        kappa_flat=data["kappa_flat"],
        gamma=data["gamma"],
        fri_mon=round(data["gamma"] ** 4, 3),
        data_json=json.dumps(data, separators=(",", ":")),
    )


def main(argv=None):
    ap = argparse.ArgumentParser(description="Emit the synthetic volume/constants page.")
    ap.add_argument("--out", type=Path, default=DEFAULT_OUT)
    ap.add_argument("--seed", type=int, default=11)
    ap.add_argument("--calibration", type=Path, default=CALIBRATION)
    ap.add_argument("--profile", type=Path, default=NGATE_PROFILE)
    args = ap.parse_args(argv)

    calib = json.loads(args.calibration.read_text())
    profile = json.loads(args.profile.read_text())
    html = render(calib, profile, args.seed)
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(html)
    # Self-contained dist: vendor the lib beside the page — the CDN fallback
    # must never be load-bearing (a broken relative path renders via CDN
    # silently; the WS5.4 browser check caught exactly that).
    vendor_dir = args.out.parent / "vendor"
    vendor_dir.mkdir(exist_ok=True)
    shutil.copy2(CHART_VENDOR, vendor_dir / CHART_VENDOR.name)
    print(f"emit_volume_analytics: {profile['identity']['hub_code']} page "
          f"({len(html)} bytes, seed {args.seed}) → {args.out}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
