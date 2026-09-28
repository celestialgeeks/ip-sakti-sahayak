"use client";

import ThinkingReasoning from "@/components/ui/thinking-reasoning";
import { cn } from "@/lib/utils";
import { thinkingLines, type ReasoningRecord } from "@/lib/reasoning";

interface ReasoningTraceProps {
  /** Frozen milestones for this answer, taken from the measured stream. */
  record: ReasoningRecord;
  /** The answer is still streaming, so the panel shows the live "Thinking…" state. */
  live?: boolean;
  className?: string;
}

/**
 * The reasoning that survives the answer.
 *
 * ChatGPT collapses its trace under "Thought for Ns" and Claude puts extended
 * thinking in a block above the reply; both stay inspectable after generation
 * ends. This does the same, but shows the *model's own thinking* (salvaged
 * chain-of-thought, or a plain-language rendering of the milestones that
 * actually happened) rather than the raw pipeline log — the technical detail is
 * abstracted away, and stays collapsed once text is on screen so process never
 * buries the answer the user came for.
 */
export function ReasoningTrace({ record, live = false, className }: ReasoningTraceProps) {
  return (
    <ThinkingReasoning
      className={cn("mb-3", className)}
      label={record.summary}
      live={live}
      sentences={thinkingLines(record)}
    />
  );
}
