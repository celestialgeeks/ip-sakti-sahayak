"use client";

import { useState } from "react";
import { Message } from "@/lib/types";
import AISources from "@/components/ui/ai-sources";
import { MessageActions } from "./MessageActions";
import { ReasoningTrace } from "./ReasoningTrace";
import { BookOpen, Leaf, Scale } from "lucide-react";

interface MessageBubbleProps {
  /**
   * The turn to render. The assistant shape carries the measured reasoning trace,
   * so a finished answer keeps its log for later review instead of losing it.
   */
  message: Message;
  /** This bubble is the one currently being streamed. */
  live?: boolean;
  /**
   * A request is in flight somewhere in the thread. Locks the action row: the
   * stream writes into the last turn, so a retry started beside it would land in
   * someone else's answer.
   */
  busy?: boolean;
  /**
   * Re-run the question behind this answer. Absent when there is nothing to re-run
   * (a restored session whose question is no longer in memory, or the user's own
   * turn), and the Retry control hides rather than sits inert.
   */
  onRetry?: () => void;
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

export function MessageBubble({
  message,
  live = false,
  busy = false,
  onRetry,
}: MessageBubbleProps) {
  const { role, content, citations = [], timestamp, statutoryAlert, reasoning } = message;
  const isUser = role === "user";

  // The key the rating is filed under. Rows restored from Supabase carry their
  // own created_at; a streamed turn carries the timestamp it was minted with.
  // Fixed for the life of this bubble, so every action on an answer reports
  // against the same record instead of a fresh name per click.
  const [messageId] = useState(
    () => `msg-${timestamp || (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Date.now())}`,
  );

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
        className={`${
          isUser 
            ? "max-w-[85%] sm:max-w-[75%] px-4 py-3 user-bubble shadow-sm" 
            : "w-full flex-1 px-5 sm:px-6 py-5 assistant-bubble shadow-xs border border-slate-200/70"
        } relative transition-all`}
        style={{
          borderRadius: isUser ? "20px 20px 4px 20px" : "16px",
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

        {/* Reasoning trace: measured milestones, kept above the answer for review */}
        {!isUser && sanitizedContent && reasoning && reasoning.steps.length > 0 && (
          <ReasoningTrace live={live} record={reasoning} />
        )}

        {/* Content Body with Rich Markdown */}
        <div>
          {isUser ? (
            <div className="body-md whitespace-pre-wrap">{content}</div>
          ) : sanitizedContent ? (
            <MarkdownContent content={sanitizedContent} />
          ) : null}
        </div>

        {/* No confidence badge here by design. `confidenceLevel` still arrives on
            the metadata and stays on the message — it is the pipeline's own
            measure of how well the answer is grounded, and it belongs to the
            decision of whether to answer at all, not to the answer's chrome.
            Grading a legal opinion 🟢/🟡/🔴 invites the reader to trust the
            colour instead of checking the sources below it. */}

        {/* Referenced Primary Sources animated with AISources */}
        {!isUser && citations.length > 0 && (
          <div className="mt-3 pt-2.5" style={{ borderTop: "1px solid var(--border-hairline)" }}>
            <AISources
              defaultOpen={true}
              label="Referenced Primary Documents"
              sources={citations.map((cite, i) => {
                const targetUrl = cite.url || "https://ipindia.gov.in";
                const cat = (cite.category || "").toLowerCase();
                const isClassical = cat.includes("tkdl") || cat.includes("classical") || cat.includes("samhita");
                const isBio = cat.includes("bio") || cat.includes("botanical");
                return {
                  id: cite.id || `cite-${i}`,
                  title: cite.source,
                  snippet: cite.text || cite.category,
                  url: targetUrl,
                  favicon: (
                    <span className="flex size-full items-center justify-center p-0.5">
                      {isClassical ? (
                        <BookOpen className="size-full text-amber-700" />
                      ) : isBio ? (
                        <Leaf className="size-full text-emerald-700" />
                      ) : (
                        <Scale className="size-full text-[#00263f]" />
                      )}
                    </span>
                  ),
                };
              })}
            />
          </div>
        )}

        {/* Actions (assistant only). The turn's own clock used to sit on this
            line — first as a raw ISO instant, then formatted — and it has been
            dropped rather than restyled: a transcript reads the answer, not the
            minute it landed. Left-aligned with the text it acts on, the way the
            sources above it are. */}
        {!isUser && sanitizedContent && (
          <div className="mt-2.5">
            <MessageActions
              content={sanitizedContent}
              disabled={busy || live}
              messageId={messageId}
              onRetry={onRetry}
            />
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
