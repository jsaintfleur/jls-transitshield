# Project 5 — TransitShield

**"Which stations fail first when the climate turns — and who gets stranded."**

Product Strategy + Analytics Implementation Package
Portfolio of Jean-Luc Saint-Fleur — Product Strategist + Analytics Lead
Sector: Transportation / Climate / Urban Mobility
Package date: July 2026 · Datasets verified July 2026

---

## PART 1 — PRODUCT ONE-PAGER

### The pitch
Transit agencies hold finite hardening capital and a rising climate-hazard bill. They must aim scarce dollars where three things coincide: **climate hazard** (will this place flood/overheat?), **physical unreliability** (does this line already fail?), and **rider consequence** (how many trips and passenger-hours collapse if it goes down?). Today those three signals live in separate silos — reliability in ops dashboards, hazard in FEMA/NOAA files, ridership in open-data portals. TransitShield fuses them into a single, defensible, ranked view of which stations fail first when the climate turns, and who gets stranded when they do.

### Who it is for
- **Transit planners & asset managers** (MTA/NYCT, NJ Transit, BART, WMATA, MBTA) — capital prioritization.
- **Resilience / adaptation officers** — flood-hardening program design and FEMA-grant justification.
- **Capital-program prioritizers** — defensible ranked lists for the board.
- **Emergency-management ops** — pre-storm crew/pump/bus-bridge staging.
- **Infrastructure investors & insurers** — portfolio exposure and downside scenarios.
- **DOT & MPO planning offices; resilience consultancies** (AECOM, WSP, Arup) — client-facing analysis.

### The five decisions it supports
1. Which stations/segments to prioritize for **flood hardening** this capital cycle.
2. Where to **pre-stage crews/pumps/bus bridges** ahead of a forecast storm.
3. Which chronically **unreliable lines** carry compounding climate exposure.
4. **Passenger-hours at risk** under a 10/50/100-yr storm (board & FEMA-grant justification).
5. **Equity screen** — do high social-vulnerability catchments face disproportionate exposure?

### Visual identity
- **Dark, map-forward.** The subway network is the hero — MapLibre GL dark basemap, the line network drawn as the primary layer, graduated station bubbles sized/colored by composite risk.
- **Sequential single-hue, colorblind-safe risk ramp** (e.g. light→deep amber or viridis-family single-hue) for the composite score; never red/green. Ratings that are relative percentiles are labeled as such.
- **Hazard choropleth underlay toggle** — census-tract FEMA NRI Expected Annual Loss / hazard layer that fades in beneath the network.
- **Scenario slider** — a return-period control (10/50/100-yr) that animates station outages and OD flow ribbons; reduced-motion honored.
- Typography: one geometric sans, tabular figures for all metrics. Generous negative space; the map breathes, the panels are quiet.

### The one-line promise
> Point the next hardening dollar where hazard, unreliability, and rider consequence overlap — and show the board the passenger-hours you saved.

---

## PART 2 — PRODUCT REQUIREMENTS DOCUMENT (condensed-complete)

### 2.1 Problem statement
Agencies cannot currently answer "which station should we harden first, and what does it buy us in avoided rider harm?" with one artifact. Hazard, reliability, and ridership are siloed; scenario justification for grants is bespoke and slow. TransitShield is a decision-support web app that computes a composite, validated risk ranking and a storm-scenario simulator on top of fully public data.

### 2.2 Goals & non-goals
**Goals:** unify hazard + reliability + consequence into one ranked, explainable score; deliver a return-period storm simulator that reports passenger-hours lost; provide an equity screen; keep every number traceable to a documented source and formula.
**Non-goals:** real-time flood nowcasting; engineering-grade hydraulic flood modeling; proprietary parcel-level flood risk (First Street excluded); operational train-control integration. TransitShield is a **prioritization and communication** tool, not a live control system.

### 2.3 Target users & personas
- **Priya, Capital Prioritizer (NYCT):** needs a ranked hardening list she can defend to a capital committee.
- **Marcus, Resilience Officer:** needs FEMA-grant-ready passenger-hours-at-risk narratives per station.
- **Dana, Emergency-Ops Lead:** needs pre-storm staging priorities by return period.
- **Renée, MPO Analyst / Equity:** needs the social-vulnerability cross-tab.
- **Sam, Infra Investor:** needs portfolio-level exposure downside.

### 2.4 User stories (representative)
- As a prioritizer, I rank stations by Composite TransitShield Score and export the top-N as a hardening list.
- As a resilience officer, I drag the return-period slider to 100-yr and read total passenger-hours lost + the stations driving it.
- As an ops lead, I filter to a line and see which stations breach the flood threshold first.
- As an equity analyst, I overlay social-vulnerability percentile and test whether high-exposure stations skew to high-SVI catchments.
- As any user, I open a Station Profile and see its reliability, exposure, consequence, and the assumptions behind each.

### 2.5 Scope (v1) & 2.6 Out of scope
**In:** NYC subway (MTA/NYCT) as the reference deployment; five KPIs; seven pages; precomputed 10/50/100-yr scenarios; equity screen. **Out:** other agencies (architecture is portable but v1 ships NYC); live feeds; interpolated return periods beyond precomputed set (stretch route handler only).

