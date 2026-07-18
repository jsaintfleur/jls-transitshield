"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { StormScenario } from "@/lib/types";
import { fmtCompact, fmtInt } from "@/lib/format";

export function StormScenarioPanel({ scenarios }: { scenarios: StormScenario[] }) {
  const [index, setIndex] = useState(Math.min(2, scenarios.length - 1));
  const selected = scenarios[index];
  const rows = useMemo(
    () =>
      scenarios.map((s) => ({
        label: `${s.return_period_years}yr`,
        stations: s.stations_over_threshold,
        passengerHours: s.passenger_hours_at_risk,
      })),
    [scenarios],
  );

  if (!selected) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border-subtle)] p-6 text-sm text-[var(--text-tertiary)]">
        Storm scenario data is unavailable.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-inset)] p-4">
        <label className="text-sm font-semibold text-[var(--text-primary)]">
          Return period: {selected.return_period_years}-year storm
          <input
            type="range"
            min="0"
            max={scenarios.length - 1}
            step="1"
            value={index}
            onChange={(e) => setIndex(Number(e.currentTarget.value))}
            className="mt-3 w-full accent-[var(--accent-600)]"
          />
        </label>
        <dl className="mt-4 grid grid-cols-3 gap-3 text-sm">
          <Metric label="Stations over threshold" value={fmtInt(selected.stations_over_threshold)} />
          <Metric label="Annual riders exposed" value={fmtCompact(selected.annual_ridership_over_threshold)} />
          <Metric label="Passenger-hours at risk" value={fmtCompact(selected.passenger_hours_at_risk)} />
        </dl>
      </div>
      <div className="h-72" role="img" aria-label="Storm scenarios comparing stations over threshold by return period.">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} margin={{ top: 8, right: 18, bottom: 8, left: 4 }}>
            <CartesianGrid stroke="var(--border-subtle)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: "var(--text-tertiary)", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "var(--text-tertiary)", fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                background: "var(--bg-panel)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 12,
                color: "var(--text-primary)",
                boxShadow: "var(--shadow-1)",
              }}
              formatter={(value) => [fmtInt(Number(value)), "Stations over threshold"]}
            />
            <Bar dataKey="stations" fill="var(--accent-600)" radius={[6, 6, 0, 0]} isAnimationActive />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs leading-5 text-[var(--text-tertiary)]">
        Threshold logic uses the modeled station hazard proxy and scenario intensity. Passenger-hours
        are daily riders multiplied by assumed outage hours; this is planning exposure, not a forecast
        of actual storm damage.
      </p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--text-tertiary)]">{label}</dt>
      <dd className="mt-1 text-lg font-semibold tabular-nums text-[var(--text-primary)]">{value}</dd>
    </div>
  );
}
