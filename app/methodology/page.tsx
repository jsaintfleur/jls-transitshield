import { getSources, getSummary } from "@/lib/data";
import { DataTable, SectionHeader } from "@/lib/design/primitives";

export const metadata = { title: "Methodology & Data — TransitShield" };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">{title}</h2>
      <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-[var(--text-secondary)]">{children}</div>
    </section>
  );
}

export default function MethodologyPage() {
  const meta = getSources();
  const s = getSummary();
  const m = s.method;

  return (
    <main className="mx-auto max-w-4xl px-5 pb-10 pt-12 sm:px-6">
      <SectionHeader eyebrow="Methodology & data" title="A screening model for capital triage">
        <p>
          TransitShield is designed to help planners decide where to inspect and scope resilience
          work first. Every number is computed from public MTA/FEMA data or clearly labeled as a
          modeled proxy.
        </p>
      </SectionHeader>

      <Section title="Data sources">
        <p className="text-sm">{meta.note}</p>
        <DataTable
          caption="TransitShield public data sources."
          columns={["Source", "Role", "License"]}
          rows={meta.sources.map((src) => [
            `${src.name} (${src.provider})`,
            src.role,
            src.license,
          ])}
        />
      </Section>

      <Section title="Composite score">
        <p>
          The score combines three planning questions: how fragile is service, how exposed is the
          location, and how many riders would be affected. The formula is{" "}
          <code className="rounded bg-[var(--bg-inset)] px-1.5 py-0.5 text-[13px]">{m.composite_formula}</code>.
        </p>
        <ul className="ml-5 list-disc space-y-2">
          <li><b>Reliability:</b> {m.reliability_index}</li>
          <li><b>Exposure:</b> {m.exposure}</li>
          <li><b>Station hazard proxy:</b> {m.station_hazard_proxy}</li>
          <li><b>Consequence:</b> {s.ridership_year} station ridership, transformed as log riders.</li>
        </ul>
      </Section>

      <Section title="Storm scenario">
        <p>{m.storm_scenario}</p>
        <p>
          The slider is meant for resilience planning conversations: it estimates how many stations
          cross a hazard threshold and the passenger-hours that would be exposed under an assumed
          outage duration. It is not a storm-surge forecast and does not replace engineering review.
        </p>
      </Section>

      <Section title="Uncertainty and limits">
        <ul className="ml-5 list-disc space-y-2">
          <li><b>Reliability allocation:</b> {m.reliability_assumption}</li>
          <li>
            <b>Hazard proxy:</b> Station differentiation comes from coordinates and proximity to
            coastal/transit-waterway corridors layered onto FEMA county risk. It is not observed
            station flood depth or elevation.
          </li>
          <li>
            <b>Freshness:</b> ridership year {s.freshness.ridership_year}; incidents window{" "}
            {s.freshness.incidents_window}; FEMA resolution {s.freshness.fema_nri_resolution}.
          </li>
          <li><b>Proposed, not computed:</b> {s.components.proposed.join("; ")}.</li>
        </ul>
      </Section>

      <Section title="Reproducibility">
        <p>
          Run{" "}
          <code className="rounded bg-[var(--bg-inset)] px-1.5 py-0.5 text-[13px]">npm run data</code>{" "}
          to regenerate station GeoJSON, summary metrics, storm scenarios, and the hardening-list CSV.
          Run{" "}
          <code className="rounded bg-[var(--bg-inset)] px-1.5 py-0.5 text-[13px]">npm run validate</code>{" "}
          to verify geometry, score ranges, scenarios, exports, and public copies.
        </p>
      </Section>
    </main>
  );
}