### 2.7 Assumptions
Public datasets remain available at documented endpoints; Socrata schemas are re-confirmed before coding; NRI v1.20 (Dec 2025) and a pinned LODES v8 year are the frozen reference versions; line-level incidents are allocated to member stations (documented assumption).

### 2.8 Dependencies
NY Open Data (Socrata) + app token; OpenFEMA NRI; NOAA NCEI Storm Events; Census TIGER/Line; Census LEHD LODES v8. All public domain / open.

### 2.9 Data sources (verified July 2026)
| Source | Endpoint | License | Grain | Key fields |
|---|---|---|---|---|
| MTA Subway Hourly Ridership 2020–2024 | data.ny.gov `wujg-7c2s` | NY Open Data (open) | Hourly × station_complex | `transit_timestamp, station_complex_id, station_complex, borough, ridership, transfers, latitude, longitude, payment_method, fare_class_category` |
| MTA Subway Hourly Ridership Beginning 2025 | data.ny.gov `5wq4-mkjj` | open | Hourly × station_complex | same schema |
| MTA Subway Major Incidents Beginning 2015 | data.ny.gov `caer-yrtv` | open | Monthly × line/division | `month, division, line, category, count` |
| MTA Mean Distance Between Failures Beginning 2015 | data.ny.gov `e2qc-xgxs` | open | Monthly, fleet-level | MDBF |
| MTA Subway Origin-Destination Estimate 2024 | data.ny.gov `jsu2-fbtj` | open | Annual, modeled | origin/destination station complexes |
| FEMA National Risk Index (NRI) | fema.gov OpenFEMA / hazards.fema.gov/nri | Public domain | County **and** census tract | Risk Index score/rating, EAL (overall + 18 hazards incl. coastal flood, riverine flood, hurricane, heat wave), Social Vulnerability, Community Resilience — **pin v1.20 (Dec 2025)** |
| NOAA NCEI Storm Events | ncei.noaa.gov/stormevents (CSV FTP) | Public domain | County/zone, 1950–present | `event_type, begin/end datetime, county/FIPS, damage, magnitude` |
| Census LEHD LODES v8 (supporting) | lehd.ces.census.gov/data/lodes | Public domain | Block OD, jobs | for optional equity cross-check — **pin year** |

**Excluded:** First Street (proprietary).
**Join keys:** station lat/long → point-in-polygon into census tract (NRI) and county FIPS (Storm Events) via TIGER/Line; hand-built station-ID crosswalk across ridership/incident/OD; line→station membership table.

> **DATA RISK — Socrata schema drift:** the Socrata field names above are as documented but MUST be re-confirmed on the live dataset pages before coding. Column names, types, and the split between the 2020–2024 and Beginning-2025 tables can change. Treat all field names as provisional until verified in the ingest step.

### 2.10 KPI DICTIONARY
Each KPI: name · definition · formula · source · grain · period · inclusion/exclusion · limitations · display · interpretation.

---

**KPI 1 — Station Reliability Index (SRI)**
- **Definition:** relative measure of how failure-prone the service through a station is, built from line-level major-incident rate and fleet MDBF, allocated to stations via line membership.
- **Formula:** For station *s* on lines *L(s)*: `incident_rate(line) = major_incidents(line, period) / service_units(line, period)`; station raw = mean over member lines, weighted by line service share at *s*; combine with inverse MDBF signal: `SRI_raw = w1 · z(incident_rate_s) + w2 · z(1 / MDBF_period)`; publish as percentile rank `SRI = percentile(SRI_raw)` (higher = less reliable). Weights `w1,w2` documented and defaulted to 0.5/0.5.
- **Source:** Major Incidents `caer-yrtv` + MDBF `e2qc-xgxs`.
- **Grain:** station_complex (allocated). **Period:** rolling 24 months, monthly refresh.
- **Inclusion/exclusion:** include major incident categories as published; exclude planned-work service changes where flagged. MDBF is fleet-level (see limitation).
- **Limitations:** incidents are **line/division-level**, not station-level — allocation to stations is an assumption, not observed. MDBF is fleet-wide and cannot be truly localized; it enters as a system-level modifier, not a per-station measurement.
- **Display:** graduated bubble on map + gauge on Station Profile; percentile badge.
- **Interpretation:** high SRI = station already sits on chronically failing service; hardening compounds value.

