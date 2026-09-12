"use client";

interface CitationCardProps {
  index: number;
  source: string;
  text: string;
  category: string;
  jurisdiction: string;
  url?: string;
}

export function CitationCard({ index, source, text, category, jurisdiction }: CitationCardProps) {
  return (
    <div className="card p-3">
      <div className="flex items-start gap-2 mb-2">
        <span className="badge-saffron flex-shrink-0">{index}</span>
        <div>
          <span className="label-lg block" style={{ color: "var(--ink-primary)" }}>
            {source}
          </span>
          <span className="label-md" style={{ color: "var(--ink-muted)" }}>
            {jurisdiction === "india" ? "🇮🇳 India" : "🌐 International"}
          </span>
        </div>
      </div>
      <p className="body-sm mb-2" style={{ color: "var(--ink-muted)" }}>
        {text}
      </p>
      <span className="badge-emerald">{category}</span>
    </div>
  );
}
