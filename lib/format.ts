export const nf = new Intl.NumberFormat("en-US");
export const fmtInt = (n: number) => nf.format(Math.round(n));
export const fmtPct = (n: number | null) => (n == null ? "—" : `${Number(n).toFixed(1)}%`);

/** Compact ridership: 48,500,000 -> "48.5M", 972,133 -> "972K". */
export const fmtCompact = (n: number | null): string => {
  if (n == null) return "—";
  const a = Math.abs(n);
  if (a >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`;
  if (a >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (a >= 1_000) return `${Math.round(n / 1_000)}K`;
  return nf.format(Math.round(n));
};

/**
 * Climate-resilience risk ramp: calm sky-blue (resilient) -> teal -> amber ->
 * orange -> coral (fails first). Monotonic in alarm/warmth, colorblind-legible,
 * WCAG-checked against the light basemap.
 */
export const RISK_STOPS: [number, string][] = [
  [0, "#0369a1"],
  [30, "#38bdf8"],
  [55, "#fcd34d"],
  [78, "#f97316"],
  [100, "#dc2626"],
];

function hexToRgb(h: string) {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function rgbToHex(r: number, g: number, b: number) {
  return "#" + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
}

export function riskColor(score: number): string {
  const s = Math.max(0, Math.min(100, score));
  for (let i = 1; i < RISK_STOPS.length; i++) {
    const [s0, c0] = RISK_STOPS[i - 1];
    const [s1, c1] = RISK_STOPS[i];
    if (s <= s1) {
      const t = (s - s0) / (s1 - s0);
      const a = hexToRgb(c0);
      const b = hexToRgb(c1);
      return rgbToHex(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t);
    }
  }
  return RISK_STOPS[RISK_STOPS.length - 1][1];
}

/** Station risk tier from the 0–100 composite score. */
export function tierOf(score: number): "Critical" | "High" | "Moderate" | "Lower" {
  if (score >= 80) return "Critical";
  if (score >= 60) return "High";
  if (score >= 40) return "Moderate";
  return "Lower";
}

export const TIER_META: Record<string, { color: string; blurb: string }> = {
  Critical: {
    color: "#dc2626",
    blurb: "Highest combined climate exposure, unreliability & ridership — first to strand riders. Prioritize.",
  },
  High: { color: "#f97316", blurb: "Elevated risk across exposure and service-reliability signals." },
  Moderate: { color: "#f59e0b", blurb: "Above-median risk on one or more signals — monitor." },
  Lower: { color: "#0284c7", blurb: "Lower relative risk today — more resilient service or exposure." },
};
