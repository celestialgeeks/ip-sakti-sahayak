"use client";

export function Disclaimer() {
  return (
    <div className="flex items-center gap-1.5 px-3 py-2">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--emerald)" strokeWidth="2">
        <polyline points="20 6 9 17 4 12" />
      </svg>
      <span className="label-md" style={{ color: "var(--ink-muted)" }}>
        Verified against Ministry of Ayush & TKDL digital archives. Validate with registered patent attorneys.
      </span>
    </div>
  );
}
