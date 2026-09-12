"use client";

interface AlertCardProps {
  title: string;
  description: string;
  confidencePercent: number;
  citations: string[];
  onDownload?: () => void;
}

export function AlertCard({
  title,
  description,
  confidencePercent,
  citations,
  onDownload,
}: AlertCardProps) {
  return (
    <div
      className="card-elevated p-4"
      style={{ borderLeft: "3px solid var(--saffron)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h4 className="headline-sm" style={{ color: "var(--saffron)" }}>
          {title}
        </h4>
        <div className="flex items-center gap-1.5">
          <span className="label-sm" style={{ color: "var(--ink-muted)" }}>
            Conflict
          </span>
          <span
            className="label-lg px-2 py-0.5 rounded"
            style={{
              background: confidencePercent > 80 ? "var(--saffron-light)" : "var(--emerald-light)",
              color: confidencePercent > 80 ? "var(--saffron)" : "var(--emerald)",
            }}
          >
            {confidencePercent}%
          </span>
        </div>
      </div>

      {/* Source info */}
      <div className="flex items-center gap-2 mb-3">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--saffron)" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <span className="body-sm" style={{ color: "var(--ink-muted)" }}>
          The Patents Act, 1970 (Indian Patent Office)
        </span>
      </div>

      {/* Description */}
      <p className="body-md mb-3" style={{ color: "var(--ink-primary)" }}>
        {description}
      </p>

      {/* TKDL Citations */}
      {citations.length > 0 && (
        <div className="mb-3">
          <span className="label-sm block mb-1.5" style={{ color: "var(--ink-muted)" }}>
            TKDL PRIOR ART CITATIONS
          </span>
          {citations.map((cite, i) => (
            <div key={i} className="flex items-center gap-2 mb-1">
              <span className="w-4 h-4 rounded flex items-center justify-center"
                style={{ background: "var(--emerald-light)" }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--emerald)" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              <span className="body-sm" style={{ color: "var(--emerald)" }}>{cite}</span>
            </div>
          ))}
        </div>
      )}

      {/* Download Button */}
      {onDownload && (
        <button
          onClick={onDownload}
          className="w-full py-2.5 rounded flex items-center justify-center gap-2 font-medium text-sm transition-colors"
          style={{
            background: "var(--emerald)",
            color: "white",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
          </svg>
          Download Objection Summary (PDF)
        </button>
      )}
    </div>
  );
}
