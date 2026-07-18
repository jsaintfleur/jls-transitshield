import Link from "next/link";
import { getSummary, getStations, tierCounts } from "@/lib/data";
import { fmtCompact, fmtInt } from "@/lib/format";
import { KpiCard } from "@/components/KpiCard";
import { ArchetypeLegend } from "@/components/ArchetypeLegend";
import { TopTracksTable } from "@/components/TopTracksTable";
import { ExportActions } from "@/components/ExportActions";
import { LazyRiskMap, LazyStormScenarioPanel } from "@/components/LazyViews";
import { Badge, Callout, DataTable, FreshnessPill, SectionHeader } from "@/lib/design/primitives";

export default function OverviewPage() {
  const s = getSummary();
  const stations = getStations();
  const tiers = tierCounts(stations);
  const freshness = new Date(s.generated_utc).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const boroughs = Object.entries(s.borough_exposure)
    .map(([name, b]) => ({ name, ...b }))
    .sort((a, b) => b.exposure_score - a.exposure_score);
  const topBorough = boroughs[0];
  const planningScenario = s.storm_scenarios.find((row) => row.return_period_years === 50) ?? s.storm_scenarios[0];
  const topStation = s.hardening_list[0];

  const findings = [
    {
      finding: `${fmtInt(tiers.Critical)} stations are in the critical risk tier.`,
      implication: `These are the stations most likely to strand riders first when reliability stress and climate exposure coincide.`,
      action: "Use the hardening list to sequence floodproofing, backup power, and service continuity work.",
    },
    {
      finding: `${topStation.station_complex} is the top hardening priority.`,
      implication: `Its priority score is ${topStation.hardening_priority.toFixed(1)} with ${fmtCompact(topStation.annual_ridership)} annual riders at stake.`,
      action: "Start capital scoping with station-level asset checks and operating fallback plans.",
    },
    {
      finding: `A 50-year storm scenario puts ${fmtInt(planningScenario.stations_over_threshold)} stations over threshold.`,
      implication: `That translates to about ${fmtCompact(planningScenario.passenger_hours_at_risk)} passenger-hours at risk under the outage assumption.`,
      action: "Stress-test crew staging and shuttle plans around the stations above threshold.",
    },
    {
      finding: `${topBorough.name} has the highest borough FEMA exposure signal.`,
      implication: `Its FEMA exposure score is ${topBorough.exposure_score.toFixed(2)}, before the station-level proximity proxy differentiates local risk.`,
      action: "Treat borough exposure as the screening layer, then use station profiles for project triage.",
    },
  ];

  return (
    <main className="mx-auto max-w-7xl px-5 pb-12 sm:px-6">
      <section className="grid gap-8 pb-8 pt-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.7fr)] lg:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent-text)]">
            Transit Resilience · Climate Adaptation
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-5xl">
            Prioritize the stations most likely to strand riders in a storm.
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[var(--text-secondary)]">
            TransitShield ranks NYC subway stations by reliability, climate exposure, and rider
            consequence so capital planners can move from climate risk to a defensible hardening list.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link
              href="/methodology"
              className="ds-focus-ring rounded-[var(--radius-md)] bg-[var(--accent-600)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--accent-700)]"
            >
              Review assumptions
            </Link>
            <FreshnessPill label={freshness} />
            <Badge tone="warning">Station hazard is a modeled proxy</Badge>
          </div>
        </div>
        <aside className="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--bg-panel)] p-5 shadow-[var(--shadow-1)]">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">
            Planning lens
          </p>
          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
            This is a capital-prioritization screen. It identifies where to inspect, scope, and stage
            resilience work first; it does not claim observed station flood depth or asset condition.
          </p>
        </aside>
      </section>

      <section aria-label="Key metrics" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Stations scored"
          value={fmtInt(s.station_count)}
          sub="subway station complexes"
          hint="Station complexes with ridership, coordinates, reliability allocation, and a computable climate-resilience score."
        />
        <KpiCard
          label="Annual ridership"
          value={fmtCompact(s.total_annual_ridership)}
          sub={`${s.ridership_year} subway trips`}
          hint="Annual ridership is the consequence term: more riders affected means higher service-continuity stakes."
        />
        <KpiCard
          label="50-year storm scenario"
          value={fmtInt(planningScenario.stations_over_threshold)}
          sub={`${fmtCompact(planningScenario.passenger_hours_at_risk)} passenger-hours at risk`}
          hint="Stations where modeled hazard crosses the planning threshold under the selected return-period scenario."
        />
        <KpiCard
          label="Critical stations"
          value={fmtInt(tiers.Critical)}
          sub={`of ${fmtInt(s.station_count)} · risk ≥ 80`}
          hint="Highest risk tier based on station reliability, hazard proxy, and ridership consequence."
        />
      </section>

      <section className="mt-10">
        <SectionHeader eyebrow="Executive summary" title="What a resilience planner should do next">
          <p>Each finding ties back to a computed number on the page.</p>
        </SectionHeader>
        <div className="grid gap-4 lg:grid-cols-2">
          {findings.map((item, index) => (
            <article key={item.finding} className="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--bg-panel)] p-5 shadow-[var(--shadow-1)]">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent-600)] text-sm font-semibold text-white">
                  {index + 1}
                </span>
                <h2 className="font-semibold text-[var(--text-primary)]">{item.finding}</h2>
              </div>
              <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]"><b>Implication:</b> {item.implication}</p>
              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]"><b>Recommended action:</b> {item.action}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <SectionHeader eyebrow="Station map" title="Click a station to see why it ranks">
          <p>
            Circles are sized by ridership and colored by either composite risk or the station-level
            exposure proxy. The color ramp stays risk-oriented and colorblind-safe.
          </p>
        </SectionHeader>
        <LazyRiskMap />
        <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <ArchetypeLegend counts={tiers} />
          <Callout tone="info" title="So what?">
            Use the map to move from borough-level exposure to station-level triage. A high score should
            trigger site inspection, asset review, and continuity planning before money is committed.
          </Callout>
        </div>
      </section>

      <section className="mt-12 grid gap-6 lg:grid-cols-[minmax(320px,0.85fr)_minmax(0,1.15fr)]">
        <div className="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--bg-panel)] p-5 shadow-[var(--shadow-1)]">
          <SectionHeader eyebrow="Storm scenario" title="Translate hazard into passenger-hours at risk">
            <p>Move the slider from frequent to extreme storms and watch stations over threshold change.</p>
          </SectionHeader>
          <LazyStormScenarioPanel scenarios={s.storm_scenarios} />
        </div>
        <div>
          <SectionHeader eyebrow="Hardening list" title="Ranked stations for capital triage">
            <p>Sorted by hardening priority: composite risk, station hazard proxy, and annual ridership.</p>
          </SectionHeader>
          <TopTracksTable rows={s.hardening_list.slice(0, 15)} />
        </div>
      </section>

      <section className="mt-12 grid gap-6 lg:grid-cols-2">
        <div className="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--bg-panel)] p-5 shadow-[var(--shadow-1)]">
          <SectionHeader eyebrow="Exposure context" title="Borough signal, station proxy">
            <p>FEMA is county-level; station proximity creates local differentiation for triage.</p>
          </SectionHeader>
          <DataTable
            caption="Borough FEMA exposure scores."
            columns={["Borough", "FEMA exposure", "Coastal flood", "Hurricane", "Social vulnerability"]}
            rows={boroughs.map((b) => [
              b.name,
              b.exposure_score.toFixed(2),
              b.coastal_flood_risk.toFixed(1),
              b.hurricane_risk.toFixed(1),
              b.social_vulnerability.toFixed(1),
            ])}
          />
        </div>
        <div className="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--bg-panel)] p-5 shadow-[var(--shadow-1)]">
          <SectionHeader eyebrow="How to use this" title="For capital planners and resilience officers">
            <p>Use TransitShield as a screening tool, then validate through field engineering.</p>
          </SectionHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h3 className="font-semibold text-[var(--text-primary)]">Transit capital planner</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                Start with the hardening list, bundle nearby stations, and compare scope against
                existing power, pump, and floodproofing programs.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-[var(--text-primary)]">Resilience officer</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                Use the storm scenario to stress-test continuity plans, staffing, bus bridges, and
                communications for the stations over threshold.
              </p>
            </div>
          </div>
          <div className="mt-5">
            <ExportActions />
          </div>
        </div>
      </section>

      <section className="mt-12 rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--bg-inset)] p-6">
        <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">
          Computed vs. proposed
        </h2>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-[var(--text-secondary)]">
          Computed: ridership, line-allocated reliability, FEMA borough exposure, station hazard proxy,
          composite risk, storm scenarios, and the hardening list. Proposed: observed station-level
          flood-depth/elevation modeling, outage propagation, and asset-level capital-cost estimates.
          No station-level flood depths are fabricated.
        </p>
      </section>
    </main>
  );
}
