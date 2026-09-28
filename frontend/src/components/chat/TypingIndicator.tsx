"use client";

import ThinkingReasoning from "@/components/ui/thinking-reasoning";
import { thinkingLines, type ReasoningRecord } from "@/lib/reasoning";

interface TypingIndicatorProps {
  /** Measured trace for the answer that has not started yet, if any milestones landed. */
  record?: ReasoningRecord;
}

/**
 * The state before an answer exists.
 *
 * `useChat` exposes `isThinking`, which is true only between sending the query
 * and receiving the first content chunk, and this component is the whole of that
 * window: it is removed from the tree the moment real text arrives, so it can
 * never sit next to a streaming answer. It shows the live "Thinking…" shimmer
 * and reveals whatever real reasoning has landed so far — the same panel the
 * settled answer folds into, so the two states read as one continuous thought.
 */
export function TypingIndicator({ record }: TypingIndicatorProps) {
  return (
    <div className="flex gap-3 mb-5 w-full">
      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-xs"
        style={{ background: "var(--saffron-light, #FDEBD0)", border: "1px solid var(--saffron, #C0392B)" }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
            fill="var(--saffron, #C0392B)"
          />
        </svg>
      </div>

      {/* Live reasoning trace */}
      <div className="flex-1 max-w-xl">
        <ThinkingReasoning
          live
          label="Thinking…"
          sentences={record ? thinkingLines(record) : []}
        />
      </div>
    </div>
  );
}
