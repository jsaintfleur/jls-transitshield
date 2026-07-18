"use client";

import { useEffect, useRef, useState } from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import { RISK_STOPS } from "@/lib/format";

type Mode = "risk_score" | "exposure";

const MODES: { key: Mode; label: string }[] = [
  { key: "risk_score", label: "Composite risk" },
  { key: "exposure", label: "Climate exposure" },
];

export function RiskMap() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const [mode, setMode] = useState<Mode>("risk_score");
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const maplibregl = (await import("maplibre-gl")).default;
        if (cancelled || !containerRef.current) return;

        const map = new maplibregl.Map({
          container: containerRef.current,
          style: {
            version: 8,
            sources: {},
            layers: [{ id: "bg", type: "background", paint: { "background-color": "#e8eef3" } }],
          },
          center: [-73.95, 40.7],
          zoom: 10,
          attributionControl: false,
        });
        mapRef.current = map;
        map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

        map.on("load", () => {
          map.addSource("stations", { type: "geojson", data: "/data/stations.geojson" });

          // Soft halo under the points for depth on the flat basemap.
          map.addLayer({
            id: "stations-halo",
            type: "circle",
            source: "stations",
            paint: {
              "circle-radius": radiusExpr(1.6),
              "circle-color": "#0f172a",
              "circle-opacity": 0.06,
            },
          });

          map.addLayer({
            id: "stations-circle",
            type: "circle",
            source: "stations",
            paint: {
              "circle-radius": radiusExpr(1),
              "circle-color": colorExpr("risk_score"),
              "circle-opacity": 0.9,
              "circle-stroke-width": 1,
              "circle-stroke-color": "#ffffff",
              "circle-stroke-opacity": 0.75,
            },
          });

          const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false });
          map.on("mousemove", "stations-circle", (e: any) => {
            const f = e.features?.[0];
            if (!f) return;
            map.getCanvas().style.cursor = "pointer";
            const p = f.properties;
            popup
              .setLngLat(f.geometry.coordinates.slice())
              .setHTML(
                `<div style="font-size:12px;line-height:1.5;min-width:180px">
                   <div style="font-weight:600;color:#0f172a">${p.station_complex}</div>
                   <div style="color:#64748b">${p.borough}</div>
                   <div style="margin-top:6px">Composite risk <b style="color:#0369a1">${Number(p.risk_score).toFixed(1)}</b></div>
                   <div style="color:#334155">Annual riders ${nfmt(p.annual_ridership)}</div>
                   <div style="color:#334155">Climate exposure ${Number(p.exposure_score).toFixed(2)}</div>
                 </div>`,
              )
              .addTo(map);
          });
          map.on("mouseleave", "stations-circle", () => {
            map.getCanvas().style.cursor = "";
            popup.remove();
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
      mapRef.current?.remove();
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (map && ready && map.getLayer("stations-circle")) {
      map.setPaintProperty("stations-circle", "circle-color", colorExpr(mode));
    }
  }, [mode, ready]);

  return (
    <div className="relative">
      <div
        className="absolute left-3 top-3 z-10 flex rounded-lg border border-slate-200 bg-white/95 p-0.5 shadow-card"
        role="group"
        aria-label="Map metric"
      >
        {MODES.map((m) => (
          <button
            key={m.key}
            onClick={() => setMode(m.key)}
            aria-pressed={mode === m.key}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              mode === m.key ? "bg-brand-700 text-white" : "text-ink-soft hover:bg-slate-100"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div
        ref={containerRef}
        role="application"
        aria-label={`Map of NYC subway stations sized by annual ridership and colored by ${
          mode === "risk_score" ? "composite climate-resilience risk" : "FEMA climate exposure"
        }. A ranked table of the highest-risk stations is provided below for non-visual access.`}
        className="h-[560px] w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
      />
      {error ? (
        <div className="absolute inset-x-0 bottom-3 mx-auto w-fit rounded-md bg-red-50 px-3 py-1.5 text-xs text-red-700">
          Map failed to load: {error}
        </div>
      ) : null}
      <MapLegend />
    </div>
  );
}

/** Circle color ramp on the chosen 0–100-ish metric. Exposure is 0–1, rescaled to 0–100. */
function colorExpr(field: Mode): any {
  const stops = RISK_STOPS.flatMap(([v, c]) => [v, c]);
  const value =
    field === "exposure"
      ? ["*", ["coalesce", ["get", "exposure_score"], 0], 100]
      : ["coalesce", ["get", "risk_score"], 0];
  return ["interpolate", ["linear"], value, ...stops];
}

/** Radius scaled by annual ridership (~43K -> 3px, ~48.5M -> 12px), scalable by `k`. */
function radiusExpr(k: number): any {
  return [
    "interpolate",
    ["linear"],
    ["coalesce", ["get", "annual_ridership"], 0],
    43000,
    3 * k,
    1_000_000,
    5 * k,
    10_000_000,
    9 * k,
    48_500_000,
    12 * k,
  ];
}

function nfmt(v: any) {
  return v == null ? "—" : Number(v).toLocaleString("en-US");
}

function MapLegend() {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-ink-muted">
      <div className="flex flex-1 items-center gap-3">
        <span>More resilient</span>
        <div
          className="h-2.5 flex-1 rounded-full"
          style={{ background: `linear-gradient(90deg, ${RISK_STOPS.map(([, c]) => c).join(",")})` }}
          aria-hidden
        />
        <span>Fails first</span>
      </div>
      <div className="flex items-center gap-2" aria-hidden>
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-ink-faint" />
        <span className="inline-block h-3 w-3 rounded-full bg-ink-faint" />
        <span>circle size = annual ridership</span>
      </div>
    </div>
  );
}
