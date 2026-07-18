import { SectionHeader } from "@/lib/design/primitives";

export const metadata = { title: "About — TransitShield" };

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-4xl px-5 pb-10 pt-12 sm:px-6">
      <SectionHeader eyebrow="About TransitShield" title="From climate exposure to a defensible station hardening list">
        <p>
          TransitShield helps capital planners and resilience officers translate public climate,
          reliability, and ridership data into a practical first-pass priority list.
        </p>
      </SectionHeader>

      <div className="space-y-5 text-[15px] leading-relaxed text-[var(--text-secondary)]">
        <p>
          The product answers a concrete operating question: which subway stations should be inspected,
          scoped, and hardened first because failure would combine climate exposure, service fragility,
          and rider consequence? It keeps assumptions visible, especially the station hazard proxy.
        </p>
        <p>
          TransitShield does not claim to be an engineering flood model. It is a business-facing
          triage layer that helps teams focus scarce planning time before commissioning asset-level
          studies, field surveys, and capital estimates.
        </p>

        <section className="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--bg-panel)] p-5 shadow-[var(--shadow-1)]">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">Who it is for</h2>
          <p className="mt-3">
            Transit-agency capital planners, resilience officers, emergency-management teams,
            infrastructure-finance analysts, and civic researchers evaluating service-continuity risk.
          </p>
        </section>

        <section className="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--bg-panel)] p-5 shadow-[var(--shadow-1)]">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">About the author</h2>
          <p className="mt-3">
            TransitShield is part of a five-product data portfolio by <b>Jean-Luc Saint-Fleur</b>,
            spanning housing, financial services, healthcare, retail, and transportation. Each product
            pairs a real business problem, credible public data, defensible analytics, and an
            executive-ready interface.
          </p>
        </section>

        <section className="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--bg-panel)] p-5 shadow-[var(--shadow-1)]">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">Built with</h2>
          <p className="mt-3">
            Next.js 15, TypeScript, Tailwind CSS, MapLibre GL, Recharts, Python, MTA / NY Open Data,
            and FEMA National Risk Index public data. Deployed on Vercel.
          </p>
        </section>
      </div>
    </main>
  );
}
