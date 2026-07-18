"use client";

import { useEffect, useRef, useState } from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import { RISK_STOPS, fmtCompact } from "@/lib/format";

type Mode = "risk_score" | "station_hazard_score";
type StationFeature = {
  geometry: { coordinates: [number, number] };
  properties: {
    station_complex: string;
    borough: string;
    annual_ridership: number;
    risk_score: number;
    station_hazard_score: number;
    coastal_proximity_proxy: number;
    reliability_index: number;
    hardening_priority: number;
    hazard_confidence: string;
    lines?: string[];
  };
};

const MODES: { key: Mode; label: string }[] = [
  { key: "risk_score", label: "Composite risk" },
  { key: "station_hazard_score", label: "Exposure proxy" },
];

const INITIAL_VIEW = { center: [-73.95, 40.7] as [number, number], zoom: 10 };

export function RiskMap() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const popupRef = useRef<any>(null);
  const [mode, setMode] = useState<Mode>("risk_score");
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stations, setStations] = useState<StationFeature[]>([]);
  const [selected, setSelected] = useState<StationFeature | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [maplibregl, data] = await Promise.all([
          import("maplibre-gl").then((m) => m.default),
          fetch("/data/stations.geojson").then((r) => r.json()),
        ]);
        if (cancelled || !containerRef.current) return;
        setStations(data.features);

        const map = new maplibregl.Map({
          container: containerRef.current,
          style: {
            version: 8,
            sources: {},
            layers: [
              { id: "bg", type: "background", paint: { "background-color": "#eaf1f8" } },
            ],
          },
          center: INITIAL_VIEW.center,
          zoom: INITIAL_VIEW.zoom,
          attributionControl: false,
        });
        mapRef.current = map;
        map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
        popupRef.current = new maplibregl.Popup({ closeButton: false, closeOnClick: false });

        map.on("load", () => {
          map.addSource("stations", { type: "geojson", data });
          map.addLayer({
            id: "stations-halo",
            type: "circle",
            source: "stations",
            paint: {
              "circle-radius": radiusExpr(1.8),
              "circle-color": "#0f172a",
              "circle-opacity": 0.08,
            },
          });
          map.addLayer({
            id: "stations-circle",
            type: "circle",
            source: "stations",
            paint: {
              "circle-radius": radiusExpr(1),
              "circle-color": colorExpr("risk_score"),
              "circle-opacity": 0.92,
              "circle-stroke-width": 1,
              "circle-stroke-color": "#ffffff",
              "circle-stroke-opacity": 0.85,
            },
          });

          map.on("mousemove", "stations-circle", (e: any) => {
            const f = e.features?.[0];
            if (!f) return;
            map.getCanvas().style.cursor = "pointer";
            const p = f.properties;
            popupRef.current
              .setLngLat(f.geometry.coordinates.slice())
              .setHTML(popupHtml(p))
              .addTo(map);
          });
          map.on("mouseleave", "stations-circle", () => {
            map.getCanvas().style.cursor = "";
            popupRef.current?.remove();
          });
          map.on("click", "stations-circle", (e: any) => {
            const f = e.features?.[0];
            if (!f) return;
            const feature = {
              geometry: { coordinates: f.geometry.coordinates },
              properties: normalizeProps(f.properties),
            };
            setSelected(feature);
          });
          setReady(true);
        });

        map.on("error", (e: any) => {
          if (e?.error?.message && !/glyph/i.test(e.error.message)) setError(e.error.message);
        });
      } catch (err: any) {
        setError(err?.message ?? "Failed to load map");
      }
    })();
    return () => {
      cancelled = true;
      popupRef.current?.remove();
      mapRef.current?.remove();
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (map && ready && map.getLayer("stations-circle")) {
      map.setPaintProperty("stations-circle", "circle-color", colorExpr(mode));
    }
  }, [mode, ready]);

  const reset = () => {
    mapRef.current?.flyTo({ center: INITIAL_VIEW.center, zoom: INITIAL_VIEW.zoom, duration: 700 });
    setSelected(null);
  };

  const fallbackRows = stations
    .slice()
    .sort((a, b) => b.properties.hardening_priority - a.properties.hardening_priority)
    .slice(0, 8);

  return (
    <div className="space-y-4">
      <div className="relative">
        <div
          className="absolute left-3 top-3 z-10 flex flex-wrap gap-2 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-panel)]/95 p-1 shadow-[var(--shadow-1)] backdrop-blur"
          role="group"
          aria-label="Map metric"
        >
          {MODES.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => setMode(m.key)}
              aria-pressed={mode === m.key}
              className={`ds-focus-ring rounded-[var(--radius-md)] px-3 py-1.5 text-xs font-semibold transition ${
                mode === m.key
                  ? "bg-[var(--accent-600)] text-white"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-inset)]"
              }`}
            >
              {m.label}
            </button>
          ))}
          <button
            type="button"
            onClick={reset}
            className="ds-focus-ring rounded-[var(--radius-md)] border border-[var(--border-default)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-inset)]"
          >
            Reset view
          </button>
        </div>

        <div
          ref={containerRef}
          role="application"
          aria-label={`Map of NYC subway stations sized by annual ridership and colored by ${
            mode === "risk_score" ? "composite climate-resilience risk" : "station hazard exposure proxy"
          }. Use the station table below as the keyboard-accessible fallback.`}
          className="h-[560px] w-full overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--bg-inset)]"
        />
        {selected ? <StationProfile station={selected} onClose={() => setSelected(null)} /> : null}
        {error ? (
          <div className="absolute inset-x-0 bottom-3 mx-auto w-fit rounded-md bg-red-50 px-3 py-1.5 text-xs text-red-700">
            Map failed to load: {error}
          </div>
        ) : null}
      </div>
      <MapLegend mode={mode} />
      <div className="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--bg-panel)] p-4">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Keyboard station drilldown</h3>
        <p className="mt-1 text-xs text-[var(--text-tertiary)]">
          Select a high-priority station to open the same profile shown from map clicks.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {fallbackRows.map((station) => (
            <button
              key={station.properties.station_complex}
              type="button"
              onClick={() => setSelected(station)}
              className="ds-focus-ring rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-inset)] p-3 text-left text-xs transition hover:border-[var(--accent-600)]"
            >
              <span className="block font-semibold text-[var(--text-primary)]">{station.properties.station_complex}</span>
              <span className="mt-1 block text-[var(--text-tertiary)]">
                Priority {station.properties.hardening_priority.toFixed(1)} · {station.properties.borough}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StationProfile({ station, onClose }: { station: StationFeature; onClose: () => void }) {
  const p = station.properties;
  return (
    <aside className="absolute bottom-4 right-4 z-10 w-[min(360px,calc(100%-2rem))] rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--bg-panel)] p-4 shadow-[var(--shadow-2)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--accent-text)]">
            Station profile
          </p>
          <h3 className="mt-1 text-lg font-semibold text-[var(--text-primary)]">{p.station_complex}</h3>
          <p className="text-sm text-[var(--text-tertiary)]">{p.borough} · {(p.lines ?? []).join(", ")}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="ds-focus-ring rounded-full px-2 py-1 text-sm font-semibold text-[var(--text-tertiary)] hover:bg-[var(--bg-inset)]"
          aria-label="Close station profile"
        >
          x
        </button>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <Metric label="Composite risk" value={p.risk_score.toFixed(1)} />
        <Metric label="Hardening priority" value={p.hardening_priority.toFixed(1)} />
        <Metric label="Exposure proxy" value={p.station_hazard_score.toFixed(2)} />
        <Metric label="Annual riders" value={fmtCompact(p.annual_ridership)} />
        <Metric label="Reliability index" value={p.reliability_index.toFixed(1)} />
        <Metric label="Hazard confidence" value={p.hazard_confidence} />
      </dl>
      <p className="mt-4 text-xs leading-5 text-[var(--text-tertiary)]">
        Recommended action: prioritize floodproofing, backup power, and service-continuity planning before a severe storm season.
      </p>
    </aside>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-md)] bg-[var(--bg-inset)] p-3">
      <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--text-tertiary)]">{label}</dt>
      <dd className="mt-1 font-semibold tabular-nums text-[var(--text-primary)]">{value}</dd>
    </div>
  );
}

