import { getSummary, getStations, tierCounts } from "@/lib/data";
import { fmtInt, fmtCompact, riskColor } from "@/lib/format";
import { KpiCard } from "@/components/KpiCard";
import { RiskMap } from "@/components/RiskMap";
import { ArchetypeLegend } from "@/components/ArchetypeLegend";
import { TopTracksTable } from "@/components/TopTracksTable";
import Link from "next/link";

export default function OverviewPage() {
  const s = getSummary();
  const stations = getStations();
  const tiers = tierCounts(stations);

  const freshness = new Date(s.generated_utc).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Highest-exposure borough, derived from the FEMA exposure scores in the summary.
  const boroughs = Object.entries(s.borough_exposure)
    .map(([name, b]) => ({ name, ...b }))
    .sort((a, b) => b.exposure_score - a.exposure_score);
  const topBorough = boroughs[0];
  const maxExp = boroughs[0].exposure_score;

  return (
    <div className="mx-auto max-w-7xl px-6">
      <section className="pt-14 pb-10">
        <p className="text-sm font-semibold uppercase tracking-wider text-[var(--accent-text)]">
          Transit Resilience · Climate Adaptation
        </p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
          Which stations fail first when the climate turns — and who gets stranded.
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-soft">
          TransitShield scores every NYC subway station on climate-resilience risk — fusing service
          reliability, FEMA climate exposure, and the ridership at stake into one transparent index, so
          hardening dollars reach the stations whose failure would strand the most riders.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
          <Link
            href="/methodology"
            className="rounded-lg bg-brand-700 px-4 py-2 font-medium text-white transition-colors hover:bg-brand-800"
          >
            How the index works
          </Link>
          <span className="inline-flex items-center gap-1.5 text-ink-muted">
            <span className="h-2 w-2 rounded-full bg-[var(--accent-badge-bg)]0" />
            {s.ridership_year} ridership · scored {freshness}
          </span>
        </div>
      </section>

      <section aria-label="Key metrics" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Stations scored"
          value={fmtInt(s.station_count)}
          sub="subway station complexes"
          hint="Subway station complexes with a computable TransitShield risk score."
        />
        <KpiCard
          label="Annual ridership"
          value={fmtCompact(s.total_annual_ridership)}
          sub={`${s.ridership_year} subway trips`}
          hint={`Total ${s.ridership_year} subway ridership across all scored stations: ${fmtInt(
            s.total_annual_ridership,
          )}.`}
        />
        <KpiCard
          label="Highest-exposure borough"
          value={topBorough.name}
          sub={`FEMA exposure ${topBorough.exposure_score.toFixed(2)}`}
          hint="Borough with the highest FEMA National Risk Index climate-exposure score (coastal flood + hurricane + composite)."
        />
        <KpiCard
          label="Critical-risk stations"
          value={fmtInt(tiers.Critical)}
          sub={`of ${fmtInt(s.station_count)} · score ≥ 80`}
          hint="Stations in the highest risk tier — first to strand riders when climate stress hits."
        />
      </section>

      <section className="mt-12">
        <div className="mb-4">
          <h2 className="text-xl font-semibold tracking-tight text-ink">Station risk map</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Each dot is a station — sized by annual ridership, colored by risk. Toggle between the composite
            risk score and raw climate exposure; hover any station for detail.
          </p>
        </div>
        <RiskMap />
        <div className="mt-6">
          <ArchetypeLegend counts={tiers} />
        </div>
      </section>

      <section className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <div className="rounded-xl border border-slate-200 bg-panel p-6 shadow-card">
          <h2 className="text-lg font-semibold tracking-tight text-ink">Borough climate exposure</h2>
          <p className="mt-1 text-sm text-ink-muted">
            FEMA National Risk Index exposure score (0–1), higher = more exposed.
          </p>
          <div className="mt-5 space-y-3">
            {boroughs.map((b) => (
              <div key={b.name} className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-sm font-medium text-ink-soft">{b.name}</span>
                <div className="h-6 flex-1 overflow-hidden rounded bg-slate-100">
                  <div
                    className="flex h-full items-center justify-end rounded pr-2 text-xs font-medium text-white"
                    style={{
                      width: `${(b.exposure_score / maxExp) * 100}%`,
                      background: riskColor(b.exposure_score * 100),
                    }}
                  >
                    {b.exposure_score.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs leading-relaxed text-ink-faint">
            Exposure is borough-uniform (FEMA county resolution). Per-station hazard is a proposed
            enhancement — see Methodology.
          </p>
        </div>

        <div>
          <h2 className="mb-4 text-lg font-semibold tracking-tight text-ink">Highest-risk stations</h2>
          <TopTracksTable rows={s.top_risk_stations} />
        </div>
      </section>

      <section className="mt-12 rounded-xl border border-[var(--accent-border)] bg-[var(--accent-badge-bg)] p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--accent-text)]">
          What is computed vs. proposed
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[var(--accent-text)]">
          Every number here is computed from keyless public data — MTA ridership &amp; incidents and the FEMA
          National Risk Index. This v1 index blends three signals: line-allocated station reliability, borough
          climate exposure, and log ridership. The full TransitShield vision adds{" "}
          {s.components.proposed.join(", ")} — labeled as planned enhancements, not shown here as results.
        </p>
      </section>
    </div>
  );
}
