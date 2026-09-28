"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

/** Cadence of the line-by-line reveal (ms). Reads as "thinking", not a dump. */
const REVEAL_MS = 220;
/** The reasoning viewport grows with content up to here, then scrolls. */
const MAX_H = 180;
/** Top/bottom soft fade once the viewport is capped. */
const FADE = 16;

function subscribeMotion(cb: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
const readMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * The animated "thinking" panel.
 *
 * Replaces the raw pipeline log (first token / grounding / complete) with a
 * ChatGPT-Claude style block: a shimmering "Thinking…" while the answer is
 * being reasoned out, folding into a "Thought for Ns" summary that the reader
 * can expand to re-read the reasoning line by line. It is purely presentational
 * — every line it shows is supplied by the caller from a real source (see
 * `thinkingLines`), so the animation never fabricates thought.
 */
export interface ThinkingReasoningProps {
  /** Reasoning lines to reveal — the model's own thinking, or a rendering of the real steps. */
  sentences: string[];
  /** Collapsed summary shown once thinking is done, e.g. "Thought for 10s · 3 passages · 3 corpora". */
  label: string;
  /** Still working: shimmer the header, keep the panel open, follow the newest line. */
  live?: boolean;
  /** Start expanded once done (the live state is always expanded regardless). */
  defaultOpen?: boolean;
  className?: string;
}

export function ThinkingReasoning({
  sentences,
  label,
  live = false,
  defaultOpen = false,
  className,
}: ThinkingReasoningProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [revealed, setRevealed] = useState(0);
  const [capped, setCapped] = useState(false);
  const reduceMotion = useSyncExternalStore(subscribeMotion, readMotion, () => false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<HTMLDivElement>(null);

  // While thinking the reasoning is always open; once done it folds into the
  // summary and the reader can toggle it back open.
  const expanded = live || open;
  const total = sentences.length;
  const count = expanded ? (reduceMotion ? total : Math.min(revealed, total)) : 0;
  const shown = sentences.slice(0, count);

  // Reveal one line at a time until the whole reasoning is on screen. Reduced
  // motion shows it all at once, so the timer never runs.
  useEffect(() => {
    if (reduceMotion || !expanded || revealed >= total) return;
    const id = setTimeout(() => setRevealed((r) => Math.min(r + 1, total)), REVEAL_MS);
    return () => clearTimeout(id);
  }, [expanded, revealed, total, reduceMotion]);

  // Cap the viewport only once the content actually overflows it. The observer
  // fires on first subscribe, so no synchronous measure is needed here.
  useEffect(() => {
    const el = streamRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => setCapped(el.offsetHeight > MAX_H + 1));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Follow the newest line the way a live log should.
  useEffect(() => {
    const el = viewportRef.current;
    if (el && capped && live) el.scrollTop = el.scrollHeight;
  }, [count, capped, live]);

  const toggle = () => {
    setOpen((prev) => {
      const next = !prev;
      // Replaying the reveal on open is what makes the folded reasoning feel
      // like a thought being re-walked, rather than a wall of static text.
      if (next) {
        setRevealed(0);
        if (viewportRef.current) viewportRef.current.scrollTop = 0;
      }
      return next;
    });
  };

  const mask = capped
    ? `linear-gradient(to bottom, transparent 0, #000 ${FADE}px, #000 calc(100% - ${FADE}px), transparent 100%)`
    : "none";

  return (
    <div className={cn("trr-root", className)}>
      <button
        type="button"
        aria-expanded={expanded}
        aria-label="Toggle reasoning"
        className={cn("trr-header", !live && "trr-clickable")}
        onClick={live ? undefined : toggle}
      >
        <Sparkles
          aria-hidden="true"
          className={cn("trr-icon", live && "trr-pulse")}
          size={13}
          style={{ color: "var(--saffron, #C0392B)" }}
        />
        {live ? (
          <span className="trr-label trr-shimmer">Thinking…</span>
        ) : (
          <span className="trr-label">{label}</span>
        )}
        {!live && (
          <svg
            className="trr-chevron"
            viewBox="0 0 24 24"
            width="12"
            height="12"
            aria-hidden="true"
            style={{ transform: open ? "rotate(0deg)" : "rotate(180deg)" }}
          >
            <path
              d="m4.5 15.75 7.5-7.5 7.5 7.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      <div className={cn("trr-collapsible", !expanded && "trr-collapsed")}>
        <div className="trr-inner">
          <div
            ref={viewportRef}
            className={cn("trr-viewport", capped && "trr-scroll")}
            style={{
              maxHeight: capped ? MAX_H : undefined,
              WebkitMaskImage: mask,
              maskImage: mask,
            }}
          >
            <div ref={streamRef} className="trr-stream" aria-live="polite">
              {shown.map((line, i) => (
                <p key={i} className="trr-sentence">
                  {line}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ThinkingReasoning;
