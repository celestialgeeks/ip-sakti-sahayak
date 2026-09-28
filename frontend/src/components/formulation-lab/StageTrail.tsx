"use client";

// Stage trail for the Formulation Lab — the lab's four views (§3: doors → bench
// → examine → dossier) made visible and clickable. The lab stays one page with
// state-driven routing; this only exposes that state, it never adds a route.
// Forward jumps are locked *with the reason*, so the gate ladder stays the only
// source of truth (§7) and nothing is hidden (§11.1). Deliberately no
// org-structure prefix — this is a stage navigator, not a document trail, so it
// doesn't reintroduce the PDF-like chrome the app shell removed.
//
// Styling note: the primitive's semantic classes (text-muted-foreground,
// hover:text-foreground, ring-ring) already resolve to IP-SAKTI values through
// the `@theme inline` block in globals.css, so crumbs here override only
// additive properties — overriding a colour would collide with the base class
// in Slot's merged class string and resolve unpredictably in Tailwind v4.

import React from "react";
import { DoorOpen, FileDown, FlaskConical, Gavel, Lock } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  LAB_STAGES,
  STAGE_LABELS,
  stagePosition,
  type LabStage,
  type StageAvailability,
} from "@/lib/formulation/stages";

interface StageTrailProps {
  stage: LabStage;
  /** Per-stage availability, from computeStageAvailability(stages.ts). */
  availability: Record<LabStage, StageAvailability>;
  onNavigate: (stage: LabStage) => void;
}

const STAGE_ICONS: Record<LabStage, React.ReactNode> = {
  doors: <DoorOpen className="h-3.5 w-3.5 shrink-0" />,
  bench: <FlaskConical className="h-3.5 w-3.5 shrink-0" />,
  examine: <Gavel className="h-3.5 w-3.5 shrink-0" />,
  dossier: <FileDown className="h-3.5 w-3.5 shrink-0" />,
};

export function StageTrail({ stage, availability, onNavigate }: StageTrailProps) {
  return (
    <Breadcrumb aria-label="Formulation Lab stage" className="print:hidden">
      <BreadcrumbList
        size="sm"
        className="w-fit rounded-lg border border-portal-border/60 bg-surface-container-lowest/70 px-2.5 py-1.5"
      >
        {LAB_STAGES.map((id, i) => {
          const label = STAGE_LABELS[id];
          const icon = STAGE_ICONS[id];
          const { unlocked, reason } = availability[id];
          const separator = i > 0 ? <BreadcrumbSeparator /> : null;

          if (id === stage) {
            return (
              <React.Fragment key={id}>
                {separator}
                <BreadcrumbItem>
                  <BreadcrumbPage
                    variant="highlighted"
                    className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-bold text-portal-navy-deep bg-tertiary-fixed/30 ring-1 ring-tiranga-saffron/40"
                  >
                    {icon}
                    <span>{label}</span>
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </React.Fragment>
            );
          }

          if (unlocked) {
            return (
              <React.Fragment key={id}>
                {separator}
                <BreadcrumbItem>
                  <BreadcrumbLink asChild className="px-1.5 py-0.5">
                    <button type="button" onClick={() => onNavigate(id)}>
                      {icon}
                      <span>{label}</span>
                    </button>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </React.Fragment>
            );
          }

          // Locked, not hidden: the reason is the next rung of the ladder (§7).
          return (
            <React.Fragment key={id}>
              {separator}
              <BreadcrumbItem aria-disabled="true">
                <span title={reason} className="inline-flex items-center gap-1 px-1.5 py-0.5 text-outline/80 cursor-not-allowed">
                  <Lock className="h-3 w-3 shrink-0" />
                  <span>{label}</span>
                  <span className="sr-only">— locked: {reason}</span>
                </span>
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
      <span className="sr-only">
        Stage {stagePosition(stage)} of {LAB_STAGES.length}: {STAGE_LABELS[stage]}
      </span>
    </Breadcrumb>
  );
}