function colorExpr(field: Mode): any {
  const stops = RISK_STOPS.flatMap(([v, c]) => [v, c]);
  const value =
    field === "station_hazard_score"
      ? ["*", ["coalesce", ["get", "station_hazard_score"], 0], 100]
      : ["coalesce", ["get", "risk_score"], 0];
  return ["interpolate", ["linear"], value, ...stops];
}

function radiusExpr(k: number): any {
  return [
    "interpolate",
    ["linear"],
    ["coalesce", ["get", "annual_ridership"], 0],
    40_000,
    3 * k,
    1_000_000,
    5 * k,
    10_000_000,
    9 * k,
    48_500_000,
    12 * k,
  ];
}

function MapLegend({ mode }: { mode: Mode }) {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[var(--text-tertiary)]">
      <div className="flex min-w-60 flex-1 items-center gap-3">
        <span>{mode === "risk_score" ? "Lower risk" : "Lower exposure"}</span>
        <div
          className="h-2.5 flex-1 rounded-full"
          style={{ background: `linear-gradient(90deg, ${RISK_STOPS.map(([, c]) => c).join(",")})` }}
          aria-hidden
        />
        <span>{mode === "risk_score" ? "Fails first" : "Higher exposure"}</span>
      </div>
      <div className="flex items-center gap-2" aria-hidden>
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--text-tertiary)]" />
        <span className="inline-block h-3 w-3 rounded-full bg-[var(--text-tertiary)]" />
        <span>circle size = annual ridership</span>
      </div>
    </div>
  );
}

function popupHtml(p: Record<string, any>) {
  return `<div style="font-size:12px;line-height:1.5;min-width:190px">
    <div style="font-weight:700;color:#0f172a">${p.station_complex}</div>
    <div style="color:#64748b">${p.borough}</div>
    <div style="margin-top:6px">Composite risk <b style="color:#142d8c">${Number(p.risk_score).toFixed(1)}</b></div>
    <div style="color:#334155">Exposure proxy ${Number(p.station_hazard_score).toFixed(2)}</div>
    <div style="color:#334155">Annual riders ${Number(p.annual_ridership).toLocaleString("en-US")}</div>
  </div>`;
}

function normalizeProps(p: Record<string, any>): StationFeature["properties"] {
  return {
    station_complex: p.station_complex,
    borough: p.borough,
    annual_ridership: Number(p.annual_ridership),
    risk_score: Number(p.risk_score),
    station_hazard_score: Number(p.station_hazard_score),
    coastal_proximity_proxy: Number(p.coastal_proximity_proxy),
    reliability_index: Number(p.reliability_index),
    hardening_priority: Number(p.hardening_priority),
    hazard_confidence: p.hazard_confidence,
    lines: typeof p.lines === "string" ? JSON.parse(p.lines) : p.lines,
  };
}