**KPI 2 — Climate Exposure Score (CES)**
- **Definition:** hazard pressure on a station's location, from FEMA NRI tract-level expected annual loss for climate-relevant hazards, enriched by observed NOAA storm frequency/severity for the county.
- **Formula:** `CES_raw = z(NRI_EAL_climate_tract) + λ · z(NOAA_event_rate_county)` where `NRI_EAL_climate` sums coastal flood + riverine flood + hurricane + heat-wave EAL for the station's tract; `NOAA_event_rate` = flood/flash-flood/coastal-flood/heat/high-wind events per year (recent decades) for the station's county. Publish `CES = percentile(CES_raw)`.
- **Source:** FEMA NRI v1.20 (tract) + NOAA Storm Events (county).
- **Grain:** census tract (via point-in-polygon) + county. **Period:** NRI pinned v1.20; NOAA recent decades (e.g. 2000–present).
- **Inclusion/exclusion:** climate-relevant hazards only; exclude non-climate NRI hazards (earthquake, etc.). NOAA restricted to NYC-metro counties + recent decades.
- **Limitations:** NRI ratings are **relative percentiles/national comparisons**, not absolute probabilities; tract EAL is coarse relative to a station footprint; NOAA is county/zone-level and reporting completeness varies over time.
- **Display:** hazard choropleth underlay + bubble color contribution; Station Profile hazard breakdown bars.
- **Interpretation:** high CES = location faces high modeled climate loss and observed storm activity.

**KPI 3 — Passenger-Hours at Risk (scenario R) — PHaR(R)**
- **Definition:** estimated rider passenger-hours disrupted when a return-period-R storm knocks out all stations above a flood threshold, computed on the OD network.
- **Formula:** For scenario R, set outage set `O(R) = {s : exposure_flood(s) ≥ threshold(R)}`. Remove `O(R)` from the network graph; for each OD pair `(o,d)`, if the shortest reachable path is broken or lengthened, `Δtime(o,d) = time_alt − time_base` (unreachable → penalty T_max). `PHaR(R) = Σ_(o,d) trips(o,d) · Δtime(o,d)` in passenger-hours; trips from OD estimate `jsu2-fbtj`, weighted to hourly ridership profile.
- **Source:** OD Estimate `jsu2-fbtj` + Hourly Ridership + reliability/exposure outage set + networkx reachability.
- **Grain:** network-wide, per scenario R ∈ {10,50,100-yr}. **Period:** OD 2024 annual, ridership rolling.
- **Inclusion/exclusion:** subway network only; bus-bridge substitution modeled as penalty, not a routed alternative in v1.
- **Limitations:** OD is a **modeled estimate**, not observed trips; flood threshold and T_max penalty are policy parameters; single-mode (no bus network) — results are relative and scenario-comparative, not literal service forecasts.
- **Display:** headline number on Scenario Simulator; OD flow ribbons animate the lost/rerouted flow; per-station contribution table.
- **Interpretation:** the board-facing "what we lose" number; higher R → larger outage set → more passenger-hours lost.

**KPI 4 — Composite TransitShield Score (CTS)**
- **Definition:** the master prioritization score combining unreliability, exposure, and consequence into one ranked value per station.
- **Formula:** `CTS_raw(s) = f(SRI(s)) × CES(s) × Consequence(s)` where `Consequence(s) = z(passenger_hours_weight(s))` from ridership-weighted throughput + OD centrality; publish `CTS = percentile(CTS_raw)`, ranked 1..N. Multiplicative form so a near-zero on any axis suppresses the score (a station with no riders, or no hazard, is not a hardening priority). Weighting and functional form documented; default equal z-weighting inside each factor.
- **Source:** SRI + CES + ridership/OD consequence.
- **Grain:** station_complex. **Period:** rolling refresh.
- **Inclusion/exclusion:** stations present in the crosswalk across all three domains; stations missing a domain flagged, not silently zeroed.
- **Limitations:** inherits every upstream caveat (line allocation, NRI relative ratings, modeled OD); the multiplicative composite is a **design choice**, validated but not canonical.
- **Display:** primary bubble size+color on hero map; rank column in the hardening table.
- **Interpretation:** the single "harden this next" ordering; drill into Station Profile for the why.

**KPI 5 — Ridership Anomaly Rate (RAR)**
- **Definition:** share of days a station's hourly ridership deviates significantly from its expected seasonal pattern — a proxy for disruption days, with weather-driven drops flagged.
- **Formula:** decompose hourly series with STL (or Prophet); compute robust residual z-score / seasonal-hybrid ESD; a day is anomalous if residual exceeds threshold. `RAR = anomalous_days / observed_days`. Cross-reference anomalous drop-days against NOAA storm days to tag weather-driven anomalies.
- **Source:** Hourly Ridership `wujg-7c2s` + `5wq4-mkjj`; NOAA for tagging.
- **Grain:** station_complex, daily aggregated from hourly. **Period:** 2020–present (note COVID structural break).
- **Inclusion/exclusion:** exclude known data-outage days; the 2020–2021 pandemic regime handled explicitly (either excluded or modeled as a level shift).
- **Limitations:** anomalies conflate weather, incidents, events, and data gaps; NOAA tagging is county-level so attribution is suggestive; STL/ESD thresholds are tunable.
- **Display:** anomaly timeline on Reliability & Anomalies page; weather-tagged markers.
- **Interpretation:** high RAR + weather tagging = a station whose ridership is already climate-sensitive.

