"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/interfaces-select";
import { cn } from "@/lib/utils";

// ── Icons (Custom inline SVGs for zero layout shift & zero external CDN lag) ─
function CheckVerifiedIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
    </svg>
  );
}

function SyncIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
    </svg>
  );
}

function DownloadIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
    </svg>
  );
}

function SearchIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function BankIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="2" y1="20" x2="22" y2="20" />
      <line x1="6" y1="10" x2="6" y2="16" />
      <line x1="10" y1="10" x2="10" y2="16" />
      <line x1="14" y1="10" x2="14" y2="16" />
      <line x1="18" y1="10" x2="18" y2="16" />
      <polygon points="12 2 2 7 22 7 12 2" />
    </svg>
  );
}

function GavelIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 13l-7.5 7.5a2.12 2.12 0 1 1-3-3L11 10M16 8l2-2a2.83 2.83 0 1 1 4 4l-2 2M8 16l4-4M13 3l8 8" />
    </svg>
  );
}

function PharmacyIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}

function DocumentIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function CloudSyncIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}

function ScheduleIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function CalendarIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function ShieldIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function BoltIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function BookIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function SparklesIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.912 5.886a2 2 0 0 0 1.202 1.202L21 12l-5.886 1.912a2 2 0 0 0-1.202 1.202L12 21l-1.912-5.886a2 2 0 0 0-1.202-1.202L3 12l5.886-1.912a2 2 0 0 0 1.202-1.202L12 3z" />
    </svg>
  );
}

function TreeIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

// ── Types ──────────────────────────────────────────────────────────────────
type CategoryType = "all" | "rules" | "tkdl" | "section3" | "forms";
type JurisdictionType = "all" | "ipo" | "ayush" | "nba" | "pct";

interface DirectiveItem {
  id: string;
  category: CategoryType[];
  jurisdiction: JurisdictionType;
  badge: string;
  badgeColor: string;
  ref: string;
  date: string;
  title: string;
  description: string;
  subBox?: string;
  tags: string[];
  docSize: string;
  actionType: "explain" | "checklist" | "citation";
}

interface FormItem {
  id: string;
  category: CategoryType[];
  jurisdiction: JurisdictionType;
  formNumber: string;
  badge: string;
  badgeColor: string;
  title: string;
  description: string;
  formatOrFee: string;
  actionName: string;
  actionModal: string;
}

// ── Console sizing tokens ──────────────────────────────────────────────────
// This screen is a fixed-height console: every control is 32px tall (the same
// height the shared Select primitive exposes as `size="sm"`) and the smallest
// live text is 12px, so header, toolbar and rails stack into one viewport
// without clipping. Never go below 12px — statute text must read without zoom.
const H = "h-8"; // shared control height

const fieldCls = cn(
  H,
  "min-w-0 rounded-lg border border-slate-200 bg-[#F4F6F9] px-2.5 text-[12px] text-[#111c2d] transition-colors placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00263f]/60",
);
const ghostBtnCls = cn(
  H,
  "inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-[12px] font-semibold text-[#00263f] transition-colors hover:bg-slate-100",
);
const solidBtnCls = cn(
  H,
  "inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#00263f] px-2.5 text-[12px] font-semibold text-white transition-colors hover:bg-[#001d32]",
);
const iconBtnCls = cn(
  H,
  "w-8 shrink-0 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-[#00263f] transition-colors hover:bg-slate-200",
);
const metaChipCls =
  "inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[12px] font-semibold text-[#00263f]";

const CATEGORY_TABS: { id: CategoryType; label: string }[] = [
  { id: "all", label: "All items" },
  { id: "rules", label: "Patent Rules" },
  { id: "tkdl", label: "TKDL & Classical" },
  { id: "section3", label: "Sec 3(p) / 3(e)" },
  { id: "forms", label: "Forms & Templates" },
];

/** Empty state inside a rail — offers the way out instead of a dead end. */
function RailEmptyState({ label, onReset }: { label: string; onReset: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
      <p className="text-[12px] text-slate-500">No {label} match the current filters.</p>
      <button type="button" onClick={onReset} className={ghostBtnCls}>
        Reset filters
      </button>
    </div>
  );
}

// ── Data Repositories ──────────────────────────────────────────────────────
const DIRECTIVES: DirectiveItem[] = [
  {
    id: "asu-guidelines-2024",
    category: ["rules", "section3"],
    jurisdiction: "ipo",
    badge: "Active Examination Directive",
    badgeColor: "bg-[#acf4a4] text-[#0c5216]",
    ref: "Ref: CGPDTM/2024/ASU-04",
    date: "12 Feb 2024",
    title: "Guidelines for Patent Examination of ASU Inventions (Ayurveda, Siddha & Unani)",
    description:
      "Statutory clarification regarding Section 3(p) objections and the standard of proof required to establish non-obvious synergistic combinations under Section 3(e). Emphasizes that simple admixture or extraction without demonstrative synergistic therapeutic index is non-patentable.",
    subBox:
      "Includes standard evidentiary test parameters for in-vitro synergy ratio calculations (Chou-Talalay method accepted).",
    tags: ["Section 3(p)", "Section 3(e)"],
    docSize: "Direct Download (1.4 MB)",
    actionType: "explain",
  },
  {
    id: "nba-form-iii",
    category: ["rules"],
    jurisdiction: "nba",
    badge: "Compliance Requirement",
    badgeColor: "bg-[#ffdbcf] text-[#802a00]",
    ref: "NBA/ACT/SEC6-REV2",
    date: "18 Jan 2024",
    title: "National Biodiversity Authority (NBA) Form III Prior Approval Mandate",
    description:
      "Stringent enforcement of Section 6 of Biological Diversity Act 2002. Mandates that patent applicants applying for patents based on biological resources or traditional knowledge associated with India must obtain explicit NBA Form III clearance prior to the grant of patent by the Indian Patent Office.",
    tags: ["Biological Diversity Act", "NBA Form III"],
    docSize: "Statutory Circular (PDF)",
    actionType: "checklist",
  },
  {
    id: "tkdl-protocol-v4",
    category: ["tkdl"],
    jurisdiction: "ayush",
    badge: "Examiner Citation Protocol v4.1",
    badgeColor: "bg-[#cee5ff] text-[#00263f]",
    ref: "TKDL/EXAM/REV-2023",
    date: "05 Dec 2023",
    title: "TKDL Reference Accession Protocol v4.1 for Patent Examiners & Practitioners",
    description:
      "Standardized methodology for citing digitized references from classical texts including Charaka Samhita, Sushruta Samhita, Ashtanga Hridaya, and Rasataringini in First Examination Reports (FERs). Details exact procedures for verifying transliterated IPC classification codes (A61K 36/00).",
    tags: ["Charaka / Sushruta", "IPC A61K"],
    docSize: "Accession Guide (PDF)",
    actionType: "citation",
  },
];

