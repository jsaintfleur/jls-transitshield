import { TIER_META, tierOf, fmtCompact } from "@/lib/format";
import type { TopStation } from "@/lib/types";

export function TopTracksTable({ rows }: { rows: TopStation[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-panel shadow-card">
      <table className="w-full text-sm">
        <caption className="sr-only">
          Highest climate-resilience-risk NYC subway stations with borough, risk tier, composite risk
          score, annual ridership, and climate exposure score.
        </caption>
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-ink-muted">
            <th scope="col" className="px-4 py-2.5 font-medium">Station</th>
            <th scope="col" className="px-4 py-2.5 font-medium">Risk tier</th>
            <th scope="col" className="px-4 py-2.5 text-right font-medium">Risk</th>
            <th scope="col" className="px-4 py-2.5 text-right font-medium">Annual riders</th>
            <th scope="col" className="px-4 py-2.5 text-right font-medium">Exposure</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const tier = tierOf(r.risk_score);
            return (
              <tr key={r.rank} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60">
                <td className="px-4 py-2.5">
                  <span className="font-medium text-ink">{r.station_complex}</span>
                  <span className="block text-xs text-ink-faint">{r.borough}</span>
                </td>
                <td className="px-4 py-2.5">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium"
                    style={{ background: `${TIER_META[tier].color}18`, color: TIER_META[tier].color }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: TIER_META[tier].color }} />
                    {tier}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-ink">
                  {r.risk_score.toFixed(1)}
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums text-ink-soft">
                  {fmtCompact(r.annual_ridership)}
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums text-ink-soft">
                  {r.exposure_score.toFixed(2)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
