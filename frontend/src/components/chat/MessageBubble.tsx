"use client";

import { useState } from "react";
import { Citation } from "@/lib/types";
import { submitFeedback } from "@/lib/api";

interface MessageBubbleProps {
  message: {
    role: "user" | "assistant";
    content: string;
    citations?: Citation[];
    confidence?: number;
    confidenceLevel?: "high" | "medium" | "low";
    timestamp?: string;
  };
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const { role, content, citations = [], confidenceLevel, timestamp } = message;
  const isUser = role === "user";
  const [feedbackSent, setFeedbackSent] = useState(false);

  const confidenceIcons: Record<string, string> = {
    high: "🟢",
    medium: "🟡",
    low: "🔴",
  };

  const handleFeedback = async (rating: string) => {
    if (feedbackSent) return;
    try {
      await submitFeedback(Math.random().toString(36).substring(7), rating);
      setFeedbackSent(true);
    } catch (e) {
      console.error(e);
    }
  };

  const isTKDLCited = citations.some(c => 
    c.source.toLowerCase().includes("tkdl") || 
    c.source.toLowerCase().includes("3(p)") ||
    c.category.toLowerCase().includes("tkdl")
  );

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
        className={`max-w-[75%] px-4 py-3 ${isUser ? "user-bubble" : "assistant-bubble"} relative group`}
      >
        {/* Section 3(p) Alert */}
        {!isUser && isTKDLCited && (
          <div className="mb-3 p-3 rounded-md border-l-4" style={{ background: "rgba(239, 68, 68, 0.1)", borderColor: "rgb(239, 68, 68)" }}>
            <div className="flex items-center gap-2 mb-1">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgb(239, 68, 68)" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <span className="font-bold text-sm" style={{ color: "rgb(239, 68, 68)" }}>Statutory Alert: Section 3(p) / TKDL Prior Art Detected</span>
            </div>
            <p className="text-xs" style={{ color: "var(--ink-primary)" }}>This formulation intersects with documented Traditional Knowledge. Patent claims may face objection under Section 3(p) of the Patents Act, 1970. Review TKDL citations carefully.</p>
          </div>
        )}

        {/* Content or Typing Indicator */}
        <div className="body-md whitespace-pre-wrap" style={{ color: "var(--ink-primary)" }}>
          {!isUser && !content ? (
            <span className="animate-pulse">● ● ●</span>
          ) : (
            content
          )}
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
              <span key={cite.id || i} className="badge-saffron cursor-pointer hover:opacity-80">
                [{i + 1}] {cite.source}
              </span>
            ))}
          </div>
        )}

        {/* Timestamp & Feedback (assistant only) */}
        {!isUser && content && (
          <div className="mt-2 flex items-center justify-between">
            <span className="label-md" style={{ color: "var(--ink-muted)" }}>
              {timestamp || "Just now"}
            </span>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {!feedbackSent ? (
                <>
                  <button onClick={() => handleFeedback("helpful")} className="text-xs hover:scale-110 transition-transform" title="Helpful">👍</button>
                  <button onClick={() => handleFeedback("not_helpful")} className="text-xs hover:scale-110 transition-transform" title="Not helpful">👎</button>
                </>
              ) : (
                <span className="text-xs" style={{ color: "var(--emerald)" }}>Feedback recorded</span>
              )}
            </div>
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