const FORMS: FormItem[] = [
  {
    id: "form-3",
    category: ["forms"],
    jurisdiction: "ipo",
    formNumber: "FORM 3",
    badge: "Auto-Fill Enabled",
    badgeColor: "text-[#2a6b2c]",
    title: "Statement & Undertaking Under Section 8",
    description:
      "Mandatory declaration of corresponding foreign patent applications under Rule 12. Automatically populated with global family data through IP-SAKTI docket synchronization.",
    formatOrFee: "Formats: PDF • Word • XML",
    actionName: "Pre-Fill Form",
    actionModal: "form3",
  },
  {
    id: "form-18a",
    category: ["forms"],
    jurisdiction: "ipo",
    formNumber: "FORM 18A",
    badge: "Fast-Track Disposal",
    badgeColor: "text-[#E65100]",
    title: "Request for Expedited Examination of Patent Application",
    description:
      "Rule 24C expedited fast-track route available for Ayush Startups, MSMEs, female applicants, and government-funded indigenous formulation research institutes.",
    formatOrFee: "Fee Schedule: 80% Ayush Rebate",
    actionName: "Docket Generator",
    actionModal: "form18a",
  },
  {
    id: "form-27",
    category: ["forms"],
    jurisdiction: "ipo",
    formNumber: "FORM 27",
    badge: "Amended 2024 Template",
    badgeColor: "text-slate-500",
    title: "Statement of Working of Patented Invention",
    description:
      "Updated periodic commercial working reporting structure under Section 146(2). Filing frequency transitioned to once every three financial years instead of annually.",
    formatOrFee: "Updated: Rule 131(2)",
    actionName: "Blank Template",
    actionModal: "form27",
  },
  {
    id: "legal-draft-3p",
    category: ["section3", "forms"],
    jurisdiction: "ayush",
    formNumber: "LEGAL DRAFT",
    badge: "Ministry Standard",
    badgeColor: "text-[#E65100]",
    title: "Statutory Section 3(p) Objection Response Template",
    description:
      "Ministry of Ayush official defense drafting framework for overcoming TKDL prior art citations with proven synergistic efficacy data, botanical distinction, and extraction differentiation.",
    formatOrFee: "NIC Cloud DOCX • 480 KB",
    actionName: "Download Template",
    actionModal: "legal_draft",
  },
];

