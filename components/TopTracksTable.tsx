import { TIER_META, tierOf, fmtCompact } from "@/lib/format";
import type { TopStation } from "@/lib/types";

export function TopTracksTable({ rows }: { rows: TopStation[] }) {
  return (
    <div tabIndex={0} className="ds-focus-ring overflow-x-auto rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--bg-panel)] shadow-[var(--shadow-1)]">
      <table className="w-full text-sm">
        <caption className="sr-only">
          Highest climate-resilience-risk NYC subway stations with borough, risk tier, composite risk
          score, annual ridership, and climate exposure score.
        </caption>
        <thead>
          <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-inset)] text-left text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
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
              <tr key={r.rank} className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--bg-inset)]">
                <td className="px-4 py-2.5">
                  <span className="font-medium text-[var(--text-primary)]">{r.station_complex}</span>
                  <span className="block text-xs text-[var(--text-tertiary)]">{r.borough}</span>
                </td>
                <td className="px-4 py-2.5">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-default)] bg-[var(--bg-inset)] px-2 py-0.5 text-xs font-medium text-[var(--text-primary)]"
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: TIER_META[tier].color }} />
                    {tier}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-[var(--text-primary)]">
                  {r.risk_score.toFixed(1)}
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums text-[var(--text-secondary)]">
                  {fmtCompact(r.annual_ridership)}
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums text-[var(--text-secondary)]">
                  {r.station_hazard_score.toFixed(2)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
