"use client";

const stats = [
  {
    label: "Indexed TKDL Sheets",
    value: "4,12,000+",
    color: "var(--saffron)",
  },
  {
    label: "Patent Gazettes",
    value: "18.4M",
    color: "var(--emerald)",
  },
  {
    label: "Corpus Confidence",
    value: "99.4% Valid",
    color: "var(--saffron)",
  },
];

export function StatsBar() {
  return (
    <div className="flex items-center justify-center gap-8 mb-10 flex-wrap">
      {stats.map((stat) => (
        <div key={stat.label} className="text-center">
          <div
            className="headline-sm mb-0.5"
            style={{ color: stat.color }}
          >
            {stat.value}
          </div>
          <div className="label-md" style={{ color: "var(--ink-muted)" }}>
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}
