"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";

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

function ChevronDownIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
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

  const totalVisibleItems = filteredDirectives.length + filteredForms.length;

  return (
    <div className="w-full min-h-[calc(100vh-95px)] bg-[#F4F6F9] text-[#111c2d]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* ── Top Notification Toast ────────────────────────────────────── */}
        {syncToast && (
          <div className="bg-[#00263f] text-white px-4 py-2.5 rounded-lg shadow-lg border border-slate-700 flex items-center justify-between animate-fade-in text-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#138808] animate-ping" />
              <span>{syncToast}</span>
            </div>
            <button
              onClick={() => setSyncToast(null)}
              className="text-slate-400 hover:text-white ml-4 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* ── Section 1: Top Statutory Intelligence Header ───────────────── */}
        <section className="relative overflow-hidden bg-white rounded-xl p-5 sm:p-7 border border-slate-200/80 shadow-sm">
          {/* Subtle architectural background watermark */}
          <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-[#00263f]/5 pointer-events-none blur-2xl" />

          {/* National Tricolor Accent Bar */}
          <div className="flex h-[3px] rounded-full mb-4 overflow-hidden w-28">
            <div className="w-1/3 bg-[#FF9933]" />
            <div className="w-1/3 bg-slate-200" />
            <div className="w-1/3 bg-[#138808]" />
          </div>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#00263f] text-white text-[11px] font-semibold tracking-wider">
                  <CheckVerifiedIcon className="w-3.5 h-3.5 text-[#FF9933]" />
                  OFFICIAL STATUTORY GAZETTE REGISTRY
                </span>
                <span className="text-slate-500 text-xs font-semibold tracking-wider">
                  CGPDTM • MIN OF AYUSH
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-bold text-[#00263f] tracking-tight leading-tight">
                Latest Rules, Regulations & Statutory Forms
              </h1>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Authoritative legal repository of the Indian Patents Act (1970), Patent Rules 2003 (as amended 2024), TKDL Prior Art Citation Guidelines, and National Biodiversity Authority (NBA) statutory compliance protocols.
              </p>
            </div>

            {/* Action Buttons: Live Sync & Export Digest */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 self-start shrink-0">
              <button
                type="button"
                onClick={handleLiveSync}
                disabled={isSyncing}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#00263f] font-semibold text-sm transition-colors border border-slate-200 shadow-sm"
              >
                <SyncIcon className={`w-4 h-4 ${isSyncing ? "animate-spin text-[#FF9933]" : "text-slate-600"}`} />
                <span>{isSyncing ? "Syncing..." : "IPO Sync Live"}</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#00263f] hover:bg-[#001d32] text-white font-semibold text-sm transition-colors shadow-sm"
              >
                <DownloadIcon className="w-4 h-4 text-[#FF9933]" />
                <span>Export Regulatory Digest (PDF)</span>
              </button>
            </div>
          </div>

          {/* Search & Jurisdiction Filter Bar */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mt-6 pt-5 border-t border-slate-100">
            {/* Search Input */}
            <div className="md:col-span-6 relative flex items-center">
              <SearchIcon className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
              <input
                id="statutory-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Rule number, Section (e.g. 3(p), 3(e)), Gazette notification, or Form ID..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#F4F6F9] text-[#111c2d] text-sm rounded-lg border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00263f] transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Jurisdiction Dropdown */}
            <div className="md:col-span-4 relative flex items-center">
              <BankIcon className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
              <select
                value={selectedJurisdiction}
                onChange={(e) => setSelectedJurisdiction(e.target.value as JurisdictionType)}
                className="w-full pl-10 pr-9 py-2.5 bg-[#F4F6F9] text-[#111c2d] text-sm rounded-lg border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00263f] appearance-none cursor-pointer"
              >
                <option value="all">Jurisdiction: All (IPO, WIPO & Ayush)</option>
                <option value="ipo">Indian Patent Office (IPO / CGPDTM)</option>
                <option value="ayush">Ministry of Ayush Regulatory Board</option>
                <option value="nba">National Biodiversity Authority (NBA)</option>
                <option value="pct">WIPO / Patent Cooperation Treaty (PCT)</option>
              </select>
              <ChevronDownIcon className="w-4 h-4 absolute right-3 text-slate-400 pointer-events-none" />
            </div>

            {/* Reset Filters */}
            <div className="md:col-span-2 flex items-center">
              <button
                type="button"
                id="clear-search-btn"
                onClick={handleResetFilters}
                className="w-full py-2.5 px-3 rounded-lg bg-[#F4F6F9] hover:bg-slate-200 text-slate-700 font-semibold text-sm text-center transition-colors border border-slate-200"
              >
                Reset Filters
              </button>
            </div>
          </div>

          {/* Quick Statistics / Compliance Pills Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mt-4 pt-2">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[#f0f3ff] border border-blue-100/80">
              <div className="w-8 h-8 rounded bg-[#00263f] flex items-center justify-center shrink-0">
                <GavelIcon className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-[#00263f] truncate">
                  Patents (Amendment) Rules 2024
                </div>
                <div className="text-[11px] text-slate-600 truncate">
                  Active Gazette • In Effect 15-Mar-2024
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-[#eaf7eb] border border-green-100/80">
              <div className="w-8 h-8 rounded bg-[#2a6b2c] flex items-center justify-center shrink-0">
                <PharmacyIcon className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-[#00263f] truncate">
                  Sec 3(p) Strict Scrutiny v2.4
                </div>
                <div className="text-[11px] text-slate-600 truncate">
                  TKDL Prior Art Cross-Check Mandatory
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-[#e7eeff] border border-blue-100/80">
              <div className="w-8 h-8 rounded bg-[#002855] flex items-center justify-center shrink-0">
                <DocumentIcon className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-[#00263f] truncate">
                  14 Statutory Forms Pre-filled
                </div>
                <div className="text-[11px] text-slate-600 truncate">
                  Form 3, 18A, 27 & NBA Form III ready
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-[#eaf7eb] border border-green-100/80">
              <div className="w-8 h-8 rounded bg-[#138808] flex items-center justify-center shrink-0">
                <CloudSyncIcon className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-[#00263f] truncate">
                  Sync: {lastSyncTime} IST
                </div>
                <div className="text-[11px] text-slate-600 truncate">
                  IPO E-Gazette Direct Feeds Online
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Section 2: Segmented Filter Control Navigation ────────────── */}
        <div className="flex items-center overflow-x-auto no-scrollbar gap-2 pb-1">
          <button
            type="button"
            onClick={() => setActiveCategory("all")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all shadow-sm ${
              activeCategory === "all"
                ? "bg-[#00263f] text-white"
                : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"
            }`}
          >
            All Statutory Items ({totalVisibleItems})
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory("rules")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all shadow-sm ${
              activeCategory === "rules"
                ? "bg-[#00263f] text-white"
                : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"
            }`}
          >
            Patent Rules & Amendments (8)
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory("tkdl")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all shadow-sm ${
              activeCategory === "tkdl"
                ? "bg-[#00263f] text-white"
                : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"
            }`}
          >
            TKDL & Classical Formulations (6)
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory("section3")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all shadow-sm ${
              activeCategory === "section3"
                ? "bg-[#00263f] text-white"
                : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"
            }`}
          >
            Section 3(p) & 3(e) Directives (5)
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory("forms")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all shadow-sm ${
              activeCategory === "forms"
                ? "bg-[#00263f] text-white"
                : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"
            }`}
          >
            Statutory Forms & Templates (9)
          </button>
        </div>

        {/* ── Section 3: Prominent Featured Gazette Alert Card ───────────── */}
        {(activeCategory === "all" || activeCategory === "rules") && (
          <section className="relative overflow-hidden bg-[#00263f] rounded-xl p-6 sm:p-7 text-white shadow-md">
            {/* Saffron left accent bar */}
            <div className="absolute top-0 left-0 bottom-0 w-2 bg-[#FF9933]" />

            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 pl-2">
              <div className="max-w-4xl">
                <div className="flex flex-wrap items-center gap-2 mb-2.5">
                  <span className="px-2.5 py-0.5 rounded bg-[#692100] text-[#ff7d49] text-[11px] font-bold uppercase tracking-wider">
                    CRITICAL LEGISLATIVE UPDATE
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white/10 text-blue-200 font-mono text-[11px]">
                    Notification No. G.S.R. 200(E) • DIPP / CGPDTM
                  </span>
                  <span className="text-slate-300 text-xs">Published: 15 March 2024</span>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Patents (Amendment) Rules, 2024 — Operational Restructuring
                </h2>

                <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                  Significant amendments promulgated for patent prosecution timelines in India. Direct impact on Ayush phytopharmaceutical patenting: streamlined timeline for filing First Examination Report (FER) responses reduced to 3 months (extendable by 2 months), revised Form 3 foreign filing disclosure mechanism, mandatory cross-referencing against CSIR-TKDL repository, and modified Form 27 working statements.
                </p>

                {/* 3 Highlight sub-boxes */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                  <div className="p-3 rounded-lg bg-[#002855]/80 border border-blue-900/50">
                    <div className="flex items-center gap-2 text-[#FF9933] text-xs font-bold">
                      <ScheduleIcon className="w-4 h-4 shrink-0" />
                      <span>FER Response Window</span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1">
                      Response interval shortened under Rule 24B with revised condonation fees.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-[#002855]/80 border border-blue-900/50">
                    <div className="flex items-center gap-2 text-[#FF9933] text-xs font-bold">
                      <CheckVerifiedIcon className="w-4 h-4 shrink-0" />
                      <span>Form 3 Simplified Duty</span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1">
                      Controller now responsible for public database retrieval; applicant assists on request.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-[#002855]/80 border border-blue-900/50">
                    <div className="flex items-center gap-2 text-[#FF9933] text-xs font-bold">
                      <ShieldIcon className="w-4 h-4 shrink-0" />
                      <span>TKDL Section 3(p) Scrutiny</span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1">
                      Binding examination standard for ASU synergy and traditional formulations.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons on the Alert Card */}
              <div className="flex flex-col sm:flex-row xl:flex-col gap-2 shrink-0 self-start xl:self-center">
                <button
                  type="button"
                  onClick={() => setActiveModal("gazette")}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#FF9933] hover:bg-[#e08528] text-slate-900 font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"
                >
                  <DocumentIcon className="w-4 h-4" />
                  <span>View Gazette PDF (Bilingual)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    router.push("/chat?prompt=" + encodeURIComponent("Analyze the impact of Patents (Amendment) Rules 2024 on Ayush herbal patents, focusing on Rule 24B FER timelines and Section 3(p) objections."));
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#0b3c5d] hover:bg-[#195280] text-white font-semibold text-xs transition-colors border border-blue-800 shadow-sm"
                >
                  <SparklesIcon className="w-4 h-4 text-[#FF9933]" />
                  <span>Analyze Impact on Ayush Filings</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveModal("gazette")}
                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 hover:text-white transition-colors"
                >
                  <span>⇄ Compare with 2003 Rules</span>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ── Section 4: Two-Column Responsive Content Grid ──────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* Column A (7 cols): Recent Statutory Notifications & Directives */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2">
                <GavelIcon className="w-5 h-5 text-[#2a6b2c]" />
                <h3 className="text-lg font-bold text-[#00263f]">
                  Recent Statutory Notifications & Directives
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-slate-500 bg-white px-2.5 py-0.5 rounded border border-slate-200">
                Updated Weekly
              </span>
            </div>

            {filteredDirectives.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center text-slate-500 border border-slate-200">
                No statutory directives match your current filters.
              </div>
            ) : (
              filteredDirectives.map((item) => (
                <article
                  key={item.id}
                  className="p-5 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden border border-slate-200"
                >
                  {/* Left colored border accent */}
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                      item.id === "asu-guidelines-2024"
                        ? "bg-[#138808]"
                        : item.id === "nba-form-iii"
                        ? "bg-[#FF9933]"
                        : "bg-[#000080]"
                    }`}
                  />

                  <div className="flex flex-col gap-2 pl-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${item.badgeColor}`}>
                          {item.badge}
                        </span>
                        <span className="text-xs text-slate-500 font-mono">{item.ref}</span>
                      </div>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <CalendarIcon className="w-3.5 h-3.5" />
                        {item.date}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-[#00263f] mt-1 leading-snug">
                      {item.title}
                    </h4>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {item.description}
                    </p>

                    {item.subBox && (
                      <div className="flex items-center gap-2 p-2.5 rounded bg-slate-50 border border-slate-100 mt-1 text-xs text-slate-700">
                        <CheckVerifiedIcon className="w-4 h-4 text-[#138808] shrink-0" />
                        <span>{item.subBox}</span>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between pt-2 mt-1 border-t border-slate-100 gap-2">
                      <div className="flex items-center gap-1.5">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 bg-[#e7eeff] text-[#00263f] rounded"
                          >
                            🔖 {tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (item.id === "nba-form-iii") setActiveModal("nba");
                            else if (item.id === "tkdl-protocol-v4") setActiveModal("tkdl_rules");
                            else setActiveModal("gazette");
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-[#00263f] text-xs font-semibold transition-colors"
                        >
                          <DownloadIcon className="w-3.5 h-3.5" />
                          <span>{item.docSize}</span>
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
                          className="flex items-center gap-1 px-3 py-1.5 rounded bg-[#00263f] text-white text-xs font-semibold hover:bg-[#001d32] transition-colors"
                        >
                          {item.actionType === "explain" && (
                            <>
                              <SparklesIcon className="w-3.5 h-3.5 text-[#FF9933]" />
                              <span>Ask IP-SAKTI to Explain</span>
                            </>
                          )}
                          {item.actionType === "checklist" && (
                            <>
                              <CheckVerifiedIcon className="w-3.5 h-3.5 text-[#FF9933]" />
                              <span>Pre-check Docket</span>
                            </>
                          )}
                          {item.actionType === "citation" && (
                            <>
                              <BookIcon className="w-3.5 h-3.5 text-[#FF9933]" />
                              <span>Citation Rules</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>

          {/* Column B (5 cols): Statutory Forms & Filing Templates */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2">
                <DocumentIcon className="w-5 h-5 text-[#2a6b2c]" />
                <h3 className="text-lg font-bold text-[#00263f]">
                  Statutory Forms & Filing Templates
                </h3>
              </div>
              <span className="text-[11px] font-mono font-semibold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                E-Filing v2.0
              </span>
            </div>

            {filteredForms.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center text-slate-500 border border-slate-200">
                No statutory forms match your current filters.
              </div>
            ) : (
              filteredForms.map((item) => (
                <div
                  key={item.id}
                  className="p-5 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-slate-200"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-[#00263f] text-white text-[11px] font-mono font-bold">
                          {item.formNumber}
                        </span>
                        <span className={`text-xs font-bold flex items-center gap-1 ${item.badgeColor}`}>
                          {item.id === "form-3" && <SparklesIcon className="w-3.5 h-3.5" />}
                          {item.id === "form-18a" && <BoltIcon className="w-3.5 h-3.5" />}
                          {item.id === "legal-draft-3p" && <ShieldIcon className="w-3.5 h-3.5" />}
                          {item.badge}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-[#00263f] mt-2">
                        {item.title}
                      </h4>

                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100">
                    <span className="text-[11px] text-slate-400 font-medium">
                      {item.formatOrFee}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (item.id === "form-3") setActiveModal("form3");
                          else if (item.id === "form-18a") setActiveModal("form18a");
                          else setActiveModal("gazette");
                        }}
                        className="p-1.5 rounded bg-slate-100 hover:bg-slate-200 text-[#00263f] transition-colors"
                        title="Download Template"
                      >
                        <DownloadIcon className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (item.id === "form-3") setActiveModal("form3");
                          else if (item.id === "form-18a") setActiveModal("form18a");
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
                        className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                          item.id === "form-3"
                            ? "bg-[#2a6b2c] hover:bg-[#1e5020] text-white"
                            : item.id === "form-18a"
                            ? "bg-[#00263f] hover:bg-[#001d32] text-white"
                            : item.id === "legal-draft-3p"
                            ? "bg-[#00263f] hover:bg-[#001d32] text-white"
                            : "bg-slate-100 hover:bg-slate-200 text-[#00263f]"
                        }`}
                      >
                        {item.actionName}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── Section 5: Statutory Concordance Banner ─────────────────────── */}
        <section className="p-5 sm:p-6 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-[#f0f3ff] text-[#00263f] flex items-center justify-center shrink-0 border border-blue-100">
              <TreeIcon className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-bold text-[#00263f]">
                Indian Patent Office & Ministry of Ayush Concordance Concordat
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                Complete cross-index matching 1,480 AYUSH classical formulations across Section 3(p), Biological Diversity Act Schedule I, and TKDL Digitized Folios.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-stretch sm:self-auto justify-end">
            <button
              type="button"
              onClick={() => setActiveModal("concordance")}
              className="px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#00263f] text-xs font-semibold transition-colors border border-slate-200"
            >
              Interactive Concordance
            </button>
            <a
              href="https://ipindia.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#00263f] text-white text-xs font-semibold hover:bg-[#001d32] transition-colors"
            >
              <SparklesIcon className="w-3.5 h-3.5 text-[#FF9933]" />
              <span>Open Gazette Registry Hub</span>
            </a>
          </div>
        </section>

        {/* ── Section 6: Digital Integrity Verification Seal (Footer) ──────── */}
        <footer className="p-3.5 rounded-lg bg-[#f0f3ff] border border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <CheckVerifiedIcon className="w-4 h-4 text-[#138808] shrink-0" />
            <span>
              Digitally authenticated against official Controller General of Patents, Designs and Trade Marks (CGPDTM) and Ministry of Ayush statutory databases.
            </span>
          </div>
          <div className="font-mono text-[11px] text-slate-500 shrink-0">
            SHA-256: 8f07d2ca9d10e67a7... • NIC Data Center, New Delhi
          </div>
        </footer>

      </div>

      {/* ── MODALS ──────────────────────────────────────────────────────── */}

      {/* 1. Gazette PDF & Clause Comparison Modal */}
      {activeModal === "gazette" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden border border-slate-200">
            <div className="p-5 bg-[#00263f] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DocumentIcon className="w-5 h-5 text-[#FF9933]" />
                <h3 className="font-bold text-base sm:text-lg">
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

            <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-700">
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

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded bg-slate-200 text-slate-700 font-semibold text-xs"
              >
                Close
              </button>
              <button
                onClick={() => {
                  alert("Official bilingual Gazette PDF download initiated.");
                  setActiveModal(null);
                }}
                className="px-4 py-2 rounded bg-[#00263f] text-white font-semibold text-xs flex items-center gap-1.5"
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
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden border border-slate-200">
            <div className="p-5 bg-[#00263f] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DocumentIcon className="w-5 h-5 text-[#2a6b2c]" />
                <h3 className="font-bold text-base">
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

            <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-700">
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

              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <div className="font-bold text-xs text-[#00263f] mb-2">
                  Synchronized Foreign Filings (Docket ID: {form3AppNo}):
                </div>
                <table className="w-full text-[11px] text-left border-collapse">
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

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded bg-slate-200 text-slate-700 font-semibold text-xs"
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
                className="px-4 py-2 rounded bg-[#2a6b2c] hover:bg-[#1e5020] text-white font-semibold text-xs flex items-center gap-1.5"
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
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full max-h-[85vh] flex flex-col overflow-hidden border border-slate-200">
            <div className="p-5 bg-[#00263f] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BoltIcon className="w-5 h-5 text-[#FF9933]" />
                <h3 className="font-bold text-base">
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

            <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-700">
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
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="applicant"
                        checked={applicantType === opt.id}
                        onChange={() => setApplicantType(opt.id as any)}
                      />
                      <span className="font-semibold text-slate-800 text-xs">{opt.label}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-green-700 font-bold text-xs">{opt.fee}</span>
                      <span className="text-[10px] text-slate-400 block">{opt.rebate}</span>
                    </div>
                  </label>
                ))}
              </div>

              <div className="p-3 bg-slate-100 rounded text-xs text-slate-700">
                <strong>Standard Large Entity Fee:</strong> <del>₹8,000</del> → <strong>Your Payable Statutory Fee:</strong> ₹1,600 (Under Patent Rules 2024).
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded bg-slate-200 text-slate-700 font-semibold text-xs"
              >
                Close
              </button>
              <button
                onClick={() => {
                  alert("Form 18A dossier and certificate packet generated.");
                  setActiveModal(null);
                }}
                className="px-4 py-2 rounded bg-[#00263f] text-white font-semibold text-xs"
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
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full max-h-[85vh] flex flex-col overflow-hidden border border-slate-200">
            <div className="p-5 bg-[#00263f] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckVerifiedIcon className="w-5 h-5 text-[#FF9933]" />
                <h3 className="font-bold text-base">
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

            <div className="p-6 overflow-y-auto space-y-3 text-xs sm:text-sm text-slate-700">
              <p className="text-xs text-slate-600 leading-relaxed">
                Under Section 6 of Biological Diversity Act 2002, patent applicants claiming inventions derived from Indian biological material must satisfy all 4 prerequisites:
              </p>

              <div className="space-y-2 text-xs">
                <div className="p-3 bg-slate-50 rounded border border-slate-200 flex items-start gap-2">
                  <input type="checkbox" defaultChecked className="mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800">1. Geographical Sourcing Verification</span>
                    <p className="text-slate-500 text-[11px]">Exact location of herbs/minerals documented with GPS coordinates or APMC mandi record.</p>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded border border-slate-200 flex items-start gap-2">
                  <input type="checkbox" defaultChecked className="mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800">2. State Biodiversity Board (SBB) Intimation</span>
                    <p className="text-slate-500 text-[11px]">Intimation filed under Section 7 for commercial utilization or extraction.</p>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded border border-slate-200 flex items-start gap-2">
                  <input type="checkbox" defaultChecked className="mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800">3. Benefit Sharing Agreement Draft</span>
                    <p className="text-slate-500 text-[11px]">Commitment to deposit 0.1% to 0.5% ex-factory sale price with local Biodiversity Management Committees (BMC).</p>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded border border-slate-200 flex items-start gap-2">
                  <input type="checkbox" defaultChecked className="mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800">4. Form III Application to National Biodiversity Authority, Chennai</span>
                    <p className="text-slate-500 text-[11px]">Application submitted before the grant of Indian Patent Office specification.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded bg-slate-200 text-slate-700 font-semibold text-xs"
              >
                Close
              </button>
              <button
                onClick={() => {
                  alert("NBA Form III checklist exported as compliance dossier.");
                  setActiveModal(null);
                }}
                className="px-4 py-2 rounded bg-[#00263f] text-white font-semibold text-xs"
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
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden border border-slate-200">
            <div className="p-5 bg-[#00263f] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookIcon className="w-5 h-5 text-[#FF9933]" />
                <h3 className="font-bold text-base">
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

            <div className="p-6 overflow-y-auto space-y-3 text-xs sm:text-sm text-slate-700">
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

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded bg-[#00263f] text-white font-semibold text-xs"
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
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col overflow-hidden border border-slate-200">
            <div className="p-5 bg-[#00263f] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TreeIcon className="w-5 h-5 text-[#FF9933]" />
                <h3 className="font-bold text-base sm:text-lg">
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

            <div className="p-5 border-b border-slate-200">
              <input
                type="text"
                value={concordanceSearch}
                onChange={(e) => setConcordanceSearch(e.target.value)}
                placeholder="Filter by formulation name (e.g., Triphala, Ashwagandha, Trikatu, Chyawanprash)..."
                className="w-full px-3 py-2 border rounded-lg border-slate-300 text-xs"
              />
            </div>

            <div className="p-6 overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 border-b">
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
                          <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 text-[10px] font-semibold">
                            {row.stat}
                          </span>
                        </td>
                        <td className="p-2 text-slate-600">{row.sch}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded bg-[#00263f] text-white font-semibold text-xs"
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
