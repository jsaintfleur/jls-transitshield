"use client";

export function ExportActions() {
  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={() => window.print()}
        className="ds-focus-ring inline-flex min-h-10 items-center rounded-[var(--radius-md)] bg-[var(--accent-600)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--accent-700)]"
      >
        Download hardening brief
      </button>
      <a
        href="/data/hardening-list.csv"
        download
        className="ds-focus-ring inline-flex min-h-10 items-center rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-panel)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] transition hover:bg-[var(--bg-inset)]"
      >
        Download CSV
      </a>
    </div>
  );
}
