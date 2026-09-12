"use client";

import { Citation } from "@/lib/types";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  confidence?: number;
  confidenceLevel?: "high" | "medium" | "low";
  timestamp?: string;
}

export function MessageBubble({
  role,
  content,
  citations = [],
  confidence,
  confidenceLevel,
  timestamp,
}: MessageBubbleProps) {
  const isUser = role === "user";

  const confidenceIcons: Record<string, string> = {
    high: "🟢",
    medium: "🟡",
    low: "🔴",
  };

  return (
    <div className={`flex gap-3 mb-4 ${isUser ? "justify-end" : "justify-start"}`}>
      {/* Avatar */}
      {!isUser && (
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
          style={{ background: "var(--saffron-light)", border: "1px solid var(--saffron)" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
              fill="var(--saffron)" />
          </svg>
        </div>
      )}

      {/* Bubble */}
      <div
        className={`max-w-[75%] px-4 py-3 ${isUser ? "user-bubble" : "assistant-bubble"}`}
      >
        {/* Content */}
        <div className="body-md whitespace-pre-wrap" style={{ color: "var(--ink-primary)" }}>
          {content}
        </div>

        {/* Confidence Badge (assistant only) */}
        {!isUser && confidenceLevel && (
          <div className="flex items-center gap-1.5 mt-2 pt-2" style={{ borderTop: "1px solid var(--border-hairline)" }}>
            <span>{confidenceIcons[confidenceLevel]}</span>
            <span className="label-md" style={{ color: "var(--ink-muted)" }}>
              {confidenceLevel === "high" && "High confidence — grounded in primary legislation"}
              {confidenceLevel === "medium" && "Medium confidence — grounded in rules/commentary"}
              {confidenceLevel === "low" && "Low confidence — consider human expert review"}
            </span>
          </div>
        )}

        {/* Citation Badges (assistant only) */}
        {!isUser && citations.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {citations.map((cite, i) => (
              <span key={cite.id} className="badge-saffron cursor-pointer hover:opacity-80">
                [{i + 1}] {cite.source}
              </span>
            ))}
          </div>
        )}

        {/* Timestamp */}
        {timestamp && (
          <div className="mt-1">
            <span className="label-md" style={{ color: "var(--ink-muted)" }}>
              {timestamp}
            </span>
          </div>
        )}
      </div>

      {/* User Avatar */}
      {isUser && (
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 text-xs font-semibold text-white"
          style={{ background: "var(--saffron)" }}
        >
          U
        </div>
      )}
    </div>
  );
}
