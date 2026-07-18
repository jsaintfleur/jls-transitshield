import { getSources, getSummary } from "@/lib/data";

export const metadata = { title: "Methodology & Data — TransitShield" };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold tracking-tight text-ink">{title}</h2>
      <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-ink-soft">{children}</div>
    </section>
  );
}

export default function MethodologyPage() {
  const meta = getSources();
  const s = getSummary();
  const m = s.method;

  return (
    <div className="mx-auto max-w-3xl px-6 pb-8 pt-14">
      <h1 className="text-3xl font-semibold tracking-tight text-ink">Methodology &amp; Data</h1>
      <p className="mt-3 text-lg leading-relaxed text-ink-soft">
        TransitShield is built to be auditable: every station score traces back to public MTA and FEMA data
        through a reproducible, keyless pipeline. This page documents the sources, the index, its central
        assumption, and its limits.
      </p>

      <Section title="Data sources">
        <p className="text-sm text-ink-muted">
          {meta.note}
        </p>
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-xs uppercase tracking-wide text-ink-muted">
                <th className="px-4 py-2.5 font-medium">Source</th>
                <th className="px-4 py-2.5 font-medium">Role</th>
                <th className="px-4 py-2.5 font-medium">License</th>
              </tr>
            </thead>
            <tbody>
              {meta.sources.map((src) => (
                <tr key={src.id} className="border-t border-slate-100 align-top">
                  <td className="px-4 py-2.5">
                    <a
                      href={src.url}
                      className="font-medium text-brand-700 underline-offset-2 hover:underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {src.name}
                    </a>
                    <span className="block text-xs text-ink-faint">
                      {src.provider} · {src.id}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-ink-soft">{src.role}</td>
                  <td className="px-4 py-2.5 text-ink-soft">{src.license}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Composite index construction">
        <p>
          The TransitShield risk score fuses three signals — consequence, fragility, and hazard — then ranks
          stations 0–100:
        </p>
        <ol className="ml-5 list-decimal space-y-2">
          <li>
            <b>Reliability index (fragility).</b> {m.reliability_index}
          </li>
          <li>
            <b>Climate exposure (hazard).</b> {m.exposure} Weights:{" "}
            {Object.entries(m.weights)
              .map(([k, v]) => `${k.replace("exposure_", "")} ${v}`)
              .join(", ")}
            .
          </li>
          <li>
            <b>Ridership (consequence).</b> Per-station {s.ridership_year} annual subway ridership — the count
            of riders a failure would strand.
          </li>
        </ol>
        <p>
          These combine as{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[13px]">{m.composite_formula}</code>.
        </p>
      </Section>

      <Section title="The line-level incident allocation assumption">
        <div className="rounded-xl border border-brand-100 bg-brand-50/60 p-4 text-brand-900/90">
          <p>{m.reliability_assumption}</p>
        </div>
        <p>
          MTA publishes major incidents by <em>line and division</em>, not by individual station. TransitShield
          therefore distributes a line&apos;s incident count uniformly across the stations that line serves
          (parsed from the station-complex name), scaled by the division&apos;s mean-distance-between-failures
          fleet factor. This is a transparent, documented approximation — not a claim of per-station incident
          geolocation.
        </p>
      </Section>

      <Section title="Limitations (read before acting)">
        <ul className="ml-5 list-disc space-y-2">
          <li>
            <b>Line-level incidents.</b> Reliability is allocated from line/division incident counts, assumed
            uniform across a line&apos;s stations; true per-station incident geolocation is proposed.
          </li>
          <li>
            <b>Borough-uniform exposure.</b> FEMA climate exposure is at county (borough) resolution, so all
            stations in a borough share one exposure value; per-station hazard modeling is proposed.
          </li>
          <li>
            <b>Ridership scope.</b> Ridership is {s.ridership_year} subway-mode only; Staten Island Railway and
            non-subway modes are out of scope, so those stations are not scored.
          </li>
          <li>
            <b>Weighting is a choice.</b> The exposure weights are a documented v1 baseline; a sensitivity
            analysis is on the roadmap.
          </li>
          <li>
            <b>Proposed enhancements, not shown as results:</b> {s.components.proposed.join("; ")}.
          </li>
        </ul>
      </Section>

      <Section title="Reproducibility">
        <p>
          The pipeline is one command —{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[13px]">npm run data</code> (
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[13px]">
            python3 scripts/build_index.py
          </code>
          ) — pulling MTA ridership, incidents, and MDBF plus the FEMA National Risk Index, computing the
          composite, and writing validated GeoJSON/JSON. A separate validator (
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[13px]">npm run validate</code>) enforces
          coordinate bounds, score ranges, and cross-file consistency. No manual steps, no hand-edited numbers.
        </p>
      </Section>
    </div>
  );
}