### 2.11 Pages & 2.12 Feature list
1. **Landing** — concept, the three-circle overlap idea, CTAs into Overview and Simulator, data-source transparency strip.
2. **Executive Overview** — the network risk map (hero): subway network + graduated station bubbles by CTS, hazard choropleth toggle, KPI cards, ranked hardening-list table (TanStack).
3. **Station Profile** (drill-down) — per-station SRI/CES/Consequence breakdown, hazard bars, ridership sparkline, anomaly mini-timeline, "why this rank" explainer, assumptions footnotes.
4. **Storm Scenario Simulator** — return-period slider (10/50/100-yr), animated station outages, OD flow ribbons, PHaR(R) headline + per-station contribution table.
5. **Reliability & Anomalies** — SRI by line/station, anomaly timeline with weather tags, MDBF context.
6. **Methodology & Data** — every formula, source, version pin, and the calculated-vs-proposed boundary; data-risk register.
7. **About** — author, portfolio framing, honest capability statement.

### 2.13 Required visualizations
Subway network risk map (hero) · hazard choropleth toggle · ranked hardening-list table · scenario slider + animated outage + OD flow ribbons · anomaly timeline · KPI cards · equity screen (SVI × exposure scatter/quadrant).

### 2.14 Information architecture & 2.15 Content model
Precomputed artifacts per domain: `stations.geojson` (geometry + CTS/SRI/CES/consequence), `hazard_tracts.geojson` (NRI choropleth, simplified), `scenario_{10,50,100}.json` (outage set + OD ribbons + PHaR), `anomalies.json` (per-station daily flags), `reliability.json` (line/station SRI), `equity.json`. App is read-only over these; no live DB in v1.

### 2.16 Responsive design
Mobile: map collapses to a stacked KPI + ranked-list view; simulator slider becomes a stepped 3-option control; tables horizontally scroll with sticky rank column. Breakpoints via Tailwind; map min-height guaranteed; panels reflow single-column < md.

### 2.17 Accessibility (WCAG 2.1 AA target)
- **Map ARIA + table fallback:** every map conveys the same ranking through an accessible TanStack table (`role="table"`); map container labeled, keyboard-focusable station list mirrors bubbles.
- **Colorblind-safe** single-hue sequential ramp; never encode by hue alone — pair with size and text labels; percentile ratings stated numerically.
- **Reduced motion:** `prefers-reduced-motion` disables outage/ribbon animation; slider then snaps to static end-states.
- Focus-visible rings, skip links, semantic headings, ARIA-live for scenario headline updates, contrast ≥ 4.5:1 on the dark theme.

### 2.18 Performance
Large geodata handled via **vector tiles or simplified GeoJSON** (topology-preserving simplification), **precomputed scenarios** (no client-side network recompute in v1), Socrata **server-side `$where` + app token** so raw hourly rows never hit the client, DuckDB/Polars pre-aggregation in the pipeline, code-split routes, lazy-loaded map, Parquet intermediate storage. Target LCP < 2.5s on the Overview map with tiles.

### 2.19 Testing strategy
Vitest + RTL (components, KPI formatting, Zod schema guards), Playwright (map load, slider interaction, table sort/export, reduced-motion path), **spatial-join validation** (station→tract/county correctness on a fixture), **scenario-output schema tests** (every `scenario_*.json` validates against Zod contract), rank-correlation validation of CTS vs observed incident frequency in CI as a data-quality gate.

### 2.20 Deployment
GitHub Actions (lint, typecheck, unit, e2e, build) → Vercel. Pipeline runs offline/CI-scheduled; artifacts committed or fetched from release assets. Env: `SOCRATA_APP_TOKEN`. NRI/LODES versions pinned in `data/metadata/`.

### 2.21 Acceptance criteria (v1)
Overview map renders network + CTS bubbles + working hazard toggle; hardening table ranks and exports top-N; Station Profile drill-down shows all three factors with footnotes; Simulator slider switches between 10/50/100-yr and updates PHaR + animation; anomaly timeline renders with weather tags; equity screen renders SVI × exposure; Methodology page documents every formula + version pin + calculated-vs-proposed boundary; a11y (table fallback + reduced-motion) verified; CI green.

