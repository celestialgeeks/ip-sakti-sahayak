"use client";

/**
 * Circular progress ring used in the wizard visualizer and sidebar rail.
 * State is always paired with a text label elsewhere (never color-only).
 */
export function ProgressRing({
  percent,
  size = 56,
  stroke = 6,
  track = "rgba(148,163,184,0.25)",
  color = "#138808",
  label,
}: {
  percent: number;
  size?: number;
  stroke?: number;
  track?: string;
  color?: string;
  label?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, percent));
  const offset = c - (clamped / 100) * c;

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
      role="img"
      aria-label={label ?? `${clamped}% complete`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 400ms ease" }}
        />
      </svg>
      <span
        className="absolute font-bold tabular-nums"
        style={{ fontSize: size * 0.26, color }}
      >
        {clamped}%
      </span>
    </div>
  );
}
