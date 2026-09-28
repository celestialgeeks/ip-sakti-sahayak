"use client";

// Add-herb drawer (spec §5.1) — Cmd-K searchable, grouped by BotanicalCategory.
// Replaces the bare <select> that used to live at the bottom of the matrix.

import React, { useEffect, useMemo, useRef, useState } from "react";
import { BotanicalItem } from "@/lib/formulation/types";

const CATEGORY_LABELS: Record<string, string> = {
  adaptogen: "Adaptogens (Balya)",
  anti_inflammatory: "Anti-inflammatory (Vedana-nashak)",
  medhya: "Medhya (Cognitive)",
  bio_enhancer: "Yogavāhī (Bio-enhancers)",
  carrier: "Anupana (Carriers)",
  digestive: "Digestive / Deepana",
  mineral_resin: "Mineral & Resin (Bhasma-grade)",
};

const CATEGORY_ORDER = ["adaptogen", "anti_inflammatory", "medhya", "bio_enhancer", "carrier", "digestive", "mineral_resin"];

interface HerbDrawerProps {
  open: boolean;
  onClose: () => void;
  herbs: BotanicalItem[];
  existingIds: Set<string>;
  onAdd: (herbId: string, defaultRatio: number) => void;
}

export function HerbDrawer({ open, onClose, herbs, existingIds, onAdd }: HerbDrawerProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return herbs.filter(
      (h) =>
        !q ||
        h.common_name.toLowerCase().includes(q) ||
        h.botanical_name.toLowerCase().includes(q) ||
        h.sanskrit_name.toLowerCase().includes(q) ||
        h.marker_compound.toLowerCase().includes(q) ||
        h.category.includes(q)
    );
  }, [herbs, query]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-inverse-surface/40 backdrop-blur-[2px]" onClick={onClose}>
      <div
        className="h-full w-full max-w-md bg-surface-container-lowest border-l border-portal-border shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Add herb to formulation"
      >
        <div className="p-4 border-b border-portal-border/60 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-title-md text-title-md font-bold text-portal-navy-deep">Herbarium — add to formula</h3>
            <button onClick={onClose} aria-label="Close herbarium" className="w-8 h-8 rounded-lg border border-portal-border grid place-items-center text-outline hover:text-portal-navy-deep">
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-outline pointer-events-none">search</span>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && matches.length > 0) {
                  const first = matches.find((h) => !existingIds.has(h.id));
                  if (first) onAdd(first.id, first.category === "carrier" ? 15 : first.category === "bio_enhancer" ? 5 : 10);
                }
              }}
              placeholder="Search herb, Sanskrit name, or marker… (⌘K)"
              className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-portal-border bg-portal-surface-subtle text-sm focus:outline-none focus:border-tiranga-saffron"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {CATEGORY_ORDER.map((cat) => {
            const group = matches.filter((h) => h.category === cat);
            if (group.length === 0) return null;
            return (
              <div key={cat}>
                <p className="text-xs font-bold uppercase tracking-wider text-outline mb-1.5">{CATEGORY_LABELS[cat]}</p>
                <div className="space-y-1.5">
                  {group.map((h) => {
                    const added = existingIds.has(h.id);
                    return (
                      <button
                        key={h.id}
                        disabled={added}
                        onClick={() => onAdd(h.id, h.category === "carrier" ? 15 : h.category === "bio_enhancer" ? 5 : 10)}
                        className={`w-full text-left rounded-lg border p-2.5 transition-colors ${
                          added
                            ? "border-portal-border/40 bg-surface-container opacity-50 cursor-not-allowed"
                            : "border-portal-border/60 bg-surface-container-lowest hover:border-tiranga-saffron hover:bg-tertiary-fixed/30"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-bold text-portal-navy-deep">
                            {h.common_name}
                            <span className="text-xs font-normal italic text-outline ml-1.5">{h.sanskrit_name}</span>
                          </span>
                          <span className="text-xs font-mono text-outline shrink-0">
                            {added ? "in formula" : `+ ${h.category === "carrier" ? 15 : h.category === "bio_enhancer" ? 5 : 10}%`}
                          </span>
                        </div>
                        <p className="text-xs text-on-surface-variant mt-0.5">
                          {h.marker_compound} · {h.standardized_percentage}
                          {h.safety_ceiling_percent != null && (
                            <span className="text-tiranga-saffron-deep"> · ceiling {h.safety_ceiling_percent}%</span>
                          )}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {matches.length === 0 && (
            <p className="text-sm text-outline text-center py-8">No herb matches “{query}”.</p>
          )}
        </div>
      </div>
    </div>
  );
}
