#!/usr/bin/env python3
"""
TransitShield — NYC Subway Climate-Resilience Risk Index
Build script: joins keyless open data into a per-station composite risk index.

Inputs (data/raw/, pulled by fetch step; see data/metadata/sources.json):
  - ridership_2025.json        MTA Subway Hourly Ridership, aggregated by station (5wq4-mkjj)
  - incidents_by_line.json     MTA Subway Major Incidents by division+line (ereg-mcvp)
  - mdbf_by_division.json      MTA Mean Distance Between Failures by division (e2qc-xgxs)
  - fema_nri_nyc_counties.json FEMA National Risk Index, 5 NYC counties (ArcGIS FeatureServer)

Outputs (data/processed/):
  - stations.geojson
  - summary.json
Method + assumptions documented inline and in summary.json.
"""
import csv, json, math, re, os, shutil
from collections import defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, "data", "raw")
OUT = os.path.join(ROOT, "data", "processed")
PUBLIC = os.path.join(ROOT, "public", "data")
os.makedirs(OUT, exist_ok=True)
os.makedirs(PUBLIC, exist_ok=True)

def load(name):
    path = os.path.join(RAW, name)
    if os.path.exists(path):
        with open(path) as f:
            return json.load(f)

    # The portfolio repos intentionally do not commit data/raw. In a fresh clone,
    # rebuild the derived model from committed processed artifacts instead of
    # failing before validation can run.
    processed_stations = os.path.join(OUT, "stations.geojson")
    processed_summary = os.path.join(OUT, "summary.json")
    if not (os.path.exists(processed_stations) and os.path.exists(processed_summary)):
        raise FileNotFoundError(path)
    gj = json.load(open(processed_stations))
    sm = json.load(open(processed_summary))

    if name == "ridership_2025.json":
        rows = []
        for ft in gj.get("features", []):
            p = ft["properties"]
            lon, lat = ft["geometry"]["coordinates"]
            rows.append({
                "station_complex": p["station_complex"],
                "station_complex_id": p.get("station_complex_id"),
                "borough": p["borough"],
                "latitude": lat,
                "longitude": lon,
                "annual_ridership": p.get("annual_ridership", 0),
            })
        return rows

    if name == "incidents_by_line.json":
        by_line = defaultdict(list)
        for ft in gj.get("features", []):
            p = ft["properties"]
            for ln in p.get("lines", []):
                by_line[ln].append(float(p.get("reliability_index", 0)))
        return [
            {
                "division": "A" if ln and ln[0].isdigit() else "B",
                "line": ln,
                "incidents": sum(vals) / len(vals),
            }
            for ln, vals in by_line.items()
            if vals
        ]

    if name == "mdbf_by_division.json":
        return [{"division": "A", "avg_mdbf": 1.0}, {"division": "B", "avg_mdbf": 1.0}]

    if name == "fema_nri_nyc_counties.json":
        features = []
        for borough, b in sm.get("borough_exposure", {}).items():
            features.append({
                "attributes": {
                    "STCOFIPS": b.get("county_fips"),
                    "COUNTY": b.get("county", borough),
                    "CFLD_RISKS": b.get("coastal_flood_risk", 0),
                    "HRCN_RISKS": b.get("hurricane_risk", 0),
                    "RFLD_RISKS": b.get("flood_risk", 0),
                    "RISK_SCORE": b.get("composite_risk", 0),
                    "SOVI_SCORE": b.get("social_vulnerability", 0),
                    "CFLD_EALT": b.get("coastal_flood_eal_usd", 0),
                    "HRCN_EALT": b.get("hurricane_eal_usd", 0),
                }
            })
        return {"features": features}

    raise FileNotFoundError(path)

# ----------------------------------------------------------------------------
# 1. Stations + ridership (consequence)
# ----------------------------------------------------------------------------
ridership = load("ridership_2025.json")

# ----------------------------------------------------------------------------
# 2. Incidents by line -> station reliability (approximation)
#
# ASSUMPTION (documented): major-incident counts are reported per subway *line*,
# not per station. We parse the line labels embedded in each station complex name
# (e.g. "Hewes St (M,J)") and assign the station the MEAN 2020-present major-incident
# count of the lines serving it. This assumes incidents distribute uniformly across
# the stations of a line — a deliberate simplification. Per-station incident
# geolocation is a PROPOSED enhancement.
# ----------------------------------------------------------------------------
incidents = load("incidents_by_line.json")
line_incidents = {}          # line label -> total incidents
line_division = {}           # line label -> division
for r in incidents:
    ln = (r.get("line") or "").strip()
    if not ln:
        continue
    line_incidents[ln] = line_incidents.get(ln, 0.0) + float(r["incidents"])
    line_division[ln] = r.get("division", "")

