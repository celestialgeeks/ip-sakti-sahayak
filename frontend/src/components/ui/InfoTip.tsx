"use client";

// InfoTip — the depth ladder's rung 3 & 4 carrier (spec §9).
// Rung 1: the numeral (in the KPI tile). Rung 2: always-on caption.
// Rung 3: this popover — statute + mechanism + confidence chip.
// Rung 4: "Open the source" link into /rules or /chat with the citation.
// Type floor per §9: nothing in here renders below 12px.

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";

export interface InfoTipProps {
  /** Short label for the trigger, e.g. the metric name. */
  title: string;
  /** Rung-3 body: the statute section and plain-language mechanism. */
  statute?: string;
  mechanism: string;
  /** Optional confidence chip (reuse of the mandatory-citation convention). */
  confidence?: number;
  /** Rung-4: corpus deep link. */
  sourceHref?: string;
  sourceLabel?: string;
}

export function InfoTip({ title, statute, mechanism, confidence, sourceHref, sourceLabel }: InfoTipProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative inline-flex">
      <button
        type="button"
        aria-label={`Explain ${title}`}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`w-6 h-6 rounded-full border grid place-items-center transition-colors ${
          open
            ? "bg-primary-container text-surface-container-lowest border-primary-container"
            : "border-portal-border bg-surface-container-lowest text-outline hover:text-primary hover:border-primary"
        }`}
      >
        <span className="material-symbols-outlined text-[14px]">info</span>
      </button>
      {open && (
        <div
          role="dialog"
          aria-label={`${title} — legal basis`}
          className="absolute z-40 bottom-full mb-2 left-1/2 -translate-x-1/2 w-72 rounded-lg border border-portal-border bg-surface-container-lowest shadow-lg p-3 space-y-2"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-portal-navy-deep">{title}</span>
            {typeof confidence === "number" && (
              <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-secondary-container text-on-secondary-container whitespace-nowrap">
                CI {(confidence * 100).toFixed(0)}%
              </span>
            )}
          </div>
          {statute && (
            <p className="text-xs font-semibold text-tiranga-saffron-deep leading-relaxed">{statute}</p>
          )}
          <p className="text-xs text-on-surface-variant leading-relaxed">{mechanism}</p>
          {sourceHref && (
            <Link
              href={sourceHref}
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              <span className="material-symbols-outlined text-[14px]">open_in_new</span>
              {sourceLabel ?? "Open the source"}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
