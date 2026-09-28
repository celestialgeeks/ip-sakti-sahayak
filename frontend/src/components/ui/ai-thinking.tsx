"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { formatDuration, type ReasoningStep } from "@/lib/reasoning";

/** Resolution of the live elapsed clock — 100ms reads as a stopwatch, 1s looks stalled. */
const TICK_MS = 100;
/** The log scrolls to the newest milestone instead of pretending to. */
const LOG_MAX_HEIGHT = "168px";

/**
 * Elapsed time anchored to the moment the query was actually sent.
 *
 * The previous block started its counter when the component mounted, so the
 * number was a property of the render, not of the request. This one is derived
 * from the send timestamp carried by the reasoning tracker, and reads `null`
 * until the first tick lands — a stopwatch that has to say "unknown" for a
 * frame is still honest, unlike one that starts from zero and lies by a second.
 */
export function useElapsedMs(anchor?: number): number | null {
  const [elapsed, setElapsed] = useState<number | null>(null);

  useEffect(() => {
    if (anchor === undefined) return;
    const id = setInterval(() => setElapsed(Math.max(0, Date.now() - anchor)), TICK_MS);
    return () => clearInterval(id);
  }, [anchor]);

  return elapsed;
}

export interface ThinkingStepRowProps {
  step: ReasoningStep;
  /** The newest milestone while the request is still in flight. */
  active?: boolean;
}

/**
 * One measured milestone.
 *
 * The duration is the gap since the previous step, so a slow stage is legible at
 * a glance instead of hiding inside an undifferentiated spinner.
 */
export function ThinkingStepRow({ step, active = false }: ThinkingStepRowProps) {
  return (
    <li className="flex items-start gap-2.5">
      <span
        aria-hidden="true"
        className={cn(
          "mt-1.5 size-1.5 shrink-0 rounded-full",
          active && "animate-ping",
        )}
        style={{
          background: active
            ? "var(--saffron)"
            : step.origin === "server"
              ? "var(--emerald)"
              : "var(--border-hairline)",
        }}
      />
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-1.5">
          <span
            className="text-[12.5px] font-medium leading-snug"
            style={{ color: "var(--ink-primary)" }}
          >
            {step.label}
          </span>
          {step.origin === "server" && (
            // Provenance badge: the backend reported this stage itself, rather
            // than the browser inferring it from a byte boundary.
            <span
              className="rounded px-1 py-px font-mono text-[9px] uppercase tracking-wide"
              style={{ background: "var(--saffron-light)", color: "var(--emerald)" }}
            >
              backend
            </span>
          )}
        </span>
        {step.detail && (
          <span
            className="block font-mono text-[11px] leading-snug"
            style={{ color: "var(--ink-muted)" }}
          >
            {step.detail}
          </span>
        )}
      </span>
      <span
        className="shrink-0 pt-0.5 font-mono text-[11px] tabular-nums"
        style={{ color: "var(--ink-muted)" }}
      >
        +{formatDuration(step.ms ?? 0)}
      </span>
    </li>
  );
}

export interface ThinkingLogProps {
  steps: ReasoningStep[];
  /** Render the last row as in-progress (only while the request is open). */
  live?: boolean;
  className?: string;
}

/**
 * The reasoning trace as a log.
 *
 * Follows the newest milestone the way a terminal does — a real scroll that
 * stops at the bottom of the content, replacing the old loop that scrolled
 * invented copy forever to look busy.
 */
export function ThinkingLog({ steps, live = false, className }: ThinkingLogProps) {
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    box.scrollTo({ top: box.scrollHeight, behavior: reduceMotion ? "auto" : "smooth" });
  }, [steps.length]);

  // Nothing measured yet, so nothing to show — an empty frame would be filler.
  if (steps.length === 0) return null;

  return (
    <Card
      className={cn(
        "rounded-xl border border-border bg-card p-3 shadow-xs",
        className,
      )}
    >
      <div
        ref={boxRef}
        aria-label="Reasoning steps"
        aria-live="polite"
        className="overflow-y-auto"
        role="log"
        style={{ maxHeight: LOG_MAX_HEIGHT }}
      >
        <ol className="space-y-2.5">
          {steps.map((step, index) => (
            <ThinkingStepRow
              key={step.id}
              step={step}
              active={live && index === steps.length - 1}
            />
          ))}
        </ol>
      </div>
    </Card>
  );
}

/**
 * The model's own planning text, when it reaches the client at all.
 *
 * Previously this was scrubbed from the answer and lost. Salvaging it is honest
 * only because it is the model's output verbatim — nothing here is generated to
 * fill the panel when the model goes straight to the answer.
 */
export function ModelThinkingBlock({ text, className }: { text: string; className?: string }) {
  return (
    <details
      className={cn(
        "rounded-xl border px-3 py-2 text-[11.5px] leading-relaxed",
        className,
      )}
      style={{ borderColor: "var(--border-hairline)", background: "var(--surface)" }}
    >
      <summary
        className="cursor-pointer font-mono text-[10px] uppercase tracking-wide"
        style={{ color: "var(--ink-muted)" }}
      >
        Model reasoning draft
      </summary>
      <p className="mt-2 whitespace-pre-wrap font-mono" style={{ color: "var(--ink-secondary)" }}>
        {text}
      </p>
    </details>
  );
}

export interface AIThinkingProps {
  className?: string;
  /** Milestones measured so far, in arrival order. */
  steps: ReasoningStep[];
  /** Timestamp of the send, so the elapsed clock reflects the request. */
  anchor?: number;
  /** Chain-of-thought text recovered from the stream, when the model emitted any. */
  modelThinking?: string;
}

/**
 * The live thinking state: what the assistant is doing while there is nothing to
 * read yet. It is rendered only for that window, and only with real milestones.
 */
export default function AIThinking({
  className,
  steps,
  anchor,
  modelThinking,
}: AIThinkingProps) {
  const elapsed = useElapsedMs(anchor);

  return (
    <div className={cn("flex max-w-xl flex-col gap-2.5", className)}>
      <div className="flex items-center gap-2">
        <Spinner aria-hidden="true" className="size-4 text-primary" />
        <span
          className="animate-pulse text-sm font-medium"
          style={{ color: "var(--ink-primary)" }}
        >
          Thinking — awaiting the first token
        </span>
        {elapsed !== null && (
          <span
            aria-label={`elapsed ${formatDuration(elapsed)}`}
            className="font-mono text-sm tabular-nums"
            style={{ color: "var(--ink-muted)" }}
          >
            {formatDuration(elapsed)}
          </span>
        )}
      </div>
      <ThinkingLog steps={steps} live />
      {modelThinking ? <ModelThinkingBlock text={modelThinking} /> : null}
    </div>
  );
}

export { AIThinking };
