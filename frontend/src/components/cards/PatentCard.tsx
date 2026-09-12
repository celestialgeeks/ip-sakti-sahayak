"use client";

interface PatentCardProps {
  patentNumber: string;
  title: string;
  ingredients: string[];
  status: string;
  queryInfo?: string;
}

export function PatentCard({ patentNumber, title, ingredients, status, queryInfo }: PatentCardProps) {
  return (
    <div className="card p-3 mb-2">
      <div className="flex items-center gap-2 mb-1">
        <span className="badge-saffron">Patent Examiner</span>
        <span className="label-md" style={{ color: "var(--ink-muted)" }}>
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      <p className="body-md mb-1" style={{ color: "var(--ink-primary)" }}>
        Check patent application <strong>{patentNumber}</strong>
      </p>
      <p className="body-sm mb-2" style={{ color: "var(--ink-muted)" }}>
        for <strong>{title}</strong>
      </p>
      {ingredients.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {ingredients.map((ing) => (
            <span key={ing} className="badge-emerald">{ing}</span>
          ))}
        </div>
      )}
      {queryInfo && (
        <p className="body-sm" style={{ color: "var(--ink-muted)" }}>
          {queryInfo}
        </p>
      )}
    </div>
  );
}