export default function RulesPage() {
  const router = useRouter();

  // ── Search & Filter State ────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<JurisdictionType>("all");
  const [activeCategory, setActiveCategory] = useState<CategoryType>("all");
  // Below `lg` the two rails cannot sit side by side, so exactly one is mounted.
  // That keeps the console on a single screen instead of a long page scroll.
  const [activeRail, setActiveRail] = useState<"directives" | "forms">("directives");
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState("Today, 08:30 AM");
  const [syncToast, setSyncToast] = useState<string | null>(null);

  // ── Modal State ──────────────────────────────────────────────────────────
  const [activeModal, setActiveModal] = useState<
    "gazette" | "form3" | "form18a" | "nba" | "tkdl_rules" | "concordance" | null
  >(null);

  // Form 3 State
  const [form3AppNo, setForm3AppNo] = useState("IN-202411039821");
  const [form3Applicant, setForm3Applicant] = useState("Patanjali Research Foundation");
  const [form3Status, setForm3Status] = useState<"idle" | "generating" | "done">("idle");

  // Form 18A Calculator State
  const [applicantType, setApplicantType] = useState<"startup" | "msme" | "female" | "institute">("startup");

  // Concordance Search State
  const [concordanceSearch, setConcordanceSearch] = useState("");

  // ── Live Sync Handler ────────────────────────────────────────────────────
  const handleLiveSync = () => {
    setIsSyncing(true);
    setSyncToast("Connecting to Controller General of Patents e-Gazette repository...");

    setTimeout(() => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      });
      setLastSyncTime(`Today, ${timeStr}`);
      setIsSyncing(false);
      setSyncToast("Successfully synced 28 statutory rules with IPO Direct Feeds.");
      setTimeout(() => setSyncToast(null), 4000);
    }, 1200);
  };

  // ── Reset Filters ────────────────────────────────────────────────────────
  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedJurisdiction("all");
    setActiveCategory("all");
  };

  // ── Filtered Directives & Forms ──────────────────────────────────────────
  const filteredDirectives = useMemo(() => {
    return DIRECTIVES.filter((item) => {
      // Category check
      if (activeCategory !== "all" && !item.category.includes(activeCategory)) {
        return false;
      }
      // Jurisdiction check
      if (selectedJurisdiction !== "all" && item.jurisdiction !== selectedJurisdiction) {
        return false;
      }
      // Search check
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const text = `${item.title} ${item.description} ${item.ref} ${item.tags.join(" ")}`.toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });
  }, [activeCategory, selectedJurisdiction, searchQuery]);

  const filteredForms = useMemo(() => {
    return FORMS.filter((item) => {
      // Category check
      if (activeCategory !== "all" && !item.category.includes(activeCategory)) {
        return false;
      }
      // Jurisdiction check
      if (selectedJurisdiction !== "all" && item.jurisdiction !== selectedJurisdiction) {
        return false;
      }
      // Search check
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const text = `${item.formNumber} ${item.title} ${item.description}`.toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });
  }, [activeCategory, selectedJurisdiction, searchQuery]);

  // Tab counts are derived from the jurisdiction + search filters (never from
  // the tab itself), so a number on a tab can't disagree with its own list.
  const countFor = (category: CategoryType) => {
    const q = searchQuery.trim().toLowerCase();
    const hit = (haystack: string) => !q || haystack.toLowerCase().includes(q);
    return (
      DIRECTIVES.filter(
        (d) =>
          (category === "all" || d.category.includes(category)) &&
          (selectedJurisdiction === "all" || d.jurisdiction === selectedJurisdiction) &&
          hit(`${d.title} ${d.description} ${d.ref} ${d.tags.join(" ")}`),
      ).length +
      FORMS.filter(
        (f) =>
          (category === "all" || f.category.includes(category)) &&
          (selectedJurisdiction === "all" || f.jurisdiction === selectedJurisdiction) &&
          hit(`${f.formNumber} ${f.title} ${f.description}`),
      ).length
    );
  };

  return (
    // Fixed-height console: the shell itself never scrolls — only the two rails
    // below do. `min-w-0` + `overflow-hidden` are what stop the tab strip and
    // long labels from bleeding past the viewport on phones.
    <div
      id="rules-shell"
      className="relative flex h-[calc(100dvh-95px)] min-w-0 flex-col overflow-y-auto lg:overflow-hidden bg-[#F4F6F9] text-[#111c2d]"
    >
      {/* ── Sync toast (overlay, so it never pushes the console) ────────── */}
      {syncToast && (
        <div className="animate-fade-in absolute inset-x-0 top-0 z-30 flex items-center justify-between gap-3 rounded-b-lg bg-[#00263f] px-4 py-2 text-[12px] text-white shadow-lg">
          <span className="flex min-w-0 items-center gap-2">
            <span className="h-2 w-2 shrink-0 animate-ping rounded-full bg-[#138808]" />
            <span className="truncate">{syncToast}</span>
          </span>
          <button
            type="button"
            onClick={() => setSyncToast(null)}
            aria-label="Dismiss sync message"
            className="shrink-0 px-1 font-bold text-slate-300 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Section 1: Title bar, live status, export actions ───────────── */}
      <header className="shrink-0 border-b border-slate-200 bg-white px-3 py-2.5 sm:px-4">
        <div className="flex flex-wrap items-start gap-x-3 gap-y-2">
          <div className="min-w-[220px] flex-1">
            <div className="mb-1.5 flex h-[3px] w-20 overflow-hidden rounded-full">
              <div className="w-1/3 bg-[#FF9933]" />
              <div className="w-1/3 bg-slate-200" />
              <div className="w-1/3 bg-[#138808]" />
            </div>
            <h1 className="text-[17px] font-bold leading-tight tracking-tight text-[#00263f] sm:text-[19px]">
              Latest Rules, Regulations &amp; Statutory Forms
            </h1>
            <p className="mt-0.5 hidden text-[12px] leading-snug text-slate-600 sm:block">
              Indian Patents Act 1970 · Patent Rules 2003 (as amended 2024) · TKDL
              citation protocol · NBA benefit-sharing compliance.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={handleLiveSync}
              disabled={isSyncing}
              className={ghostBtnCls}
              title="Pull the latest e-Gazette notifications"
            >
              <SyncIcon
                className={cn("h-3.5 w-3.5", isSyncing ? "animate-spin text-[#FF9933]" : "text-slate-500")}
              />
              <span className="hidden sm:inline">{isSyncing ? "Syncing…" : "IPO Sync Live"}</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className={solidBtnCls}
              title="Print or save the full regulatory digest"
            >
              <DownloadIcon className="h-3.5 w-3.5 text-[#FF9933]" />
              <span className="hidden sm:inline">Export Digest (PDF)</span>
            </button>
          </div>
        </div>

        {/* Status chips — short enough to wrap, so nothing is ever clipped.
            Below `sm` only the sync chip survives; the rest duplicate the
            featured strip and the tab counts. */}
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className={cn(metaChipCls, "hidden border-blue-100 bg-[#f0f3ff] sm:inline-flex")}>
            <GavelIcon className="h-3.5 w-3.5 shrink-0" />
            Amendment Rules 2024 · in force 15-Mar-2024
          </span>
          <span className={cn(metaChipCls, "hidden border-green-100 bg-[#eaf7eb] md:inline-flex")}>
            <PharmacyIcon className="h-3.5 w-3.5 shrink-0" />
            Sec 3(p) scrutiny v2.4 · TKDL cross-check
          </span>
          <span className={cn(metaChipCls, "hidden border-blue-100 bg-[#e7eeff] lg:inline-flex")}>
            <DocumentIcon className="h-3.5 w-3.5 shrink-0" />
            14 forms pre-filled · 3, 18A, 27, NBA III
          </span>
          <span className={cn(metaChipCls, "border-green-100 bg-[#eaf7eb]")}>
            <CloudSyncIcon className="h-3.5 w-3.5 shrink-0 text-[#138808]" />
            Synced {lastSyncTime} IST
          </span>
        </div>
      </header>

      {/* ── Section 2: Filter toolbar + category tabs ───────────────────── */}
      <div className="shrink-0 border-b border-slate-200 bg-white px-3 pb-2 sm:px-4">
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Search — flex-1 with min-w-0 so it shrinks instead of pushing out */}
          <div className="relative min-w-[150px] max-w-md flex-1">
            <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              id="statutory-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search rule no., section, gazette or form…"
              className={cn(fieldCls, "w-full pl-8")}
            />
          </div>

          {/* Jurisdiction — short option labels so the trigger never clips */}
          <Select
            value={selectedJurisdiction}
            onValueChange={(v) => setSelectedJurisdiction(v as JurisdictionType)}
          >
            <SelectTrigger
              size="sm"
              aria-label="Filter by jurisdiction"
              className={cn(fieldCls, "w-[168px] justify-between gap-1.5 px-2.5")}
            >
              <span className="flex min-w-0 items-center gap-1.5">
                <BankIcon className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                <SelectValue className="min-w-0 flex-1 truncate text-left" placeholder="Jurisdiction" />
              </span>
            </SelectTrigger>
            <SelectContent className="[&_[data-slot=select-item]]:text-[12px]">
              <SelectItem value="all">All jurisdictions</SelectItem>
              <SelectItem value="ipo">IPO / CGPDTM</SelectItem>
              <SelectItem value="ayush">Ministry of Ayush</SelectItem>
              <SelectItem value="nba">National Biodiversity Authority</SelectItem>
              <SelectItem value="pct">WIPO / PCT</SelectItem>
            </SelectContent>
          </Select>

          <button type="button" id="clear-search-btn" onClick={handleResetFilters} className={ghostBtnCls}>
            Reset filters
          </button>

          {/* Rail switch — below lg the two rails stack, so only one is mounted */}
          <div className="ml-auto flex items-center gap-0.5 rounded-lg border border-slate-200 bg-[#F4F6F9] p-0.5 lg:hidden">
            {([
              { id: "directives", label: "Directives", n: filteredDirectives.length },
              { id: "forms", label: "Forms", n: filteredForms.length },
            ] as const).map((rail) => (
              <button
                key={rail.id}
                type="button"
                onClick={() => setActiveRail(rail.id)}
                aria-pressed={activeRail === rail.id}
                className={cn(
                  "inline-flex h-7 items-center gap-1 rounded px-2 text-[12px] font-semibold transition-colors",
                  activeRail === rail.id
                    ? "bg-[#00263f] text-white"
                    : "text-slate-600 hover:bg-white",
                )}
              >
                {rail.label}
                <span className="font-mono opacity-70">{rail.n}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Category tabs — a scroll strip that can never widen the page */}
        <div className="-mx-3 mt-1.5 flex min-w-0 items-center gap-1.5 overflow-x-auto px-3 pb-0.5 sm:-mx-4 sm:px-4">
          {CATEGORY_TABS.map((tab) => {
            const active = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategory(tab.id)}
                aria-pressed={active}
                className={cn(
                  "inline-flex h-7 shrink-0 items-center gap-1.5 rounded-lg border px-2.5 text-[12px] font-semibold transition-colors",
                  active
                    ? "border-[#00263f] bg-[#00263f] text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100",
                )}
              >
                {tab.label}
                <span
                  className={cn(
                    "rounded px-1 font-mono text-[12px]",
                    active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500",
                  )}
                >
                  {countFor(tab.id)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Section 3: Featured gazette alert (compact strip) ───────────── */}
      {(activeCategory === "all" || activeCategory === "rules") && (
        <section className="relative shrink-0 overflow-hidden bg-[#00263f] px-3 py-2.5 text-white sm:px-4">
          {/* Saffron severity spine */}
          <span aria-hidden className="absolute inset-y-0 left-0 w-1.5 bg-[#FF9933]" />

          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 pl-1.5">
            <div className="min-w-[200px] flex-1">
              {/* Meta row scrolls sideways on phones instead of stacking 3 lines */}
              <div className="flex flex-nowrap items-center gap-2 overflow-x-auto pb-0.5 text-[12px]">
                <span className="shrink-0 rounded bg-[#692100] px-1.5 py-0.5 font-bold uppercase tracking-wide text-[#ff7d49]">
                  Critical update
                </span>
                <span className="shrink-0 font-mono text-blue-200">G.S.R. 200(E) · CGPDTM</span>
                <span className="shrink-0 text-blue-200">Published 15 Mar 2024</span>
              </div>

              <h2 className="mt-1 text-[15px] font-bold leading-snug tracking-tight sm:text-[16px]">
                Patents (Amendment) Rules, 2024 — Operational Restructuring
              </h2>

              {/* The three operative deltas — one sideways row on phones, wrapped
                  on larger screens. The clause-by-clause text is in the viewer. */}
              <div className="-mx-3 mt-1.5 flex flex-nowrap gap-1.5 overflow-x-auto px-3 pb-0.5 sm:mx-0 sm:flex-wrap sm:px-0">
                {[
                  { icon: <ScheduleIcon className="h-3.5 w-3.5 shrink-0" />, label: "Rule 24B · FER response 3 + 2 months" },
                  { icon: <CheckVerifiedIcon className="h-3.5 w-3.5 shrink-0" />, label: "Form 3 · Controller retrieves" },
                  { icon: <ShieldIcon className="h-3.5 w-3.5 shrink-0" />, label: "Sec 3(p) · TKDL check binding" },
                ].map((delta) => (
                  <span
                    key={delta.label}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-blue-900/60 bg-[#002855]/80 px-2 py-1 text-[12px] font-semibold text-[#FF9933]"
                  >
                    {delta.icon}
                    <span className="text-blue-50">{delta.label}</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex min-w-0 flex-nowrap items-center gap-1.5 overflow-x-auto pb-0.5 sm:shrink-0 sm:flex-wrap sm:overflow-visible">
              <button
                type="button"
                onClick={() => setActiveModal("gazette")}
                className={cn(H, "inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#FF9933] px-2.5 text-[12px] font-bold uppercase tracking-wide text-slate-900 transition-colors hover:bg-[#e08528]")}
              >
                <DocumentIcon className="h-3.5 w-3.5" />
                Gazette PDF
              </button>

              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/chat?prompt=" +
                      encodeURIComponent(
                        "Analyze the impact of Patents (Amendment) Rules 2024 on Ayush herbal patents, focusing on Rule 24B FER timelines and Section 3(p) objections.",
                      ),
                  )
                }
                className={cn(H, "inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-blue-700 bg-[#0b3c5d] px-2.5 text-[12px] font-semibold text-white transition-colors hover:bg-[#195280]")}
              >
                <SparklesIcon className="h-3.5 w-3.5 text-[#FF9933]" />
                Analyze impact
              </button>

              <button
                type="button"
                onClick={() => setActiveModal("gazette")}
                className={cn(H, "hidden items-center px-1.5 text-[12px] text-blue-200 transition-colors hover:text-white sm:inline-flex")}
              >
                ⇄ Compare 2003 Rules
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ── Section 4: The two content rails — only these scroll ────────── */}
      <div className="rules-rails flex min-h-[230px] flex-1 flex-col gap-3 p-3 sm:gap-4 lg:min-h-0 lg:flex-row lg:p-4">
        {/* Rail A — statutory notifications & directives */}
        <section
          className={cn(
            "rules-rail min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm",
            activeRail === "directives" ? "flex" : "hidden",
            "lg:flex",
          )}
        >
          <header className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-3 py-2">
            <div className="flex min-w-0 items-center gap-2">
              <GavelIcon className="h-4 w-4 shrink-0 text-[#2a6b2c]" />
              <h2 className="text-[13px] font-bold text-[#00263f]">
                Statutory Notifications &amp; Directives
              </h2>
            </div>
            <span className="shrink-0 rounded border border-slate-200 px-1.5 py-0.5 text-[12px] font-semibold text-slate-500">
              {filteredDirectives.length} item{filteredDirectives.length === 1 ? "" : "s"} · updated weekly
            </span>
          </header>

          <div className="rules-rail-body min-h-0 flex-1 overflow-y-auto">
            {filteredDirectives.length === 0 ? (
              <RailEmptyState label="statutory directives" onReset={handleResetFilters} />
            ) : (
              filteredDirectives.map((item) => (
                <article
                  key={item.id}
                  className="relative border-b border-slate-100 py-2.5 pl-4 pr-3 last:border-b-0 hover:bg-slate-50/70"
                >
                  {/* Severity spine */}
                  <span
                    aria-hidden
                    className={cn(
                      "absolute inset-y-0 left-0 w-1",
                      item.id === "asu-guidelines-2024"
                        ? "bg-[#138808]"
                        : item.id === "nba-form-iii"
                        ? "bg-[#FF9933]"
                        : "bg-[#000080]",
                    )}
                  />

                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className={cn("rounded px-1.5 py-0.5 text-[12px] font-bold uppercase", item.badgeColor)}>
                      {item.badge}
                    </span>
                    <span className="font-mono text-[12px] text-slate-500">{item.ref}</span>
                    <span className="ml-auto inline-flex items-center gap-1 text-[12px] text-slate-500">
                      <CalendarIcon className="h-3.5 w-3.5" />
                      {item.date}
                    </span>
                  </div>

                  <h3 className="mt-1 text-[13.5px] font-bold leading-snug text-[#00263f]">
                    {item.title}
                  </h3>

                  <p className="mt-0.5 text-[12px] leading-relaxed text-slate-600">
                    {item.description}
                  </p>

                  {item.subBox && (
                    <p className="mt-1.5 flex items-start gap-1.5 rounded-lg bg-slate-50 px-2 py-1.5 text-[12px] text-slate-700">
                      <CheckVerifiedIcon className="mt-px h-3.5 w-3.5 shrink-0 text-[#138808]" />
                      <span>{item.subBox}</span>
                    </p>
                  )}

                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded bg-[#e7eeff] px-1.5 py-0.5 text-[12px] font-medium text-[#00263f]"
                      >
                        {tag}
                      </span>
                    ))}

                    <div className="ml-auto flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          if (item.id === "nba-form-iii") setActiveModal("nba");
                          else if (item.id === "tkdl-protocol-v4") setActiveModal("tkdl_rules");
                          else setActiveModal("gazette");
                        }}
                        className={ghostBtnCls}
                        title={item.docSize}
                      >
                        <DownloadIcon className="h-3.5 w-3.5" />
                        {item.docSize}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (item.actionType === "explain") {
                            router.push(
                              "/chat?prompt=" +
                                encodeURIComponent(
                                  "Explain the CGPDTM/2024/ASU-04 guidelines for patent examination of ASU inventions, specifically regarding Section 3(p) and Section 3(e) non-obvious synergistic requirements."
                                )
                            );
                          } else if (item.actionType === "checklist") {
                            setActiveModal("nba");
                          } else if (item.actionType === "citation") {
                            setActiveModal("tkdl_rules");
                          }
                        }}
                        className={solidBtnCls}
                      >
                        {item.actionType === "explain" && (
                          <>
                            <SparklesIcon className="h-3.5 w-3.5 text-[#FF9933]" />
                            <span>Ask IP-SAKTI</span>
                          </>
                        )}
                        {item.actionType === "checklist" && (
                          <>
                            <CheckVerifiedIcon className="h-3.5 w-3.5 text-[#FF9933]" />
                            <span>Pre-check docket</span>
                          </>
                        )}
                        {item.actionType === "citation" && (
                          <>
                            <BookIcon className="h-3.5 w-3.5 text-[#FF9933]" />
                            <span>Citation rules</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        {/* Rail B — statutory forms & filing templates */}
        <section
          className={cn(
            "rules-rail min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:w-[380px] lg:flex-none xl:w-[420px]",
            activeRail === "forms" ? "flex" : "hidden",
            "lg:flex",
          )}
        >
          <header className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-3 py-2">
            <div className="flex min-w-0 items-center gap-2">
              <DocumentIcon className="h-4 w-4 shrink-0 text-[#2a6b2c]" />
              <h2 className="text-[13px] font-bold text-[#00263f]">Statutory Forms &amp; Templates</h2>
            </div>
            <span className="shrink-0 rounded border border-slate-200 px-1.5 py-0.5 font-mono text-[12px] font-semibold text-slate-500">
              {filteredForms.length} · e-filing v2.0
            </span>
          </header>

          <div className="rules-rail-body min-h-0 flex-1 overflow-y-auto">
            {filteredForms.length === 0 ? (
              <RailEmptyState label="statutory forms" onReset={handleResetFilters} />
            ) : (
              filteredForms.map((item) => (
                <article
                  key={item.id}
                  className="border-b border-slate-100 px-3 py-2.5 last:border-b-0 hover:bg-slate-50/70"
                >
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="rounded bg-[#00263f] px-1.5 py-0.5 font-mono text-[12px] font-bold text-white">
                      {item.formNumber}
                    </span>
                    <span className={cn("inline-flex items-center gap-1 text-[12px] font-bold", item.badgeColor)}>
                      {item.id === "form-3" && <SparklesIcon className="h-3.5 w-3.5" />}
                      {item.id === "form-18a" && <BoltIcon className="h-3.5 w-3.5" />}
                      {item.id === "legal-draft-3p" && <ShieldIcon className="h-3.5 w-3.5" />}
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="mt-1 text-[13.5px] font-bold leading-snug text-[#00263f]">
                    {item.title}
                  </h3>

                  <p className="mt-0.5 text-[12px] leading-relaxed text-slate-600">
                    {item.description}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1.5">
                    <span className="text-[12px] font-medium text-slate-500">{item.formatOrFee}</span>
                    <div className="ml-auto flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          if (item.actionModal === "form3") setActiveModal("form3");
                          else if (item.actionModal === "form18a") setActiveModal("form18a");
                          else setActiveModal("gazette");
                        }}
                        className={iconBtnCls}
                        title="Download blank template"
                        aria-label={`Download ${item.formNumber} template`}
                      >
                        <DownloadIcon className="h-3.5 w-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (item.actionModal === "form3") setActiveModal("form3");
                          else if (item.actionModal === "form18a") setActiveModal("form18a");
                          else if (item.id === "legal-draft-3p") {
                            router.push(
                              "/chat?prompt=" +
                                encodeURIComponent(
                                  "Draft a Section 3(p) and TKDL prior art objection response for an Ayurvedic formulation claiming synergistic therapeutic efficacy with clinical and pharmacological distinction."
                                )
                            );
                          } else {
                            setActiveModal("gazette");
                          }
                        }}
                        className={cn(
                          solidBtnCls,
                          item.id === "form-3" && "bg-[#2a6b2c] hover:bg-[#1e5020]",
                        )}
                      >
                        {item.actionName}
                      </button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>

      {/* ── Section 5: Concordance entry — actions left, label bottom-right ─ */}
      <footer className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-slate-200 bg-white px-3 py-2 sm:px-4">
        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveModal("concordance")}
            className={ghostBtnCls}
          >
            Interactive Concordance
          </button>
          <a
            href="https://ipindia.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className={solidBtnCls}
          >
            <SparklesIcon className="h-3.5 w-3.5 text-[#FF9933]" />
            Gazette Registry Hub
          </a>
        </div>

        <span className="ml-auto flex min-w-0 items-center gap-1.5 text-[12px] font-bold text-[#00263f]">
          <TreeIcon className="h-4 w-4 shrink-0" />
          IPO &amp; Ayush Concordat · 1,480 formulations
        </span>
      </footer>

      {/* ── MODALS ──────────────────────────────────────────────────────── */}

      {/* 1. Gazette PDF & Clause Comparison Modal */}
      {activeModal === "gazette" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[85dvh] flex flex-col overflow-hidden border border-slate-200">
            <div className="flex shrink-0 items-center justify-between gap-3 bg-[#00263f] px-4 py-3 text-white">
              <div className="flex min-w-0 items-center gap-2">
                <DocumentIcon className="w-5 h-5 text-[#FF9933]" />
                <h3 className="min-w-0 text-[15px] font-bold leading-snug sm:text-[16px]">
                  Patents (Amendment) Rules, 2024 — Official Gazette Viewer
                </h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-300 hover:text-white text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 text-[12px] text-slate-700 sm:text-[13px]">
              <div className="p-3 rounded bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                <strong>Gazette Notification Ref:</strong> G.S.R. 200(E) dated 15th March 2024 published in the Gazette of India Extraordinary, Part II, Section 3, Sub-section (i).
              </div>

              <h4 className="font-bold text-sm text-[#00263f] border-b pb-1">
                Key Procedural Modifications Comparison (2003 vs 2024)
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded bg-slate-50 border border-slate-200">
                  <div className="font-bold text-red-700 mb-1">Patent Rules 2003 (Previous)</div>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600">
                    <li>Rule 24B: FER response deadline 6 months (extendable by 3 months on petition).</li>
                    <li>Form 3: Applicant burdened with continuous periodic filing of foreign office actions.</li>
                    <li>Form 27: Annual mandatory working statement filings.</li>
                  </ul>
                </div>

                <div className="p-3 rounded bg-green-50 border border-green-200">
                  <div className="font-bold text-green-800 mb-1">Patent Rules 2024 (Amended)</div>
                  <ul className="list-disc pl-4 space-y-1 text-slate-700">
                    <li>Rule 24B: Response window reduced to 3 months (extendable by 2 months).</li>
                    <li>Form 3: Controller retrieves public status directly; applicant supplies on explicit demand.</li>
                    <li>Form 27: Transitioned to once every three financial years.</li>
                  </ul>
                </div>
              </div>

              <h4 className="font-bold text-sm text-[#00263f] border-b pb-1 pt-2">
                Section 3(p) & Ayush Examination Directive
              </h4>
              <p className="leading-relaxed">
                Examiners must cross-reference claims with the CSIR-TKDL Database. An invention relating to traditional knowledge or which is an aggregation or duplication of known properties of traditionally known component or components cannot be patented unless unexpected synergy is substantiated.
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap justify-end gap-2 border-t border-slate-200 bg-slate-50 p-3">
              <button
                onClick={() => setActiveModal(null)}
                className={cn(ghostBtnCls, "bg-slate-200 px-3 hover:bg-slate-300")}
              >
                Close
              </button>
              <button
                onClick={() => {
                  alert("Official bilingual Gazette PDF download initiated.");
                  setActiveModal(null);
                }}
                className={cn(solidBtnCls, "px-3")}
              >
                <DownloadIcon className="w-3.5 h-3.5 text-[#FF9933]" />
                <span>Download Gazette PDF (English / Hindi)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Form 3 Pre-Fill Modal */}
      {activeModal === "form3" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[85dvh] flex flex-col overflow-hidden border border-slate-200">
            <div className="flex shrink-0 items-center justify-between gap-3 bg-[#00263f] px-4 py-3 text-white">
              <div className="flex min-w-0 items-center gap-2">
                <DocumentIcon className="w-5 h-5 text-[#2a6b2c]" />
                <h3 className="min-w-0 text-[15px] font-bold leading-snug">
                  Form 3 Generator — Statement & Undertaking under Section 8
                </h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-300 hover:text-white text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 text-[12px] text-slate-700 sm:text-[13px]">
              <p className="text-xs text-slate-600">
                Under Rule 12 of the Patents Rules, auto-populate corresponding patent application details across USPTO, EPO, and WIPO.
              </p>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Indian Patent Application Number:
                </label>
                <input
                  type="text"
                  value={form3AppNo}
                  onChange={(e) => setForm3AppNo(e.target.value)}
                  className="w-full px-3 py-2 border rounded border-slate-300 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Name of Applicant / Organization:
                </label>
                <input
                  type="text"
                  value={form3Applicant}
                  onChange={(e) => setForm3Applicant(e.target.value)}
                  className="w-full px-3 py-2 border rounded border-slate-300 text-xs"
                />
              </div>

              <div className="rounded border border-slate-200 bg-slate-50 p-3">
                <div className="mb-2 text-xs font-bold text-[#00263f]">
                  Synchronized Foreign Filings (Docket ID: {form3AppNo}):
                </div>
                {/* Sideways scroll on narrow screens rather than squeezing 4 columns */}
                <div className="overflow-x-auto">
                <table className="w-full min-w-[420px] border-collapse text-left text-[12px]">
                  <thead>
                    <tr className="border-b text-slate-500">
                      <th className="py-1">Jurisdiction</th>
                      <th className="py-1">App Number</th>
                      <th className="py-1">Filing Date</th>
                      <th className="py-1">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100">
                      <td className="py-1 font-semibold">United States (USPTO)</td>
                      <td className="py-1 font-mono">US 18/429,102</td>
                      <td className="py-1">2023-11-14</td>
                      <td className="py-1 text-green-700 font-medium">Pending Examination</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-1 font-semibold">European Patent Office (EPO)</td>
                      <td className="py-1 font-mono">EP 23819401.8</td>
                      <td className="py-1">2023-11-20</td>
                      <td className="py-1 text-blue-700 font-medium">Published (A1)</td>
                    </tr>
                  </tbody>
                </table>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap justify-end gap-2 border-t border-slate-200 bg-slate-50 p-3">
              <button
                onClick={() => setActiveModal(null)}
                className={cn(ghostBtnCls, "bg-slate-200 px-3 hover:bg-slate-300")}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setForm3Status("generating");
                  setTimeout(() => {
                    setForm3Status("done");
                    alert("Form 3 XML & PDF package generated for e-filing.");
                    setActiveModal(null);
                  }, 800);
                }}
                className={cn(solidBtnCls, "bg-[#2a6b2c] px-3 hover:bg-[#1e5020]")}
              >
                <DownloadIcon className="w-3.5 h-3.5" />
                <span>{form3Status === "generating" ? "Exporting..." : "Generate Form 3 (PDF & XML)"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Form 18A Expedited Examination Modal */}
      {activeModal === "form18a" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full max-h-[85dvh] flex flex-col overflow-hidden border border-slate-200">
            <div className="flex shrink-0 items-center justify-between gap-3 bg-[#00263f] px-4 py-3 text-white">
              <div className="flex min-w-0 items-center gap-2">
                <BoltIcon className="w-5 h-5 text-[#FF9933]" />
                <h3 className="min-w-0 text-[15px] font-bold leading-snug">
                  Form 18A — Expedited Examination Docket Calculator
                </h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-300 hover:text-white text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 text-[12px] text-slate-700 sm:text-[13px]">
              <p className="text-xs text-slate-600">
                Rule 24C allows expedited disposal of Ayush formulation patents. Select applicant classification to calculate the official statutory fee rebate:
              </p>

              <div className="space-y-2">
                {[
                  { id: "startup", label: "DPIIT Recognized Ayush Startup", rebate: "80% Fee Rebate", fee: "₹1,600" },
                  { id: "msme", label: "Micro, Small & Medium Enterprise (Udyam MSME)", rebate: "80% Fee Rebate", fee: "₹1,600" },
                  { id: "female", label: "Female Applicant / Co-Applicant", rebate: "80% Fee Rebate", fee: "₹1,600" },
                  { id: "institute", label: "Govt / CSIR / CCRAS Research Institute", rebate: "100% Expedited Route", fee: "₹1,600" },
                ].map((opt) => (
                  <label
                    key={opt.id}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                      applicantType === opt.id
                        ? "border-[#00263f] bg-blue-50/50"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <input
                        type="radio"
                        name="applicant"
                        checked={applicantType === opt.id}
                        onChange={() => setApplicantType(opt.id as typeof applicantType)}
                      />
                      <span className="font-semibold text-slate-800 text-xs">{opt.label}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-green-700 font-bold text-xs">{opt.fee}</span>
                      <span className="text-[12px] text-slate-400 block">{opt.rebate}</span>
                    </div>
                  </label>
                ))}
              </div>

              <div className="p-3 bg-slate-100 rounded text-xs text-slate-700">
                <strong>Standard Large Entity Fee:</strong> <del>₹8,000</del> → <strong>Your Payable Statutory Fee:</strong> ₹1,600 (Under Patent Rules 2024).
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap justify-end gap-2 border-t border-slate-200 bg-slate-50 p-3">
              <button
                onClick={() => setActiveModal(null)}
                className={cn(ghostBtnCls, "bg-slate-200 px-3 hover:bg-slate-300")}
              >
                Close
              </button>
              <button
                onClick={() => {
                  alert("Form 18A dossier and certificate packet generated.");
                  setActiveModal(null);
                }}
                className={cn(solidBtnCls, "px-3")}
              >
                Generate Form 18A Docket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. NBA Form III Checklist Modal */}
      {activeModal === "nba" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full max-h-[85dvh] flex flex-col overflow-hidden border border-slate-200">
            <div className="flex shrink-0 items-center justify-between gap-3 bg-[#00263f] px-4 py-3 text-white">
              <div className="flex min-w-0 items-center gap-2">
                <CheckVerifiedIcon className="w-5 h-5 text-[#FF9933]" />
                <h3 className="min-w-0 text-[15px] font-bold leading-snug">
                  NBA Form III — Prior Approval Pre-Check Protocol
                </h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-300 hover:text-white text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4 text-[12px] text-slate-700 sm:text-[13px]">
              <p className="text-xs text-slate-600 leading-relaxed">
                Under Section 6 of Biological Diversity Act 2002, patent applicants claiming inventions derived from Indian biological material must satisfy all 4 prerequisites:
              </p>

              <div className="space-y-2 text-xs">
                <div className="p-3 bg-slate-50 rounded border border-slate-200 flex items-start gap-2">
                  <input type="checkbox" defaultChecked className="mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800">1. Geographical Sourcing Verification</span>
                    <p className="text-slate-500 text-[12px]">Exact location of herbs/minerals documented with GPS coordinates or APMC mandi record.</p>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded border border-slate-200 flex items-start gap-2">
                  <input type="checkbox" defaultChecked className="mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800">2. State Biodiversity Board (SBB) Intimation</span>
                    <p className="text-slate-500 text-[12px]">Intimation filed under Section 7 for commercial utilization or extraction.</p>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded border border-slate-200 flex items-start gap-2">
                  <input type="checkbox" defaultChecked className="mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800">3. Benefit Sharing Agreement Draft</span>
                    <p className="text-slate-500 text-[12px]">Commitment to deposit 0.1% to 0.5% ex-factory sale price with local Biodiversity Management Committees (BMC).</p>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded border border-slate-200 flex items-start gap-2">
                  <input type="checkbox" defaultChecked className="mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800">4. Form III Application to National Biodiversity Authority, Chennai</span>
                    <p className="text-slate-500 text-[12px]">Application submitted before the grant of Indian Patent Office specification.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap justify-end gap-2 border-t border-slate-200 bg-slate-50 p-3">
              <button
                onClick={() => setActiveModal(null)}
                className={cn(ghostBtnCls, "bg-slate-200 px-3 hover:bg-slate-300")}
              >
                Close
              </button>
              <button
                onClick={() => {
                  alert("NBA Form III checklist exported as compliance dossier.");
                  setActiveModal(null);
                }}
                className={cn(solidBtnCls, "px-3")}
              >
                Export Compliance Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. TKDL Citation Rules Modal */}
      {activeModal === "tkdl_rules" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[85dvh] flex flex-col overflow-hidden border border-slate-200">
            <div className="flex shrink-0 items-center justify-between gap-3 bg-[#00263f] px-4 py-3 text-white">
              <div className="flex min-w-0 items-center gap-2">
                <BookIcon className="w-5 h-5 text-[#FF9933]" />
                <h3 className="min-w-0 text-[15px] font-bold leading-snug">
                  TKDL Accession Protocol v4.1 & Examination Norms
                </h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-300 hover:text-white text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4 text-[12px] text-slate-700 sm:text-[13px]">
              <p className="text-xs text-slate-600">
                Official protocol for addressing patent examiner citations quoting classical Sanskrit, Arabic, or Tamil digitized treatises:
              </p>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded text-xs space-y-2">
                <div className="font-bold text-[#00263f]">Primary Classical Text Concordance:</div>
                <ul className="list-disc pl-4 space-y-1 text-slate-700">
                  <li><strong>Charaka Samhita:</strong> Cites under Sutrasthana & Chikitsasthana (A61K 36/00).</li>
                  <li><strong>Sushruta Samhita:</strong> Cites under Sharirasthana & Uttaratantra.</li>
                  <li><strong>Ashtanga Hridaya & Ashtanga Sangraha:</strong> Vagbhata formulations.</li>
                  <li><strong>Rasataringini & Bhasma treatise:</strong> Mineralo-metallic preparations (A61K 33/00).</li>
                </ul>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs">
                <div className="font-bold text-amber-900 mb-1">How to Overcome a Section 3(p) TKDL Rejection:</div>
                <ol className="list-decimal pl-4 space-y-1 text-slate-700">
                  <li>Demonstrate non-obvious synergistic therapeutic efficacy (Chou-Talalay Combination Index &lt; 1).</li>
                  <li>Establish isolated novel chemical fraction with distinct HPLC fingerprint not achievable via classical kwatha/churna.</li>
                  <li>Provide stability or bioavailability enhancement data beyond classical preparation shelf-life.</li>
                </ol>
              </div>
            </div>

            <div className="flex shrink-0 justify-end border-t border-slate-200 bg-slate-50 p-3">
              <button
                onClick={() => setActiveModal(null)}
                className={cn(solidBtnCls, "px-3")}
              >
                Close Protocol
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Interactive Concordance Modal */}
      {activeModal === "concordance" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[85dvh] flex flex-col overflow-hidden border border-slate-200">
            <div className="flex shrink-0 items-center justify-between gap-3 bg-[#00263f] px-4 py-3 text-white">
              <div className="flex min-w-0 items-center gap-2">
                <TreeIcon className="w-5 h-5 text-[#FF9933]" />
                <h3 className="min-w-0 text-[15px] font-bold leading-snug sm:text-[16px]">
                  AYUSH Classical Concordat Concordance (1,480 Formulations Index)
                </h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-300 hover:text-white text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="shrink-0 border-b border-slate-200 p-3">
              <input
                type="text"
                value={concordanceSearch}
                onChange={(e) => setConcordanceSearch(e.target.value)}
                placeholder="Filter by formulation name (Triphala, Ashwagandha, Trikatu…)"
                className={cn(fieldCls, "w-full px-3")}
              />
            </div>

            {/* The five-column concordance can't fit a phone, so it scrolls
                sideways inside the modal instead of squashing every cell. */}
            <div className="min-h-0 flex-1 overflow-auto p-4">
              <table className="w-full min-w-[620px] border-collapse text-left text-[12px]">
                <thead>
                  <tr className="border-b bg-slate-100 text-slate-600">
                    <th className="p-2 font-semibold">Formulation</th>
                    <th className="p-2 font-semibold">Classical Treatise</th>
                    <th className="p-2 font-semibold">IPC Code</th>
                    <th className="p-2 font-semibold">Sec 3(p) Scrutiny</th>
                    <th className="p-2 font-semibold">Schedule I Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { name: "Chyawanprash Rasayana", text: "Charaka Samhita Chikitsa 1.1", ipc: "A61K 36/48", stat: "Absolute Bar without Synergism", sch: "Listed (Ayurvedic Formulary of India)" },
                    { name: "Triphala Churna", text: "Sushruta Samhita Sutra 38", ipc: "A61K 36/185", stat: "Strict Prior Art Bar", sch: "Listed (AFI Part I)" },
                    { name: "Trikatu Churna", text: "Ashtanga Hridaya Sutra 6", ipc: "A61K 36/906", stat: "Bio-enhancer Patentable if Proven", sch: "Listed" },
                    { name: "Ashwagandharishta", text: "Bhaishajya Ratnavali", ipc: "A61K 36/81", stat: "Fermentation Process Prior Art", sch: "Listed" },
                    { name: "Maha Sudarshana Churna", text: "Sharangadhara Samhita", ipc: "A61K 36/00", stat: "Strict Admixture Bar", sch: "Listed" },
                    { name: "Brahma Rasayana", text: "Charaka Samhita Chikitsa 1", ipc: "A61K 36/73", stat: "Prior Art Defense Required", sch: "Listed" },
                  ]
                    .filter((row) =>
                      concordanceSearch.trim() === "" ||
                      row.name.toLowerCase().includes(concordanceSearch.toLowerCase()) ||
                      row.text.toLowerCase().includes(concordanceSearch.toLowerCase())
                    )
                    .map((row) => (
                      <tr key={row.name} className="hover:bg-slate-50">
                        <td className="p-2 font-bold text-[#00263f]">{row.name}</td>
                        <td className="p-2 text-slate-600">{row.text}</td>
                        <td className="p-2 font-mono text-slate-500">{row.ipc}</td>
                        <td className="p-2">
                          <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 text-[12px] font-semibold">
                            {row.stat}
                          </span>
                        </td>
                        <td className="p-2 text-slate-600">{row.sch}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            <div className="flex shrink-0 justify-end border-t border-slate-200 bg-slate-50 p-3">
              <button
                onClick={() => setActiveModal(null)}
                className={cn(solidBtnCls, "px-3")}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
