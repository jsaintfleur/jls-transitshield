export const metadata = { title: "About — TransitShield" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 pb-8 pt-14">
      <h1 className="text-3xl font-semibold tracking-tight text-ink">About TransitShield</h1>

      <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-ink-soft">
        <p>
          Superstorm Sandy put a price on the question TransitShield answers: when the climate turns, which
          parts of the subway fail first, and how many riders does that strand? Aging infrastructure, coastal
          flood risk, and ridership are spatially mismatched — the most exposed, least reliable stations are
          not always the ones with the most riders, and hardening budgets are finite.
        </p>
        <p>
          TransitShield turns authoritative, keyless public data into a transparent, station-level
          climate-resilience risk score and a ranked, explainable list of the highest-risk stations — with
          every number traceable to its source and every limitation stated plainly.
        </p>

        <h2 className="pt-4 text-xl font-semibold tracking-tight text-ink">Who it&apos;s for</h2>
        <p>
          Transit-agency capital planners prioritizing station hardening, resilience and emergency-management
          officers, climate-adaptation and infrastructure-finance analysts, and civic-technology and
          transportation-equity researchers.
        </p>

        <h2 className="pt-4 text-xl font-semibold tracking-tight text-ink">About the author</h2>
        <p>
          TransitShield is part of a five-product data portfolio by <b>Jean-Luc Saint-Fleur</b>, spanning
          housing, financial services, healthcare, retail, and transportation &amp; climate. Each product pairs
          a real business problem, credible public data, a defensible analytical method, and an executive-ready
          interface — and is honest about what the data can and cannot support.
        </p>

        <div className="mt-6 rounded-xl border border-slate-200 bg-panel p-5 text-sm">
          <p className="font-semibold text-ink">Built with</p>
          <p className="mt-1.5 text-ink-muted">
            Next.js 15 · TypeScript · Tailwind CSS · MapLibre GL · Python (Pandas) · MTA / NY Open Data ·
            FEMA National Risk Index. Deployed on Vercel.
          </p>
        </div>
      </div>
    </div>
  );
}
