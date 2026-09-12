"use client";

interface QuerySuggestionProps {
  icon: string;
  color: "saffron" | "emerald";
  title: string;
  description: string;
  tags: string[];
  onClick?: () => void;
}

export function QuerySuggestion({
  icon,
  color,
  title,
  description,
  tags,
  onClick,
}: QuerySuggestionProps) {
  const colorVar = color === "saffron" ? "var(--saffron)" : "var(--emerald)";
  const bgVar = color === "saffron" ? "var(--saffron-light)" : "var(--emerald-light)";

  return (
    <button
      onClick={onClick}
      className="card p-4 text-left w-full hover:shadow-md transition-shadow cursor-pointer group"
      style={{ borderColor: "var(--border-hairline)" }}
    >
      {/* Icon + Title Row */}
      <div className="flex items-start gap-2 mb-2">
        <span
          className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0 text-sm"
          style={{ background: bgVar, color: colorVar }}
        >
          {icon}
        </span>
        <span className="label-lg group-hover:underline" style={{ color: colorVar }}>
          {title}
        </span>
      </div>

      {/* Description */}
      <p className="body-sm mb-3" style={{ color: "var(--ink-muted)" }}>
        {description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span
            key={tag}
            className="px-2 py-0.5 rounded text-xs"
            style={{
              background: bgVar,
              color: colorVar,
              fontWeight: 500,
            }}
          >
            {tag}
          </span>
        ))}
      </div>
    </button>
  );
}