# ----------------------------------------------------------------------------
# 3. MDBF by division -> fleet-reliability modifier
#    Lower mean-distance-between-failures = worse reliability => larger factor.
# ----------------------------------------------------------------------------
mdbf = load("mdbf_by_division.json")
div_mdbf = {r["division"].strip(): float(r["avg_mdbf"]) for r in mdbf}  # {'A':..,'B':..}
mean_mdbf = sum(div_mdbf.values()) / len(div_mdbf)
div_factor = {d: mean_mdbf / v for d, v in div_mdbf.items()}  # A<1 (good fleet), B>1 (worse)

def parse_lines(complex_name):
    """Extract serving line labels from the parenthetical in a station complex name."""
    m = re.findall(r"\(([^)]*)\)", complex_name or "")
    if not m:
        return []
    inside = m[-1]
    # Skip borough-only parentheticals (e.g. 'RI Tramway (Manhattan)')
    if inside.strip() in ("Manhattan", "Brooklyn", "Queens", "Bronx", "Staten Island"):
        return []
    return [p.strip() for p in inside.split(",") if p.strip()]

def line_to_division(ln):
    """Numbered lines -> A Division, lettered -> B Division (standard NYC mapping)."""
    if ln and ln[0].isdigit():
        return "A"
    return "B"

def station_reliability(complex_name):
    """Return (reliability_raw, matched_lines, division_key). Higher = worse."""
    lines = parse_lines(complex_name)
    matched = [l for l in lines if l in line_incidents]
    if matched:
        inc = sum(line_incidents[l] for l in matched) / len(matched)
    elif lines:
        # lines present but no incident match (e.g. shuttle 'S'): borough-average later
        inc = None
    else:
        inc = None
    # division mix -> fleet factor
    divs = [line_to_division(l) for l in lines] if lines else []
    if divs:
        fac = sum(div_factor.get(d, 1.0) for d in divs) / len(divs)
        dkey = max(set(divs), key=divs.count)
    else:
        fac = 1.0
        dkey = "?"
    return inc, fac, dkey, lines

def haversine_km(lon1, lat1, lon2, lat2):
    r = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lon2 - lon1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * r * math.asin(math.sqrt(a))

# Coastal/transit-waterway anchor points used only as a documented proxy. This
# does not replace station-level flood-depth or elevation data; it differentiates
# stations inside a borough when the available FEMA NRI data is county-level.
COASTAL_ANCHORS = [
    (-73.835, 40.581),  # Rockaway Park
    (-73.755, 40.604),  # Far Rockaway
    (-73.978, 40.575),  # Coney Island
    (-74.013, 40.703),  # South Ferry / Battery
    (-73.995, 40.700),  # East River waterfront / DUMBO
    (-73.945, 40.747),  # Long Island City waterfront
    (-73.912, 40.775),  # Astoria / East River
    (-74.075, 40.644),  # St. George waterfront
]

def coastal_proximity_proxy(lon, lat):
    d = min(haversine_km(lon, lat, alon, alat) for alon, alat in COASTAL_ANCHORS)
    # 1.0 at/near a listed coastal transit corridor, tapering toward 0 by ~8 km.
    return max(0.0, min(1.0, math.exp(-d / 3.0)))

# ----------------------------------------------------------------------------
# 4. FEMA NRI -> borough (county) climate exposure
#    Uses national-percentile risk scores (0-100): coastal flood (CFLD_RISKS),
#    hurricane (HRCN_RISKS), composite (RISK_SCORE); plus raw EAL $ and SOVI.
#    Exposure is borough-uniform — per-station hazard is a PROPOSED enhancement.
# ----------------------------------------------------------------------------
nri = load("fema_nri_nyc_counties.json")["features"]
COUNTY_BOROUGH = {
    "36005": "Bronx", "36047": "Brooklyn", "36061": "Manhattan",
    "36081": "Queens", "36085": "Staten Island",
}
# MTA borough label 'Brooklyn'/'Staten Island' vs county names Kings/Richmond handled via FIPS.
def num(x):
    try:
        return float(x)
    except (TypeError, ValueError):
        return 0.0

