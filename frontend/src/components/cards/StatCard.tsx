"use client";

interface StatCardProps {
  label: string;
  value: string;
  color?: string;
}

export function StatCard({ label, value, color = "var(--saffron)" }: StatCardProps) {
  return (
    <div className="text-center px-4">
      <div className="headline-sm" style={{ color }}>{value}</div>
      <div className="label-md" style={{ color: "var(--ink-muted)" }}>{label}</div>
    </div>
  );
}
