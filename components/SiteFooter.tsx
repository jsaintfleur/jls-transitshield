export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-[var(--chrome-border)] bg-[var(--chrome-bg)]">
      <div className="mx-auto max-w-7xl px-6 py-10 text-sm text-[var(--chrome-muted)]">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-md">
            <p className="font-semibold text-[var(--chrome-text)]">TransitShield</p>
            <p className="mt-1.5 leading-relaxed">
              A portfolio project by Jean-Luc Saint-Fleur. Climate-resilience intelligence for NYC transit
              planning and infrastructure investment, built on keyless public data.
            </p>
          </div>
          <div className="text-xs leading-relaxed">
            <p className="font-semibold uppercase tracking-wide text-[var(--chrome-text)]">Data sources</p>
            <p className="mt-1.5">
              MTA / NY Open Data (Socrata): ridership, major incidents, MDBF. FEMA National Risk Index.
              <br />All public domain, keyless. See Methodology for limits.
            </p>
          </div>
        </div>
        <p className="mt-8 border-t border-[var(--chrome-border)] pt-5 text-xs text-[var(--chrome-muted)]">
          Demonstration analytics on public data. Not operational, engineering, or emergency-management advice.
        </p>
      </div>
    </footer>
  );
}