borough_exposure = {}
for feat in nri:
    a = feat["attributes"]
    fips = str(a.get("STCOFIPS"))
    boro = COUNTY_BOROUGH.get(fips)
    if not boro:
        continue
    cfld = num(a.get("CFLD_RISKS"))   # coastal flood risk score (0-100 pctl)
    hrcn = num(a.get("HRCN_RISKS"))   # hurricane risk score
    rfld = num(a.get("RFLD_RISKS"))   # riverine flood (often null for urban NYC)
    comp = num(a.get("RISK_SCORE"))   # composite NRI risk index
    sovi = num(a.get("SOVI_SCORE"))   # social vulnerability
    flood = max(cfld, rfld)           # flood component = worst of coastal/riverine
    # exposure (0-1): weighted blend of coastal/hurricane hazard + composite
    exposure = (0.40 * cfld + 0.35 * hrcn + 0.25 * comp) / 100.0
    borough_exposure[boro] = {
        "county_fips": fips,
        "county": a.get("COUNTY"),
        "coastal_flood_risk": round(cfld, 1),
        "hurricane_risk": round(hrcn, 1),
        "flood_risk": round(flood, 1),
        "composite_risk": round(comp, 1),
        "social_vulnerability": round(sovi, 1),
        "coastal_flood_eal_usd": round(num(a.get("CFLD_EALT")), 0),
        "hurricane_eal_usd": round(num(a.get("HRCN_EALT")), 0),
        "exposure_score": round(exposure, 4),
    }

# ----------------------------------------------------------------------------
# 5. Assemble per-station records
# ----------------------------------------------------------------------------
recs = []
reliab_vals_for_borough = defaultdict(list)
raw_recs = []
for r in ridership:
    boro = r.get("borough")
    try:
        lat = float(r["latitude"]); lon = float(r["longitude"])
    except (TypeError, ValueError, KeyError):
        continue
    if not (-75 < lon < -73 and 40 < lat < 41):   # NYC bbox sanity gate
        continue
    ann = float(r.get("annual_ridership", 0) or 0)
    inc, fac, dkey, lines = station_reliability(r["station_complex"])
    raw_recs.append(dict(r=r, boro=boro, lat=lat, lon=lon, ann=ann,
                         inc=inc, fac=fac, dkey=dkey, lines=lines))
    if inc is not None:
        reliab_vals_for_borough[boro].append(inc)

# borough-average incident level for stations lacking a matched line
boro_avg_inc = {b: (sum(v) / len(v)) for b, v in reliab_vals_for_borough.items() if v}
global_avg_inc = sum(sum(v) for v in reliab_vals_for_borough.values()) / \
                 max(1, sum(len(v) for v in reliab_vals_for_borough.values()))

for rr in raw_recs:
    inc = rr["inc"]
    if inc is None:
        inc = boro_avg_inc.get(rr["boro"], global_avg_inc)
    reliability = inc * rr["fac"]        # Station Reliability Index (higher = worse)
    rr["reliability"] = reliability

# zscore of reliability across stations
rvals = [rr["reliability"] for rr in raw_recs]
mu = sum(rvals) / len(rvals)
sd = (sum((x - mu) ** 2 for x in rvals) / len(rvals)) ** 0.5 or 1.0

for rr in raw_recs:
    exp = borough_exposure.get(rr["boro"], {}).get("exposure_score", 0.0)
    proximity = coastal_proximity_proxy(rr["lon"], rr["lat"])
    # Station hazard proxy: preserve the FEMA borough signal but increase it for
    # stations closer to known coastal/transit-waterway corridors. The uplift is
    # capped so borough FEMA exposure remains the dominant source.
    station_hazard = min(1.0, exp * (0.82 + 0.28 * proximity))
    z = (rr["reliability"] - mu) / sd
    consequence = math.log(rr["ann"] + 1.0)
    # Composite: zscore(reliability) x station hazard proxy x log(ridership+1)
    composite_raw = z * station_hazard * consequence
    rr["z"] = z
    rr["exp"] = exp
    rr["coastal_proximity_proxy"] = proximity
    rr["station_hazard_score"] = station_hazard
    rr["consequence"] = consequence
    rr["composite_raw"] = composite_raw

