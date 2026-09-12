"use client";

interface ConfidenceIndicatorProps {
  level: "high" | "medium" | "low";
  score?: number;
  showLabel?: boolean;
}

const config = {
  high: { emoji: "🟢", color: "var(--emerald)", label: "High Confidence", bg: "var(--emerald-light)" },
  medium: { emoji: "🟡", color: "#B7791F", label: "Medium Confidence", bg: "rgba(183, 121, 31, 0.08)" },
  low: { emoji: "🔴", color: "var(--saffron)", label: "Low Confidence", bg: "var(--saffron-light)" },
};

export function ConfidenceIndicator({ level, score, showLabel = true }: ConfidenceIndicatorProps) {
  const c = config[level];

  return (
    <div
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded"
      style={{ background: c.bg }}
    >
      <span>{c.emoji}</span>
      {showLabel && (
        <span className="label-md" style={{ color: c.color }}>
          {c.label}
        </span>
      )}
      {score !== undefined && (
        <span className="label-md" style={{ color: c.color }}>
          {Math.round(score * 100)}%
        </span>
      )}
    </div>
  );
}
