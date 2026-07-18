import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Summary, SourcesMeta, StationCollection, Tier } from "./types";
import { tierOf } from "./format";

const read = <T,>(rel: string): T =>
  JSON.parse(readFileSync(join(process.cwd(), rel), "utf-8")) as T;

export const getSummary = (): Summary => read<Summary>("data/processed/summary.json");
export const getSources = (): SourcesMeta => read<SourcesMeta>("data/metadata/sources.json");
export const getStations = (): StationCollection =>
  read<StationCollection>("data/processed/stations.geojson");

/** Count stations per risk tier, computed from the station scores (not hand-set). */
export function tierCounts(stations: StationCollection): Record<Tier, number> {
  const c: Record<Tier, number> = { Critical: 0, High: 0, Moderate: 0, Lower: 0 };
  for (const f of stations.features) c[tierOf(f.properties.risk_score)] += 1;
  return c;
}

/** Mean composite risk and station count per borough, derived from the stations. */
export function boroughRisk(
  stations: StationCollection,
): { borough: string; meanRisk: number; count: number }[] {
  const acc: Record<string, { sum: number; n: number }> = {};
  for (const f of stations.features) {
    const b = f.properties.borough;
    acc[b] = acc[b] ?? { sum: 0, n: 0 };
    acc[b].sum += f.properties.risk_score;
    acc[b].n += 1;
  }
  return Object.entries(acc)
    .map(([borough, { sum, n }]) => ({ borough, meanRisk: sum / n, count: n }))
    .sort((a, b) => b.meanRisk - a.meanRisk);
}