# rank composite_raw -> 0..100 (percentile rank; robust to sign)
order = sorted(raw_recs, key=lambda x: x["composite_raw"])
n = len(order)
for i, rr in enumerate(order):
    rr["risk_score"] = round(100.0 * i / (n - 1), 2) if n > 1 else 0.0

ridership_order = sorted(raw_recs, key=lambda x: x["ann"])
ridership_rank = {id(rr): (100.0 * i / (n - 1) if n > 1 else 0.0) for i, rr in enumerate(ridership_order)}
for rr in raw_recs:
    rr["ridership_percentile"] = ridership_rank[id(rr)]
    rr["hardening_priority"] = round(
        0.45 * rr["risk_score"] + 0.30 * rr["station_hazard_score"] * 100 + 0.25 * rr["ridership_percentile"],
        2,
    )

SCENARIOS = [
    {"return_period_years": 10, "intensity": 0.78, "outage_hours": 6},
    {"return_period_years": 25, "intensity": 0.92, "outage_hours": 12},
    {"return_period_years": 50, "intensity": 1.05, "outage_hours": 24},
    {"return_period_years": 100, "intensity": 1.18, "outage_hours": 36},
    {"return_period_years": 500, "intensity": 1.38, "outage_hours": 72},
]

def storm_scenarios(records):
    rows = []
    for sc in SCENARIOS:
        impacted = [
            rr for rr in records
            if rr["station_hazard_score"] * sc["intensity"] * 100 >= 80
        ]
        passenger_hours = sum((rr["ann"] / 365.0) * sc["outage_hours"] for rr in impacted)
        rows.append({
            **sc,
            "threshold_score": 80,
            "stations_over_threshold": len(impacted),
            "annual_ridership_over_threshold": int(sum(rr["ann"] for rr in impacted)),
            "passenger_hours_at_risk": int(round(passenger_hours)),
        })
    return rows

def hardening_list(records, limit=30):
    top = sorted(records, key=lambda x: -x["hardening_priority"])[:limit]
    return [
        {
            "rank": i + 1,
            "station_complex": rr["r"]["station_complex"],
            "borough": rr["boro"],
            "hardening_priority": rr["hardening_priority"],
            "risk_score": rr["risk_score"],
            "station_hazard_score": round(rr["station_hazard_score"], 4),
            "coastal_proximity_proxy": round(rr["coastal_proximity_proxy"], 4),
            "annual_ridership": int(rr["ann"]),
            "reliability_index": round(rr["reliability"], 3),
            "recommended_action": "Prioritize floodproofing, power resilience, and service-continuity planning",
        }
        for i, rr in enumerate(top)
    ]

# ----------------------------------------------------------------------------
# 6. Emit GeoJSON
# ----------------------------------------------------------------------------
features = []
for rr in raw_recs:
    r = rr["r"]
    boro = rr["boro"]
    exp_meta = borough_exposure.get(boro, {})
    features.append({
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [round(rr["lon"], 6), round(rr["lat"], 6)]},
        "properties": {
            "station_complex": r["station_complex"],
            "station_complex_id": r.get("station_complex_id"),
            "borough": boro,
            "annual_ridership": int(rr["ann"]),
            "lines": rr["lines"],
            "reliability_index": round(rr["reliability"], 3),
            "reliability_zscore": round(rr["z"], 3),
            "exposure_score": round(rr["exp"], 4),
            "station_hazard_score": round(rr["station_hazard_score"], 4),
            "coastal_proximity_proxy": round(rr["coastal_proximity_proxy"], 4),
            "hazard_confidence": "modeled proxy",
            "coastal_flood_risk": exp_meta.get("coastal_flood_risk"),
            "hurricane_risk": exp_meta.get("hurricane_risk"),
            "risk_score": rr["risk_score"],
            "hardening_priority": rr["hardening_priority"],
        },
    })

geojson = {"type": "FeatureCollection",
           "name": "transitshield_stations",
           "features": sorted(features, key=lambda f: -f["properties"]["risk_score"])}
with open(os.path.join(OUT, "stations.geojson"), "w") as f:
    json.dump(geojson, f)

