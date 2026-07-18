#!/usr/bin/env python3
"""
TransitShield output validator.
Fails (exit 1) if artifacts are missing or malformed:
  - stations.geojson present, valid FeatureCollection, every station has valid NYC
    coords and risk_score in [0,100].
  - summary.json present with required keys and consistent station_count.
  - sources.json present with >=1 keyless source.
"""
import json, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PROC = os.path.join(ROOT, "data", "processed")
META = os.path.join(ROOT, "data", "metadata")

errors = []
def check(cond, msg):
    if not cond:
        errors.append(msg)

# ---- stations.geojson ----
gj_path = os.path.join(PROC, "stations.geojson")
gj = None
if not os.path.exists(gj_path):
    errors.append("missing stations.geojson")
else:
    try:
        gj = json.load(open(gj_path))
    except Exception as e:
        errors.append(f"stations.geojson not valid JSON: {e}")

if gj is not None:
    check(gj.get("type") == "FeatureCollection", "geojson type != FeatureCollection")
    feats = gj.get("features", [])
    check(len(feats) >= 100, f"expected >=100 stations, got {len(feats)}")
    bad_coord = bad_risk = missing_prop = 0
    req_props = {"station_complex", "borough", "annual_ridership", "risk_score",
                 "reliability_index", "exposure_score"}
    for ft in feats:
        geom = ft.get("geometry", {})
        coords = geom.get("coordinates", [None, None])
        if geom.get("type") != "Point" or len(coords) != 2:
            bad_coord += 1; continue
        lon, lat = coords
        if not (isinstance(lon, (int, float)) and isinstance(lat, (int, float))
                and -75 < lon < -73 and 40 < lat < 41):
            bad_coord += 1
        p = ft.get("properties", {})
        if not req_props.issubset(p.keys()):
            missing_prop += 1
        rs = p.get("risk_score")
        if not (isinstance(rs, (int, float)) and 0 <= rs <= 100):
            bad_risk += 1
    check(bad_coord == 0, f"{bad_coord} features with invalid coordinates")
    check(bad_risk == 0, f"{bad_risk} features with risk_score out of [0,100]")
    check(missing_prop == 0, f"{missing_prop} features missing required properties")

# ---- summary.json ----
sm_path = os.path.join(PROC, "summary.json")
sm = None
if not os.path.exists(sm_path):
    errors.append("missing summary.json")
else:
    try:
        sm = json.load(open(sm_path))
    except Exception as e:
        errors.append(f"summary.json not valid JSON: {e}")

if sm is not None:
    for k in ("station_count", "total_annual_ridership", "method",
              "borough_exposure", "top_risk_stations", "components"):
        check(k in sm, f"summary.json missing key '{k}'")
    check(isinstance(sm.get("total_annual_ridership"), int)
          and sm["total_annual_ridership"] > 0, "total_annual_ridership not positive int")
    check(len(sm.get("top_risk_stations", [])) >= 5, "fewer than 5 top_risk_stations")
    check(len(sm.get("borough_exposure", {})) == 5, "expected 5 boroughs in borough_exposure")
    if gj is not None and "station_count" in sm:
        check(sm["station_count"] == len(gj.get("features", [])),
              "summary station_count != geojson feature count")
    # every top station risk in range
    for t in sm.get("top_risk_stations", []):
        check(0 <= t.get("risk_score", -1) <= 100, "top station risk_score out of range")

# ---- sources.json ----
src_path = os.path.join(META, "sources.json")
if not os.path.exists(src_path):
    errors.append("missing sources.json")
else:
    try:
        src = json.load(open(src_path))
        check(src.get("keyless") is True, "sources.json keyless flag not True")
        check(len(src.get("sources", [])) >= 4, "expected >=4 documented sources")
    except Exception as e:
        errors.append(f"sources.json not valid JSON: {e}")

if errors:
    print("VALIDATION FAILED:")
    for e in errors:
        print("  -", e)
    sys.exit(1)

print("VALIDATION PASSED")
print(f"  stations: {len(gj['features'])}")
print(f"  total annual ridership: {sm['total_annual_ridership']:,}")
print(f"  boroughs with exposure: {len(sm['borough_exposure'])}")
sys.exit(0)