### 2.22 Risks & mitigations
| Risk | Mitigation |
|---|---|
| **Line-level incident allocation** (incidents aren't station-observed) | Document assumption prominently; expose allocation weights; label SRI as allocated, present line-level view alongside. |
| **Socrata schema drift** | Re-confirm field names on live pages before coding; Zod-validate ingest; pin dataset IDs; fail loudly on missing columns. |
| **NRI relative-percentile ratings** | Never present as absolute probability; label ratings as national relative percentiles on every surface. |
| **Modeled OD estimates** | Label PHaR as scenario-comparative, not literal; document that OD is modeled, single-mode. |
| **Large-file handling** | Vector tiles/simplified geometry, precomputed scenarios, server-side Socrata filtering, Parquet. |
| **COVID structural break in ridership** | Explicit regime handling in anomaly model; documented. |
| **Calculated vs proposed** | Methodology page draws an explicit line: what is computed from data vs what is a proposed future feature. |

> **Calculated-vs-proposed boundary (v1):** *Calculated* = SRI, CES, PHaR(10/50/100), CTS, RAR, equity cross-tab, all from the listed datasets. *Proposed / stretch* = interpolated return periods between precomputed scenarios, bus-bridge routed alternatives, multi-agency deployment, live storm-forecast ingestion, real-time crew staging.

---

## PART 3 — CODEX IMPLEMENTATION PACKAGE

### 3.1 Repo
`jls-transitshield`

### 3.2 Objective
Ship a Next.js 15 decision-support app over precomputed public-data artifacts that ranks NYC subway stations by a validated composite climate-reliability-consequence risk score and simulates passenger-hours lost under 10/50/100-yr storm scenarios, with an equity screen and full methodological transparency.

### 3.3 Architecture
Two tiers: **(a) Python pipeline** (ingest → transform → validate → export Parquet/GeoJSON/JSON + vector tiles) run in CI/offline; **(b) Next.js App Router frontend** consuming the precomputed artifacts as static assets, with one optional route handler for return-period interpolation (stretch). No runtime database in v1.

### 3.4 Folder structure
```
jls-transitshield/
├── app/
│   ├── layout.tsx  page.tsx (Landing)
│   ├── overview/page.tsx
│   ├── station/[id]/page.tsx
│   ├── simulator/page.tsx
│   ├── reliability/page.tsx
│   ├── methodology/page.tsx
│   ├── about/page.tsx
│   └── api/scenario/route.ts        # stretch: interpolate return periods
├── components/
│   ├── map/ (NetworkRiskMap, HazardChoropleth, StationBubbles, OdRibbons, ScenarioLayer)
│   ├── charts/ (AnomalyTimeline, HazardBars, KpiCard, EquityScatter)
│   ├── table/ (HardeningTable, TableFallback)
│   └── ui/ (shadcn/radix primitives, ReturnPeriodSlider)
├── lib/ (schemas.ts [Zod], kpi.ts, format.ts, mapConfig.ts)
├── public/data/ (stations.geojson, hazard_tracts.geojson, scenario_*.json, anomalies.json, reliability.json, equity.json, tiles/)
├── data/
│   ├── raw/            # untracked downloads
│   ├── processed/      # parquet intermediates
│   └── metadata/       # version pins: nri_v1.20.json, lodes_year.json, dataset_ids.json
├── scripts/
│   ├── ingest/    (mta_socrata.py, fema_nri.py, noaa_storm.py, tiger.py, lodes.py)
│   ├── transform/ (build_crosswalk.py, spatial_joins.py, reliability_index.py,
│   │               anomaly_detect.py, exposure_join.py, od_reachability.py,
│   │               scenario_precompute.py, simplify_geometry.py)
│   └── validate/  (schema_checks.py, spatial_join_checks.py, rank_validation.py)
├── crosswalk/         # station-ID mapping across ridership/incident/OD + line→station
│   ├── station_crosswalk.csv
│   └── line_station_membership.csv
├── tests/ (unit/, e2e/, fixtures/)
├── .github/workflows/ci.yml
└── README.md
```

### 3.5 Ingestion plan
- **MTA (Socrata):** SoQL with server-side `$where` (date/borough windows) + `$select` + `$limit` paging, **app token** header; re-confirm field names against live pages first; write raw → `data/raw/`, then Parquet. Hourly datasets fetched incrementally by date range.
- **OpenFEMA NRI:** download pinned v1.20 county + tract tables (CSV/GeoDB) from OpenFEMA; store version stamp in `data/metadata/nri_v1.20.json`.
- **NOAA Storm Events:** pull CSV files from NCEI FTP, restrict to NYC-metro county FIPS + recent decades.
- **TIGER/Line:** census tract + county shapefiles for point-in-polygon.
- **LODES v8:** pinned year block OD (optional equity cross-check); store year pin.

### 3.6 Transformation plan
1. **build_crosswalk.py** — hand-built + fuzzy-assisted station-ID crosswalk unifying `station_complex_id` across ridership/incident/OD naming; `line_station_membership.csv` maps each line to its stations. Human-reviewed; committed under `crosswalk/`.
2. **spatial_joins.py** — station lat/long → point-in-polygon into NRI tract and county FIPS via GeoPandas/Shapely on TIGER geometries.
3. **reliability_index.py** — incident rate per line ÷ service units, allocate to stations by membership + service share, combine with inverse MDBF → SRI percentile.
4. **anomaly_detect.py** — STL/Prophet decomposition + robust z / seasonal-hybrid ESD per station daily series; tag NOAA storm days → RAR.
5. **exposure_join.py** — NRI climate EAL + NOAA county event rate → CES percentile.
6. **od_reachability.py** — build networkx graph of stations/edges; base shortest paths; for each scenario remove outage set, recompute reachability, sum Δtime × trips → PHaR.
7. **scenario_precompute.py** — for R ∈ {10,50,100}: outage set by flood threshold, OD ribbons, PHaR → `scenario_R.json`.
8. **simplify_geometry.py** — topology-preserving simplification + optional vector-tile build (tippecanoe) for hazard tracts and network.
Composite **CTS** assembled from SRI × CES × Consequence, percentile-ranked, written into `stations.geojson`.

### 3.7 Component list
NetworkRiskMap, HazardChoropleth, StationBubbles, OdRibbons, ScenarioLayer, ReturnPeriodSlider, HardeningTable, TableFallback, AnomalyTimeline, HazardBars, KpiCard, EquityScatter, StationProfilePanel, MethodologySection, DataRiskRegister, ThemeProvider.

### 3.8 Page list
Landing, Executive Overview, Station Profile `[id]`, Storm Scenario Simulator, Reliability & Anomalies, Methodology & Data, About.

### 3.9 Route-handler needs
`app/api/scenario/route.ts` (stretch only) — interpolate PHaR/outage between precomputed return periods; validates query with Zod; v1 ships without it and reads static `scenario_*.json`.

### 3.10 Testing plan
Vitest+RTL unit (KPI formatting, Zod guards, table sort/export); Playwright e2e (map load, slider path, reduced-motion, table fallback); **spatial-join validation** (fixture stations land in correct tract/county); **scenario-output schema tests** (each `scenario_*.json` matches Zod contract); rank-correlation CI gate (CTS vs observed incident frequency — rank corr / AUC).

### 3.11 A11y checklist
Table fallback mirrors map; single-hue + size + label encoding; reduced-motion; focus-visible; ARIA-live scenario headline; contrast ≥ 4.5:1; keyboard station navigation.

### 3.12 Perf checklist
Vector tiles / simplified GeoJSON; precomputed scenarios; server-side Socrata filtering; Parquet intermediates; route code-splitting; lazy map; image/asset budget; LCP < 2.5s target.

### 3.13 Deploy checklist
CI: lint → typecheck → unit → e2e → build; Vercel deploy; `SOCRATA_APP_TOKEN` secret; version pins committed; artifact provenance in README.

### 3.14 Git branch strategy
`main` (protected, deployable) ← short-lived `feat/TS-xx-*`, `fix/*`, `chore/*` branches via PR; squash-merge; CI required green; conventional commits.

### 3.15 Commit plan
One PR per ticket (TS-01…), conventional-commit titles, atomic commits, each PR green in CI before merge.

### 3.16 Definition of Done
Ticket's acceptance criteria met; unit+e2e green; a11y (fallback + reduced-motion) verified for UI tickets; schema/spatial validation green for data tickets; docs/methodology updated where the ticket changes a formula or source; version pins intact; PR reviewed and squash-merged.

---

## PART 4 — TICKETS

### TS-01 — Repo scaffold & tooling
- **Objective:** Next.js 15 App Router + TS strict + Tailwind + Radix/shadcn + ESLint/Prettier + Vitest/RTL/Playwright + GitHub Actions skeleton.
- **Files:** `app/layout.tsx`, `app/page.tsx`, config files, `.github/workflows/ci.yml`, `README.md`.
- **Dependencies:** none.
- **Implementation:** scaffold app, strict tsconfig, Tailwind dark theme tokens (map-forward palette, single-hue risk ramp variables), shadcn init, CI running lint/typecheck/test/build.
- **Tests:** trivial render test passes; CI green.
- **Acceptance:** app boots, dark theme, CI pipeline runs.
- **Commit:** `chore: scaffold next15 ts-strict app with tooling and ci`

### TS-02 — Data metadata, Zod schemas & version pins
- **Objective:** define artifact contracts and pinned versions.
- **Files:** `lib/schemas.ts`, `data/metadata/{dataset_ids,nri_v1.20,lodes_year}.json`.
- **Dependencies:** TS-01.
- **Implementation:** Zod schemas for stations.geojson, hazard_tracts, scenario_*, anomalies, reliability, equity; commit dataset IDs + NRI v1.20 + LODES year pins.
- **Tests:** schemas compile; fixtures validate.
- **Acceptance:** every artifact has a Zod contract + pinned source version.
- **Commit:** `feat: add zod artifact schemas and pinned data version metadata`

### TS-03 — Socrata ingestion (MTA)
- **Objective:** fetch ridership/incidents/MDBF/OD via SoQL + app token.
- **Files:** `scripts/ingest/mta_socrata.py`.
- **Dependencies:** TS-02.
- **Implementation:** re-confirm live field names; `$where`/`$select`/`$limit` paging; app-token header; raw → Parquet; fail loudly on missing expected columns.
- **Tests:** mocked-response unit test; column-presence guard.
- **Acceptance:** Parquet intermediates produced; schema-drift guard raises on missing fields.
- **Commit:** `feat: ingest mta socrata datasets with soql filtering and app token`

### TS-04 — FEMA NRI, NOAA, TIGER, LODES ingestion
- **Objective:** download hazard + geometry + supporting data.
- **Files:** `scripts/ingest/{fema_nri,noaa_storm,tiger,lodes}.py`.
- **Dependencies:** TS-02.
- **Implementation:** OpenFEMA NRI v1.20 tract+county; NOAA CSV restricted to NYC-metro FIPS + recent decades; TIGER tract/county shapefiles; pinned LODES year.
- **Tests:** file-presence + row-count sanity; version-pin assertion.
- **Acceptance:** raw hazard/geo/support data staged with version stamps.
- **Commit:** `feat: ingest fema nri, noaa storm events, tiger and lodes`

### TS-05 — Station-ID crosswalk & line membership
- **Objective:** unify station IDs and map lines→stations.
- **Files:** `crosswalk/station_crosswalk.csv`, `crosswalk/line_station_membership.csv`, `scripts/transform/build_crosswalk.py`.
- **Dependencies:** TS-03.
- **Implementation:** reconcile `station_complex_id` across ridership/incident/OD; fuzzy-assist + human review; document unmatched.
- **Tests:** every ridership station resolves or is explicitly flagged; membership covers all lines.
- **Acceptance:** committed, reviewed crosswalk with coverage report.
- **Commit:** `feat: build station-id crosswalk and line-station membership`

### TS-06 — Spatial joins (station→tract/county)
- **Objective:** attach NRI tract + county FIPS to each station.
- **Files:** `scripts/transform/spatial_joins.py`, `scripts/validate/spatial_join_checks.py`.
- **Dependencies:** TS-04, TS-05.
- **Implementation:** GeoPandas/Shapely point-in-polygon on TIGER; handle points on boundaries.
- **Tests:** fixture stations land in known tract/county; no station unassigned.
- **Acceptance:** every station has tract + county; validation green.
- **Commit:** `feat: spatial-join stations to nri tracts and storm-event counties`

### TS-07 — Reliability Index (SRI)
- **Objective:** compute allocated station reliability.
- **Files:** `scripts/transform/reliability_index.py`.
- **Dependencies:** TS-05.
- **Implementation:** incident rate per line ÷ service units, allocate by membership+service share, combine inverse MDBF, percentile → `reliability.json`. Document allocation weights.
- **Tests:** deterministic on fixture; percentile bounds [0,100].
- **Acceptance:** SRI per station with documented assumption.
- **Commit:** `feat: compute allocated station reliability index from incidents and mdbf`

### TS-08 — Anomaly detection (RAR)
- **Objective:** flag disruption days, tag weather.
- **Files:** `scripts/transform/anomaly_detect.py`.
- **Dependencies:** TS-03.
- **Implementation:** STL/Prophet + robust z / seasonal-hybrid ESD per station daily; handle COVID regime; tag NOAA storm days → `anomalies.json`.
- **Tests:** synthetic spike detected; COVID handling documented; RAR in [0,1].
- **Acceptance:** anomaly flags + weather tags produced.
- **Commit:** `feat: detect ridership anomalies with stl/esd and weather tagging`

### TS-09 — Climate Exposure Score (CES)
- **Objective:** hazard score per station.
- **Files:** `scripts/transform/exposure_join.py`.
- **Dependencies:** TS-06.
- **Implementation:** NRI climate EAL (coastal+riverine flood, hurricane, heat) + NOAA county event rate → percentile; label ratings as relative.
- **Tests:** bounds; missing-tract handling flagged not zeroed.
- **Acceptance:** CES per station with relative-rating labels.
- **Commit:** `feat: compute climate exposure score from nri eal and noaa frequency`

### TS-10 — OD reachability & scenario precompute
- **Objective:** PHaR(R) and outage/ribbon artifacts.
- **Files:** `scripts/transform/od_reachability.py`, `scripts/transform/scenario_precompute.py`, `scripts/validate/schema_checks.py`.
- **Dependencies:** TS-09, TS-05.
- **Implementation:** networkx graph; base paths; for R∈{10,50,100} remove flood-threshold outage set, recompute reachability, Σ trips·Δtime → `scenario_R.json` with outage set + OD ribbons + PHaR. Validate against Zod.
- **Tests:** scenario schema tests; monotonicity (100-yr ≥ 50-yr ≥ 10-yr PHaR); unreachable penalty applied.
- **Acceptance:** three scenario JSONs validate; PHaR monotone.
- **Commit:** `feat: precompute od reachability outages and passenger-hours per return period`

### TS-11 — Composite score, geometry simplification & rank validation
- **Objective:** CTS + map-ready geodata + validation gate.
- **Files:** `scripts/transform/simplify_geometry.py`, CTS assembly, `scripts/validate/rank_validation.py`.
- **Dependencies:** TS-07, TS-08, TS-09, TS-10.
- **Implementation:** CTS = f(SRI)×CES×Consequence percentile → `stations.geojson`; simplify hazard tracts + network / build vector tiles; rank-correlation CTS vs observed incident frequency.
- **Tests:** CTS bounds/rank; multiplicative suppression on zero-axis fixture; rank corr computed + logged.
- **Acceptance:** stations.geojson + simplified hazard geodata; validation report emitted.
- **Commit:** `feat: assemble composite score, simplify geodata, validate ranking`

### TS-12 — Executive Overview: network risk map + hazard toggle + hardening table
- **Objective:** the hero page.
- **Files:** `app/overview/page.tsx`, `components/map/*`, `components/table/HardeningTable.tsx`, `components/table/TableFallback.tsx`, `components/charts/KpiCard.tsx`.
- **Dependencies:** TS-11, TS-02.
- **Implementation:** MapLibre dark basemap, network layer, CTS graduated bubbles, hazard choropleth toggle, KPI cards, TanStack ranked table with top-N export; accessible table fallback.
- **Tests:** RTL table sort/export/fallback; Playwright map load + toggle.
- **Acceptance:** map + toggle + ranked table + KPI cards render and interact.
- **Commit:** `feat: build executive overview map with hazard toggle and hardening table`

### TS-13 — Storm Scenario Simulator (slider + animation + ribbons)
- **Objective:** return-period simulator.
- **Files:** `app/simulator/page.tsx`, `components/ui/ReturnPeriodSlider.tsx`, `components/map/{ScenarioLayer,OdRibbons}.tsx`.
- **Dependencies:** TS-10, TS-12.
- **Implementation:** 10/50/100-yr slider reads scenario_*.json; animate outages + OD ribbons; PHaR headline with ARIA-live; reduced-motion → static end-states.
- **Tests:** Playwright slider switches scenarios + updates PHaR; reduced-motion path; Zod-validated data load.
- **Acceptance:** slider updates map + PHaR; reduced-motion honored.
- **Commit:** `feat: build storm scenario simulator with animated outages and od ribbons`

### TS-14 — Station Profile, Reliability & Anomalies, Equity, Methodology, About
- **Objective:** drill-down + remaining pages.
- **Files:** `app/station/[id]/page.tsx`, `app/reliability/page.tsx`, `app/methodology/page.tsx`, `app/about/page.tsx`, `components/charts/{AnomalyTimeline,HazardBars,EquityScatter}.tsx`, `components/{StationProfilePanel,DataRiskRegister}.tsx`.
- **Dependencies:** TS-07, TS-08, TS-09, TS-11.
- **Implementation:** Station Profile factor breakdown + footnotes; anomaly timeline with weather tags; equity SVI×exposure scatter; Methodology with all formulas/version pins/calculated-vs-proposed boundary + data-risk register; About.
- **Tests:** RTL renders each page from fixtures; equity scatter + anomaly timeline snapshot; methodology contains version pins.
- **Acceptance:** all four pages render with documented assumptions and equity screen.
- **Commit:** `feat: add station profile, reliability, equity, methodology and about pages`

---

## PART 5 — GO-TO-MARKET

### Recruiter description (2–3 sentences)
TransitShield is a decision-support web app that fuses three siloed public datasets — transit reliability (MTA incidents + MDBF), climate hazard (FEMA National Risk Index + NOAA storm history), and rider consequence (hourly + origin-destination ridership) — into one validated, ranked view of which subway stations to harden first and how many passenger-hours a 10/50/100-year storm would cost. Built end-to-end (Python geospatial + anomaly + network pipeline → precomputed scenarios → Next.js/MapLibre app) with an explicit equity screen and a transparent methodology that separates what is calculated from what is proposed.

### Resume bullets (honest, capability-framed)
- Designed and built a full-stack climate-resilience prioritization tool that joins FEMA NRI, NOAA Storm Events, and MTA reliability + ridership data via a hand-built station crosswalk and TIGER spatial joins, producing a validated composite risk ranking (rank-correlation-checked against observed incident frequency).
- Engineered a Python 3.12 pipeline (Polars/DuckDB/GeoPandas, statsmodels/Prophet, networkx) that detects weather-driven ridership anomalies and precomputes storm-scenario outages, reporting passenger-hours-at-risk under 10/50/100-year return periods for grant-grade justification.
- Delivered an accessible, performance-minded Next.js 15 / MapLibre GL front end (colorblind-safe single-hue risk ramp, map ARIA + table fallback, reduced-motion, vector-tiled geodata) with documented data-risk register and calculated-vs-proposed boundary.

### LinkedIn launch post (~150 words)
Transit agencies have limited money to climate-proof their systems — and the data they need to aim it lives in three different silos.

So I built TransitShield: "which stations fail first when the climate turns, and who gets stranded."

It fuses three public datasets that rarely meet:
- Reliability — MTA major incidents + mean distance between failures
- Climate hazard — FEMA National Risk Index + NOAA storm history
- Consequence — hourly and origin-destination ridership

The result is one ranked, explainable score per station, plus a storm-scenario simulator: drag a return-period slider (10/50/100-yr) and watch stations go offline while the app reports the passenger-hours riders would lose — the kind of number a board or a FEMA grant needs.

There's also an equity screen: do high social-vulnerability neighborhoods carry disproportionate exposure?

Stack: Python (GeoPandas, Prophet, networkx) → precomputed scenarios → Next.js 15 + MapLibre GL.

Every number is traceable to a public source, and I kept an honest line between what's calculated and what's proposed.

Feedback from transit and resilience folks very welcome.

---

*All datasets are public domain / open. First Street (proprietary) excluded. Socrata field names and NRI/LODES versions must be re-confirmed and pinned before implementation; NRI ratings are national relative percentiles, and OD ridership is a modeled estimate — these caveats are carried on every relevant surface of the product.*