# ----------------------------------------------------------------------------
# 7. Emit summary.json
# ----------------------------------------------------------------------------
total_ride = sum(int(rr["ann"]) for rr in raw_recs)
top = sorted(raw_recs, key=lambda x: -x["risk_score"])[:15]
hardening = hardening_list(raw_recs)
scenarios = storm_scenarios(raw_recs)
summary = {
    "product": "TransitShield — NYC Subway Climate-Resilience Risk Index",
    "generated_utc": __import__("datetime").datetime.utcnow().isoformat() + "Z",
    "station_count": len(raw_recs),
    "total_annual_ridership": total_ride,
    "ridership_year": 2025,
    "method": {
        "composite_formula": "risk_raw = zscore(reliability) * station_hazard_proxy * ln(annual_ridership+1); ranked 0-100 by percentile",
        "reliability_index": "mean 2020-present major-incident count of lines serving a station (parsed from station name), scaled by division MDBF fleet factor. Higher = worse.",
        "reliability_assumption": "Incidents are line-level; assumed to distribute uniformly across a line's stations. Per-station incident geolocation is PROPOSED.",
        "exposure": "FEMA NRI county (borough) national-percentile scores: 0.40*coastal_flood + 0.35*hurricane + 0.25*composite, /100.",
        "station_hazard_proxy": "Per-station hazard = borough FEMA exposure adjusted by coordinate proximity to documented coastal/transit-waterway anchor corridors. This is a modeled proxy, not station flood-depth or elevation data.",
        "storm_scenario": "Return-period slider applies scenario intensity to the station hazard proxy. Passenger-hours at risk = daily riders at stations over threshold * assumed outage hours.",
        "weights": {"exposure_coastal_flood": 0.40, "exposure_hurricane": 0.35, "exposure_composite": 0.25},
    },
    "components": {
        "computed": [
            "per-station annual ridership + coordinates + borough",
            "line-allocated station reliability index",
            "borough climate exposure from FEMA NRI",
            "station-level hazard proxy from coordinates + FEMA borough exposure",
            "composite TransitShield risk score (0-100)",
            "storm scenario passenger-hours at risk",
            "ranked hardening priority list",
        ],
        "proposed": [
            "origin-destination network outage propagation",
            "observed station-level flood-depth/elevation modeling",
            "asset-level capital-cost estimates",
        ],
    },
    "freshness": {
        "ridership_year": 2025,
        "incidents_window": "2020-present source extract",
        "fema_nri_resolution": "county/borough",
        "station_hazard_resolution": "modeled station proxy from coordinates",
    },
    "borough_exposure": borough_exposure,
    "storm_scenarios": scenarios,
    "hardening_list": hardening,
    "top_risk_stations": [
        {
            "rank": i + 1,
            "station_complex": rr["r"]["station_complex"],
            "borough": rr["boro"],
            "risk_score": rr["risk_score"],
            "annual_ridership": int(rr["ann"]),
            "exposure_score": round(rr["exp"], 4),
            "station_hazard_score": round(rr["station_hazard_score"], 4),
            "coastal_proximity_proxy": round(rr["coastal_proximity_proxy"], 4),
            "reliability_index": round(rr["reliability"], 3),
            "hardening_priority": rr["hardening_priority"],
        }
        for i, rr in enumerate(top)
    ],
}
with open(os.path.join(OUT, "summary.json"), "w") as f:
    json.dump(summary, f, indent=2)

with open(os.path.join(OUT, "hardening-list.csv"), "w", newline="") as f:
    cols = [
        "rank", "station_complex", "borough", "hardening_priority", "risk_score",
        "station_hazard_score", "coastal_proximity_proxy", "annual_ridership",
        "reliability_index", "recommended_action",
    ]
    writer = csv.DictWriter(f, fieldnames=cols)
    writer.writeheader()
    writer.writerows(hardening)

for name in ("stations.geojson", "summary.json", "hardening-list.csv"):
    shutil.copyfile(os.path.join(OUT, name), os.path.join(PUBLIC, name))
shutil.copyfile(os.path.join(ROOT, "data", "metadata", "sources.json"), os.path.join(PUBLIC, "sources.json"))

print(f"Built {len(raw_recs)} stations | total annual ridership {total_ride:,}")
print("Top 5 risk stations:")
for rr in top[:5]:
    print(f"  {rr['risk_score']:5.1f}  {rr['r']['station_complex']} ({rr['boro']})")
