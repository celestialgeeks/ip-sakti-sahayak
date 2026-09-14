"use client";

import { useState } from "react";
import { Citation, ConfidenceLevel } from "@/lib/types";
import { submitFeedback } from "@/lib/api";

interface MessageBubbleProps {
  message: {
    role: "user" | "assistant";
    content: string;
    citations?: Citation[];
    confidence?: number;
    confidenceLevel?: ConfidenceLevel;
    timestamp?: string;
    statutoryAlert?: { title: string; description: string } | null;
  };
}

/**
 * Lightweight, robust Markdown renderer for legal intelligence formatting.
 * Handles headings, bolding, bullet points, numbered lists, and quotes seamlessly.
 */
function MarkdownContent({ content }: { content: string }) {
  // Split content into blocks by double newlines
  const blocks = content.split(/\n\n+/);

  return (
    <div className="space-y-3 text-sm leading-relaxed" style={{ color: "var(--ink-primary)" }}>
      {blocks.map((block, idx) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        // Headings (### or ##)
        if (trimmed.startsWith("### ")) {
          return (
            <h4 key={idx} className="font-bold text-base mt-3 mb-1 tracking-tight" style={{ color: "var(--ink-primary)" }}>
              {renderInline(trimmed.slice(4))}
            </h4>
          );
        }
        if (trimmed.startsWith("## ")) {
          return (
            <h3 key={idx} className="font-bold text-lg mt-4 mb-1.5 tracking-tight border-b pb-1" style={{ borderColor: "var(--border-hairline)", color: "var(--ink-primary)" }}>
              {renderInline(trimmed.slice(3))}
            </h3>
          );
        }

        // Blockquote / Statutory Notice
        if (trimmed.startsWith("> ")) {
          return (
            <blockquote key={idx} className="pl-3 border-l-2 my-2 italic text-xs leading-relaxed" style={{ borderColor: "var(--saffron)", color: "var(--ink-secondary)" }}>
              {renderInline(trimmed.slice(2))}
            </blockquote>
          );
        }

        // Bullet list
        if (trimmed.split("\n").every(line => line.trim().startsWith("- ") || line.trim().startsWith("* "))) {
          const items = trimmed.split("\n").map(l => l.trim().replace(/^[-*]\s+/, ""));
          return (
            <ul key={idx} className="list-disc pl-5 space-y-1.5 my-1.5">
              {items.map((item, i) => (
                <li key={i}>{renderInline(item)}</li>
              ))}
            </ul>
          );
        }

        // Numbered list
        if (trimmed.split("\n").every(line => /^\d+\.\s+/.test(line.trim()))) {
          const items = trimmed.split("\n").map(l => l.trim().replace(/^\d+\.\s+/, ""));
          return (
            <ol key={idx} className="list-decimal pl-5 space-y-1.5 my-1.5">
              {items.map((item, i) => (
                <li key={i}>{renderInline(item)}</li>
              ))}
            </ol>
          );
        }

        // Standard paragraph
        return (
          <p key={idx} className="whitespace-pre-line">
            {renderInline(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

/**
 * Formats inline bold (**text**), inline code (`code`), and citation markers ([Source])
 */
function renderInline(text: string) {
  // Split on bold markers **...**
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);

  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold" style={{ color: "var(--ink-primary)" }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={i} className="px-1.5 py-0.5 rounded text-xs font-mono" style={{ background: "rgba(0,0,0,0.06)" }}>
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

function cleanDisplayContent(text: string): string {
  if (!text) return "";
  return text
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/^Here's a thinking process:[\s\S]*?(?=\n\n(?:###|[A-Z]|\d+\.\s+\*\*)|$)/i, "")
    .replace(/^\s*1\.\s+\*\*Analyze User Request:\*\*[\s\S]*?(?=\n\n(?:###|[A-Z])|$)/i, "")
    .trimStart();
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const { role, content, citations = [], confidenceLevel, timestamp, statutoryAlert } = message;
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

  const sanitizedContent = isUser ? content : cleanDisplayContent(content);

  return (
    <div className={`flex gap-3 mb-5 ${isUser ? "justify-end" : "justify-start"}`}>
      {/* Assistant Avatar */}
      {!isUser && (
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-xs"
          style={{ background: "var(--saffron-light)", border: "1px solid var(--saffron)" }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
              fill="var(--saffron)" />
          </svg>
        </div>
      )}

      {/* Bubble Container */}
      <div
        className={`max-w-[85%] sm:max-w-[80%] px-5 py-4 ${isUser ? "user-bubble" : "assistant-bubble"} relative group shadow-xs`}
        style={{
          borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
        }}
      >
        {/* Section 3(p) Statutory Alert — Triggered ONLY on real legal detection */}
        {!isUser && statutoryAlert && (
          <div
            className="mb-3.5 p-3.5 rounded-lg border-l-4 transition-all shadow-xs"
            style={{
              background: "rgba(239, 68, 68, 0.08)",
              borderColor: "rgb(239, 68, 68)",
              borderTop: "1px solid rgba(239, 68, 68, 0.2)",
              borderRight: "1px solid rgba(239, 68, 68, 0.2)",
              borderBottom: "1px solid rgba(239, 68, 68, 0.2)",
            }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgb(239, 68, 68)" strokeWidth="2.2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <span className="font-bold text-sm tracking-tight" style={{ color: "rgb(239, 68, 68)" }}>
                {statutoryAlert.title || "Statutory Alert: Section 3(p) / TKDL Prior Art Detected"}
              </span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: "var(--ink-primary)" }}>
              {statutoryAlert.description || "This formulation intersects with documented Traditional Knowledge. Patent claims may face objection under Section 3(p) of the Patents Act, 1970."}
            </p>
          </div>
        )}

        {/* Content Body with Rich Markdown */}
        <div>
          {!isUser && !sanitizedContent ? (
            <div className="flex items-center gap-1.5 py-1 text-xs" style={{ color: "var(--ink-muted)" }}>
              <span className="w-2 h-2 rounded-full animate-ping" style={{ background: "var(--saffron)" }}></span>
              <span>Analyzing statutory databases & prior-art records...</span>
            </div>
          ) : isUser ? (
            <div className="body-md whitespace-pre-wrap">{content}</div>
          ) : (
            <MarkdownContent content={sanitizedContent} />
          )}
        </div>

        {/* Confidence Badge (assistant only) */}
        {!isUser && confidenceLevel && (
          <div className="flex items-center gap-1.5 mt-3 pt-2.5" style={{ borderTop: "1px solid var(--border-hairline)" }}>
            <span className="text-xs">{confidenceIcons[confidenceLevel]}</span>
            <span className="text-[11px] font-medium" style={{ color: "var(--ink-muted)" }}>
              {confidenceLevel === "high" && "High confidence — grounded in primary legislation"}
              {confidenceLevel === "medium" && "Medium confidence — grounded in rules/commentary"}
              {confidenceLevel === "low" && "Low confidence — consider human expert review"}
            </span>
          </div>
        )}

        {/* Referenced Primary Sources as Compact Interactive Pill Hyperlinks */}
        {!isUser && citations.length > 0 && (
          <div className="mt-3 pt-2.5 flex flex-col gap-1.5" style={{ borderTop: "1px solid var(--border-hairline)" }}>
            <span className="text-[10px] font-bold tracking-wider uppercase" style={{ color: "var(--ink-muted)" }}>
              Referenced Primary Documents
            </span>
            <div className="flex flex-wrap gap-1.5">
              {citations.map((cite, i) => {
                const targetUrl = cite.url || "https://ipindia.gov.in";
                return (
                  <a
                    key={cite.id || i}
                    href={targetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all hover:scale-[1.02] hover:shadow-xs group/pill"
                    style={{
                      background: "rgba(217, 119, 6, 0.08)",
                      border: "1px solid rgba(217, 119, 6, 0.28)",
                      color: "var(--ink-primary)",
                      textDecoration: "none",
                    }}
                    title={`Open ${cite.source} on the internet`}
                  >
                    <span className="truncate max-w-[260px]">{cite.source}</span>
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="shrink-0 opacity-60 group-hover/pill:opacity-100 group-hover/pill:translate-x-0.5 transition-all"
                    >
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                      <polyline points="15 3 21 3 21 9"></polyline>
                      <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* Timestamp & Feedback (assistant only) */}
        {!isUser && sanitizedContent && (
          <div className="mt-2.5 flex items-center justify-between">
            <span className="text-[10px]" style={{ color: "var(--ink-muted)" }}>
              {timestamp || "Just now"}
            </span>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {!feedbackSent ? (
                <>
                  <button onClick={() => handleFeedback("helpful")} className="text-xs hover:scale-110 transition-transform" title="Helpful">👍</button>
                  <button onClick={() => handleFeedback("not_helpful")} className="text-xs hover:scale-110 transition-transform" title="Not helpful">👎</button>
                </>
              ) : (
                <span className="text-[11px]" style={{ color: "var(--emerald)" }}>Feedback recorded</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* User Avatar */}
      {isUser && (
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 text-xs font-semibold text-white shadow-xs"
          style={{ background: "var(--saffron)" }}
        >
          U
        </div>
      )}
    </div>
  );
}
