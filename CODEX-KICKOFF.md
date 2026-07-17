# TransitShield Kickoff

## Expected Work Package

Copy `project-5-transitshield.md` into this repo root as:

```text
WORKPACKAGE.md
```

## Kickoff Command

```text
Read WORKPACKAGE.md — the full package for TransitShield: a transit climate-resilience composite risk score + storm scenario
simulator + reliability/anomaly detection for the NYC subway. Execute TS-01 → TS-14 in order.

Pipeline: ingest MTA Subway Hourly Ridership (wujg-7c2s + 5wq4-mkjj, server-side Socrata $where + app token), Major Incidents
(caer-yrtv), Mean Distance Between Failures (e2qc-xgxs), Origin-Destination 2024 (jsu2-fbtj), FEMA National Risk Index (pin
v1.20), NOAA Storm Events, and Census LODES. FIRST re-confirm the live Socrata field names (they may drift). Build the station-ID
crosswalk (main integration cost), spatial joins (station lat/long → tract for NRI, county for storms), the reliability index,
ridership anomaly detection (STL + robust-z / seasonal-hybrid-ESD), the exposure join, OD outage propagation with networkx, and
precomputed storm scenarios by return period. Composite Risk = f(reliability) × exposure × consequence, z-scored/ranked.
Document the line-level incident-allocation assumption.

App: Landing, Executive Overview (dark MapLibre subway-network risk map hero, hazard choropleth toggle), Station Profile, Storm
Scenario Simulator (return-period slider animating outages + OD flow ribbons; respect prefers-reduced-motion), Reliability &
Anomalies, Methodology & Data, About. Sky-blue #0284c7, sequential single-hue risk ramp. Scenarios precomputed; app consumes
them. Commit per ticket; pause for GitHub/Vercel + Socrata token. Confirm plan, then start TS-01.
```
