"use client";

export function TypingIndicator() {
  return (
    <div className="flex gap-3 mb-4">
      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: "var(--saffron-light)", border: "1px solid var(--saffron)" }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
            fill="var(--saffron)" />
        </svg>
      </div>

      {/* Typing dots */}
      <div className="assistant-bubble px-4 py-3 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full animate-bounce"
          style={{ background: "var(--ink-muted)", animationDelay: "0ms" }} />
        <span className="w-2 h-2 rounded-full animate-bounce"
          style={{ background: "var(--ink-muted)", animationDelay: "150ms" }} />
        <span className="w-2 h-2 rounded-full animate-bounce"
          style={{ background: "var(--ink-muted)", animationDelay: "300ms" }} />
        <span className="label-md ml-2" style={{ color: "var(--ink-muted)" }}>
          Analyzing sources...
        </span>
      </div>
    </div>
  );
}
