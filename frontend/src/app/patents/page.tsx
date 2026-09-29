"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/interfaces-select";

// ── Inline SVGs for fast, zero-shift rendering ──────────────────────────────
function CheckVerifiedIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
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

function SyncIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
    </svg>
  );
}

function UploadIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
    </svg>
  );
}

function ShieldCheckIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function SearchInsightsIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
      <path d="M11 8v6M8 11h6" />
    </svg>
  );
}

function BiotechIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3h6M10 9h4M10 3v6l-4 8a2 2 0 0 0 1.8 2.9h8.4a2 2 0 0 0 1.8-2.9L14 9V3" />
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

function PdfDocIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="M9 13h6M9 17h6" />
    </svg>
  );
}

function LockIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

interface BotanicalTag {
  id: string;
  name: string;
  color: string;
}

export default function PatentsPage() {
  const router = useRouter();

  // Active Tab: formulation vs boolean
  const [activeTab, setActiveTab] = useState<"formulation" | "boolean">("formulation");

  // Formulation Inputs
  const [productTitle, setProductTitle] = useState(
    "Synergistic Ashwagandha-Curcumin Anti-Arthritic Topical Emulgel"
  );
  const [dosageForm, setDosageForm] = useState("Emulgel / Hydrogel Topical Matrix");
  const [therapeuticUtility, setTherapeuticUtility] = useState(
    "Alleviation of osteoarthritic synovial inflammation, chondroprotection, and cartilage matrix regeneration via NF-kB downregulation."
  );

  // Botanical Tags
  const [botanicalTags, setBotanicalTags] = useState<BotanicalTag[]>([
    { id: "1", name: "Withania somnifera (Ashwagandha - 5% Withanolides)", color: "bg-[#1B5E20]" },
    { id: "2", name: "Curcuma longa (Curcumin - 95% Curcuminoids)", color: "bg-[#E65100]" },
    { id: "3", name: "Piper nigrum (Piperine - 98% Bio-enhancer)", color: "bg-[#000080]" },
  ]);
  const [newTagInput, setNewTagInput] = useState("");

  // Scan State
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(true);

  // Modals
  const [activeModal, setActiveModal] = useState<
    "fto" | "claims_matrix" | "form7a" | "us_wrapper" | "upload" | null
  >(null);

  // Add Tag
  const handleAddTag = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newTagInput.trim()) return;
    setBotanicalTags((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: newTagInput.trim(),
        color: "bg-[#00263f]",
      },
    ]);
    setNewTagInput("");
  };

  const handleRemoveTag = (id: string) => {
    setBotanicalTags((prev) => prev.filter((t) => t.id !== id));
  };

  // Trigger Scan
  const handleScan = () => {
    setIsScanning(true);
    setScanComplete(false);
    setTimeout(() => {
      setIsScanning(false);
      setScanComplete(true);
      // Land on the verdict deck, not past it in the ranked hits.
      const resultsEl =
        document.getElementById("scan-verdict") ||
        document.getElementById("search-results-matrix");
      if (resultsEl) {
        resultsEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 1000);
  };

  // Plain page flow — no forced viewport-height sections. Each block is only
  // as tall as its content, and blocks that hold a lot of content spread
  // across columns instead of stacking into a narrow, gappy column.
  const deck = "flex min-w-0 flex-col gap-3";

  return (
    <div className="w-full min-h-[calc(100vh-95px)] bg-[#F4F6F9] text-[#111c2d]">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4 px-3 py-4 sm:px-5 lg:px-6">

      {/* ═══ Scan — header, mode tabs, console ═══════════════════════════ */}
      <section className={deck}>
        {/* ── Compact Page Header & Sovereign Action Bar ────────────────── */}
        <header className="flex shrink-0 flex-wrap items-start justify-between gap-x-4 gap-y-2">
          <div className="min-w-0 flex-1 space-y-1">
            <h1 className="text-lg font-bold tracking-tight text-[#00263f] sm:text-xl xl:text-2xl">
              Patent Database & Search Engine
            </h1>

            <p className="max-w-4xl text-[11px] leading-snug text-slate-600 line-clamp-2 sm:text-xs">
              Screen your Ayurvedic formulation, herbal composition, or bioactive extract against active patent applications, granted patents (IPO, USPTO, EPO, WIPO), and Traditional Knowledge prior art to evaluate novelty and Section 3(p) statutory patentability.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex min-w-0 flex-wrap items-center gap-1.5 lg:shrink-0">
            <button
              type="button"
              onClick={() => alert("Connecting to IPO e-Gazette Bulk Docket stream...")}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-[#00263f] shadow-sm transition-colors hover:bg-slate-100"
            >
              <SyncIcon className="w-3.5 h-3.5 text-[#00263f]" />
              <span>Bulk Docket Sync</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveModal("upload")}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-[#00263f] shadow-sm transition-colors hover:bg-slate-100"
            >
              <UploadIcon className="w-3.5 h-3.5 text-[#E65100]" />
              <span>Upload Spec (.XML / .PDF)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveModal("fto")}
              className="inline-flex items-center gap-1.5 rounded-md bg-[#2a6b2c] px-2.5 py-1.5 text-[11px] font-bold text-white shadow-sm transition-colors hover:bg-[#1e5020]"
            >
              <ShieldCheckIcon className="w-3.5 h-3.5" />
              <span>Generate FTO Report</span>
            </button>
          </div>
        </header>

        {/* ── Dual Mode Navigation + Provenance Badges ──────────────────── */}
        <div className="flex shrink-0 flex-wrap items-center gap-x-2 gap-y-1.5 rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
          <nav aria-label="Patent search mode" className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab("formulation")}
              aria-pressed={activeTab === "formulation"}
              className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1.5 text-[11px] font-semibold transition-all ${
                activeTab === "formulation"
                  ? "bg-[#0b3c5d] text-white shadow-sm"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <BiotechIcon className="w-3.5 h-3.5" />
              <span>Formulation &amp; Composition Matcher</span>
              <span className="hidden rounded bg-[#FF9933] px-1 py-0.5 text-[9px] font-bold text-slate-900 sm:inline-block">
                RECOMMENDED
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("boolean")}
              aria-pressed={activeTab === "boolean"}
              className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1.5 text-[11px] font-semibold transition-all ${
                activeTab === "boolean"
                  ? "bg-[#0b3c5d] text-white shadow-sm"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <SearchInsightsIcon className="w-3.5 h-3.5" />
              <span>Advanced Boolean / IPC Gazette Search</span>
              <span className={`hidden font-mono text-[9px] md:inline ${activeTab === "boolean" ? "text-blue-200" : "text-slate-400"}`}>
                Class A61K 36/00
              </span>
            </button>
          </nav>

          <div className="flex min-w-0 flex-wrap items-center gap-1.5 px-1 sm:ml-auto">
            <span className="inline-flex items-center gap-1 rounded bg-[#EEF3F8] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#00263f]">
              <CheckVerifiedIcon className="w-3 h-3 shrink-0 text-[#FF9933]" />
              Official Patent Gazette &amp; Prior Art Clearance • CGPDTM / IPO &amp; WIPO Concordance
            </span>
            <span className="inline-flex items-center gap-1 rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-800">
              <GavelIcon className="w-3 h-3 shrink-0" />
              Patent Act 1970 / Section 3(p) &amp; 3(e) Verification Engine
            </span>
          </div>
        </div>

        {/* ── Tab 1: Product Formulation Console ─────────────────────────── */}
        {activeTab === "formulation" && (
          <section className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
            {/* Panel header */}
            <div className="flex shrink-0 flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b border-slate-100 pb-1.5">
              <div className="flex min-w-0 items-center gap-2">
                <span className="h-5 w-[3px] shrink-0 rounded-full bg-[#FF9933]" />
                <h2 className="line-clamp-2 text-xs font-bold text-[#00263f] sm:text-sm 2xl:line-clamp-1">
                  Check Your Product For Existing Patents &amp; Classical Prior Art
                </h2>
                <span className="hidden truncate text-[10px] text-slate-500 xl:inline">
                  4.8M patent claims · 78,000+ TKDL medicinal formulations
                </span>
              </div>

              <span className="inline-flex shrink-0 items-center gap-1 rounded bg-[#EEF3F8] px-1.5 py-0.5 text-[10px] font-semibold text-[#00263f]">
                <CheckVerifiedIcon className="w-3 h-3 shrink-0 text-[#1B5E20]" />
                IPO Gazette Sync: Weekly Bulletin v2024.36
              </span>
            </div>

            {/* Input Grid */}
            <div className="grid grid-cols-1 gap-2 lg:grid-cols-12">
              {/* Product Working Title */}
              <div className="flex min-w-0 flex-col justify-center space-y-1 lg:col-span-8">
                <label className="flex items-center justify-between gap-2 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                  <span>Product / Formulation Working Title <span className="text-red-500">*</span></span>
                  <span className="hidden font-normal normal-case tracking-normal text-slate-400 sm:block">
                    Standard INN / Ayush Nomenclature
                  </span>
                </label>
                <div className="relative flex items-center">
                  <span className="pointer-events-none absolute left-2.5 text-xs">💊</span>
                  <input
                    type="text"
                    value={productTitle}
                    onChange={(e) => setProductTitle(e.target.value)}
                    className="h-8 w-full rounded-md border border-slate-200 bg-[#F4F6F9] pl-8 pr-2.5 text-xs text-[#00263f] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00263f]"
                  />
                </div>
              </div>

              {/* Dosage Form */}
              <div className="flex min-w-0 flex-col justify-center space-y-1 lg:col-span-4">
                <label htmlFor="dosageForm" className="block text-[10px] font-bold uppercase tracking-wide text-slate-500">
                  Formulation Type / Dosage Form <span className="text-red-500">*</span>
                </label>
                <Select value={dosageForm} onValueChange={setDosageForm}>
                  <SelectTrigger
                    id="dosageForm"
                    size="sm"
                    className="w-full rounded-md border-slate-200 bg-[#F4F6F9] text-xs text-slate-800 data-[state=open]:bg-white"
                  >
                    <SelectValue placeholder="Select dosage form" />
                  </SelectTrigger>
                  <SelectContent className="[&_[data-slot=select-item]]:text-xs">
                    <SelectItem value="Emulgel / Hydrogel Topical Matrix">Emulgel / Hydrogel Topical Matrix</SelectItem>
                    <SelectItem value="Tablet / Vati / Gutika">Tablet / Vati / Gutika</SelectItem>
                    <SelectItem value="Medicated Oil / Ghrita / Taila">Medicated Oil / Ghrita / Taila</SelectItem>
                    <SelectItem value="Phytosomal Nano-dispersion">Phytosomal Nano-dispersion</SelectItem>
                    <SelectItem value="Liquid Extract / Asava-Arishta">Liquid Extract / Asava-Arishta</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Botanical Ingredients Tag Field */}
              <div className="flex min-w-0 flex-col gap-1 lg:col-span-12">
                <div className="flex shrink-0 flex-wrap items-center justify-between gap-x-2 gap-y-0.5">
                  <label className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                    <span>Botanical Ingredients &amp; Bioactive Standardization Markers</span>
                    <span className="cursor-help text-slate-400" title="Quantified bioactives critical for Section 3(e) evaluation">ℹ️</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="text-[10px] font-bold text-[#00263f] hover:text-[#001d32]"
                  >
                    + Add Herb / Excipient
                  </button>
                </div>

                <div className="flex min-w-0 flex-wrap items-center gap-1 rounded-md border border-slate-200 bg-[#F4F6F9] p-1.5">
                  {botanicalTags.map((tag) => (
                    <span
                      key={tag.id}
                      className="inline-flex max-w-full items-center gap-1.5 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-[#00263f] shadow-sm"
                    >
                      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${tag.color}`} />
                      <span className="truncate">{tag.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag.id)}
                        aria-label={`Remove ${tag.name}`}
                        className="shrink-0 font-bold text-slate-400 hover:text-red-600"
                      >
                        ✕
                      </button>
                    </span>
                  ))}

                  <input
                    type="text"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="Botanical name or CAS No, then Enter..."
                    className="min-w-[9rem] flex-1 bg-transparent px-1 py-0.5 text-[11px] text-slate-700 placeholder-slate-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Claimed Utility */}
              <div className="flex min-w-0 flex-col gap-1 lg:col-span-6">
                <label className="shrink-0 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                  Intended Therapeutic Indication / Claimed Utility
                </label>
                <textarea
                  value={therapeuticUtility}
                  onChange={(e) => setTherapeuticUtility(e.target.value)}
                  rows={2}
                  className="min-h-[58px] w-full resize-none rounded-md border border-slate-200 bg-[#F4F6F9] p-2 text-[11px] leading-snug text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00263f]"
                />
              </div>

              {/* Extraction Chemistry */}
              <div className="flex min-w-0 flex-col gap-1 lg:col-span-6">
                <label className="shrink-0 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                  Extraction Chemistry &amp; Claimed Synergy
                </label>
                <div className="space-y-1 rounded-md border border-slate-200 bg-[#EEF3F8] p-2">
                  {[
                    ["Solvent Ratio:", "Hydro-ethanolic (60:40 v/v)", "text-[#00263f]"],
                    ["Synergistic Index (CI):", "1.42 (Combination Index)", "text-[#1B5E20]"],
                    ["Bioavailability Mod:", "12.4x Piperine boost", "text-slate-700"],
                  ].map(([k, v, cls]) => (
                    <div key={k} className="flex items-baseline justify-between gap-2 text-[11px]">
                      <span className="shrink-0 text-slate-500">{k}</span>
                      <span className={`text-right font-mono font-bold ${cls}`}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Target Patent Jurisdictions */}
              <div className="flex min-w-0 flex-col justify-center lg:col-span-12">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 rounded-md border border-blue-100 bg-blue-50/70 p-2">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-[#00263f]">
                    Target Repositories &amp; Gazette Sources:
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {[
                      { short: "IPO / CGPDTM", full: "Indian Patent Office (IPO / CGPDTM)", checked: true, accent: "#00263f" },
                      { short: "WIPO Patentscope", full: "WIPO (Patentscope & PCT)", checked: true, accent: "#00263f" },
                      { short: "USPTO", full: "USPTO (US Patents & Pre-Grant Publications)", checked: true, accent: "#00263f" },
                      { short: "EPO Espacenet", full: "EPO (Espacenet)", checked: true, accent: "#00263f" },
                      { short: "CNIPA", full: "CNIPA (China National IP Administration)", checked: false, accent: "#00263f" },
                      { short: "TKDL Classical Vedas", full: "TKDL Classical Veda Repositories", checked: true, accent: "#1B5E20" },
                    ].map((repo) => (
                      <label
                        key={repo.short}
                        title={repo.full}
                        className={`inline-flex cursor-pointer items-center gap-1 whitespace-nowrap rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] shadow-sm ${
                          repo.accent === "#1B5E20" ? "font-bold text-[#1B5E20]" : "text-slate-700"
                        }`}
                      >
                        <input type="checkbox" defaultChecked={repo.checked} className="h-3 w-3" style={{ accentColor: repo.accent }} />
                        <span>{repo.short}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Scan Action Row */}
            <div className="flex shrink-0 flex-wrap items-center justify-between gap-x-3 gap-y-1.5 border-t border-slate-100 pt-2">
              <div className="flex min-w-0 items-center gap-1.5 text-[10px] text-slate-500">
                <LockIcon className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                <span>Queries executed under Ministry of Ayush SAKTI Secure Sandbox. Strictly privileged.</span>
              </div>

              <button
                type="button"
                id="scan-action-btn"
                onClick={handleScan}
                disabled={isScanning}
                className="inline-flex w-full min-w-0 items-center justify-center gap-1.5 rounded-md bg-[#00263f] px-3.5 py-2 text-center text-[11px] font-bold uppercase tracking-wide text-white shadow-md transition-all hover:bg-[#001d32] active:scale-[0.99] disabled:opacity-70 sm:w-auto"
              >
                {isScanning ? (
                  <>
                    <SyncIcon className="w-3.5 h-3.5 animate-spin text-[#FF9933]" />
                    <span>Scanning IPO, WIPO &amp; TKDL Dockets...</span>
                  </>
                ) : (
                  <>
                    <SearchInsightsIcon className="w-3.5 h-3.5 text-[#FF9933]" />
                    <span>Scan Patent Repositories &amp; Classical Prior Art</span>
                  </>
                )}
              </button>
            </div>
          </section>
        )}

        {/* ── Tab 2: Advanced Boolean Search Console ──────────────────────── */}
        {activeTab === "boolean" && (
          <section className="shrink-0 space-y-2.5 rounded-lg border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
            <div className="flex shrink-0 flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b border-slate-100 pb-2">
              <div className="flex min-w-0 items-center gap-2">
                <span className="h-5 w-[3px] shrink-0 rounded-full bg-[#000080]" />
                <h2 className="line-clamp-2 text-xs font-bold text-[#00263f] sm:text-sm 2xl:line-clamp-1">
                  Official CGPDTM Gazette &amp; Boolean Expression Builder
                </h2>
              </div>
              <span className="shrink-0 font-mono text-[10px] text-slate-500">Standard: ST.36 / XML IPO Schema</span>
            </div>

            <div className="space-y-2.5">
              <div className="space-y-1 rounded-md bg-[#EEF3F8] p-2.5">
                <label className="block text-[10px] font-bold uppercase tracking-wide text-[#00263f]">
                  Gazette Query Syntax
                </label>
                <input
                  type="text"
                  defaultValue='(IPC:"A61K36/81" OR IPC:"A61K36/9066") AND ("Withania" AND "Curcuma") AND NOT APPLICANT:"Ministry of Ayush"'
                  className="h-8 w-full min-w-0 rounded-md border border-slate-200 bg-white px-2.5 font-mono text-[11px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00263f]"
                />
              </div>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                {[
                  { label: "IPC / CPC Classification", value: "A61K 36/00, A61P 19/02" },
                  { label: "Gazette Publication Date Window", value: "2020-01-01 to 2024-10-31" },
                  { label: "Applicant / Assignee Entity", placeholder: "e.g., L'Oreal, Dabur, Patanjali, Pfizer..." },
                ].map((field) => (
                  <div key={field.label} className="min-w-0 space-y-1">
                    <label className="block truncate text-[10px] font-bold uppercase tracking-wide text-slate-500">
                      {field.label}
                    </label>
                    <input
                      type="text"
                      defaultValue={field.value}
                      placeholder={field.placeholder}
                      className="h-8 w-full min-w-0 rounded-md border border-slate-200 bg-[#F4F6F9] px-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00263f]"
                    />
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-t border-slate-100 pt-2.5">
                <div className="flex min-w-0 items-center gap-1.5 text-[10px] text-slate-500">
                  <LockIcon className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                  <span>Queries executed under Ministry of Ayush SAKTI Secure Sandbox. Strictly privileged.</span>
                </div>
                <button
                  type="button"
                  onClick={handleScan}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-[#00263f] px-3.5 py-2 text-[11px] font-bold uppercase tracking-wide text-white shadow-sm transition-colors hover:bg-[#001d32]"
                >
                  <SearchInsightsIcon className="w-3.5 h-3.5 text-[#FF9933]" />
                  Execute Gazette Query
                </button>
              </div>
            </div>
          </section>
        )}
      </section>

      {/* ═══ Verdict — risk call + KPIs beside the classical prior-art hit ══ */}
      {scanComplete && (
        <section
          id="scan-verdict"
          aria-label="Scan verdict and conflict analysis"
          className="grid min-w-0 grid-cols-1 items-start gap-3 xl:grid-cols-[minmax(0,1fr)_23rem]"
        >
            {/* Executive Patentability Summary Card */}
            <section className="shrink-0 space-y-2.5 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex shrink-0 flex-wrap items-center justify-between gap-x-2 gap-y-1 border-b border-slate-100 pb-2">
                <span className="inline-flex items-center gap-1 rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-800">
                  ⚠️ High Prior Art Overlap
                </span>
                <span className="font-mono text-[10px] text-slate-500">#AYU-2024-GAZ-9941</span>
              </div>

              <h3 className="shrink-0 text-base font-bold leading-snug tracking-tight text-[#00263f] sm:text-xl">
                Moderate-to-High Section 3(p) &amp; Section 3(e) Vulnerability (88% Prior Art Overlap)
              </h3>

              <p className="max-w-4xl shrink-0 text-[11px] leading-relaxed text-slate-600 sm:text-xs">
                Statutory objection expected under <strong className="text-[#00263f]">Section 3(p)</strong> (Traditional Knowledge) due to direct concordance with classical Ayurvedic texts, and <strong className="text-[#00263f]">Section 3(e)</strong> (Mere Admixture) unless non-obvious synergistic efficacy is substantiated by clinical combination index data.
              </p>

              {/* Metric KPI Cards */}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  { value: "3", valueCls: "text-red-600", label: "Granted Patents in Conflict", boxCls: "border-slate-200 bg-[#EEF3F8]", labelCls: "text-slate-600" },
                  { value: "5", valueCls: "text-[#E65100]", label: "Pending Gazette Applications", boxCls: "border-slate-200 bg-[#EEF3F8]", labelCls: "text-slate-600" },
                  { value: "4", valueCls: "text-[#000080]", label: "TKDL Classical Citations", boxCls: "border-slate-200 bg-[#EEF3F8]", labelCls: "text-slate-600" },
                  { value: "1", valueCls: "text-[#1B5E20]", label: "Novel Extraction Ground", boxCls: "border-green-200 bg-[#eaf7eb]", labelCls: "text-[#0c5216]" },
                ].map((kpi) => (
                  <div key={kpi.label} className={`rounded-md border p-3 text-center ${kpi.boxCls}`}>
                    <div className={`text-3xl font-bold leading-none ${kpi.valueCls}`}>{kpi.value}</div>
                    <div className={`mt-1.5 text-[10px] font-semibold leading-tight ${kpi.labelCls}`}>
                      {kpi.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Visual Clearance Spectrum Bar */}
              <div className="shrink-0 space-y-2 rounded-md border border-slate-200 bg-slate-50 p-3">
                <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-[#00263f]">
                    📊 Prior Art Density Spectrum
                  </span>
                  <span className="font-mono text-[10px] font-bold text-red-600">
                    Novelty Clearance Score: 12% (Critical Statutory Challenge Zone)
                  </span>
                </div>

                <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full bg-red-600" style={{ width: "62%" }} title="Classical Ayurvedic Prior Art (62%)" />
                  <div className="h-full bg-[#FF9933]" style={{ width: "26%" }} title="Commercial Patent Filings (26%)" />
                  <div className="h-full bg-[#138808]" style={{ width: "12%" }} title="Clear Novel Scope (12%)" />
                </div>

                <div className="grid gap-1.5 text-[10px] font-medium text-slate-500 sm:grid-cols-3">
                  <span className="flex items-start gap-1.5">
                    <span className="mt-0.5 inline-block h-2 w-2 shrink-0 rounded-full bg-red-600" />
                    62% Classical Ayurvedic Formulations (TKDL)
                  </span>
                  <span className="flex items-start gap-1.5">
                    <span className="mt-0.5 inline-block h-2 w-2 shrink-0 rounded-full bg-[#FF9933]" />
                    26% Existing Modern Patent Filings (IPO / WIPO)
                  </span>
                  <span className="flex items-start gap-1.5 font-bold text-[#1B5E20]">
                    <span className="mt-0.5 inline-block h-2 w-2 shrink-0 rounded-full bg-[#138808]" />
                    12% Potentially Novel Scope (Carrier excipient synergy)
                  </span>
                </div>
              </div>
            </section>

            {/* Classical Knowledge Bar (TKDL Concordance Citation) */}
            <section className="flex flex-col rounded-lg border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
              <div className="flex flex-col gap-3">
                <div className="flex min-w-0 items-start gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#00263f] text-white">
                    <BookIcon className="h-4 w-4 text-[#FF9933]" />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                      <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#000080]">
                        TKDL Institutional Concordance
                      </span>
                      <span className="font-mono text-[10px] font-bold text-slate-500">
                        RS/1024 &amp; AK/409
                      </span>
                    </div>

                    <h4 className="text-xs font-bold leading-snug text-[#00263f] sm:text-sm">
                      Charaka Samhita (Chikitsa Sthana 28/45) &amp; Bhavaprakasha Nighantu (Haritakyadi Varga)
                    </h4>

                    <p className="max-w-4xl text-[11px] leading-snug text-slate-600">
                      Exhaustive documentation confirms topical co-application of <em>Ashwagandha</em> (Withania somnifera) and <em>Haridra</em> (Curcuma longa) in lipid carriers for Sandhigata Vata (Arthritis) predating 1000 BCE. Immediate statutory basis for Pre-Grant Opposition under Section 25(1)(d).
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => router.push("/tkdl")}
                  className="mt-auto inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-[#00263f] px-2.5 py-1.5 text-[11px] font-semibold text-white shadow-sm transition-colors hover:bg-[#001d32]"
                >
                  Inspect TKDL Treatises
                </button>
              </div>
            </section>
        </section>
      )}

      {/* ═══ Ranked patent landscape ═══════════════════════════════════ */}
      {scanComplete && (
        <div id="search-results-matrix" className={deck}>

            {/* Detailed Patent Landscape Section */}
            <div className="flex shrink-0 flex-wrap items-end justify-between gap-x-3 gap-y-1.5">
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-[#00263f] sm:text-base">
                  Detailed Patent Landscape &amp; Overlapping Claims
                </h3>
                <p className="text-[11px] text-slate-500">
                  Ranked by claim similarity, IPC classification, and legal enforceability in Indian territory.
                </p>
              </div>
              <div className="flex min-w-0 items-center gap-1.5">
                <span className="hidden text-[10px] font-semibold uppercase tracking-wide text-slate-500 sm:inline">
                  Sort by:
                </span>
                <Select defaultValue="Claim Similarity (% High to Low)">
                  <SelectTrigger
                    size="sm"
                    aria-label="Sort patent landscape results"
                    className="w-[14rem] max-w-full min-w-0 rounded-md border-slate-200 bg-white text-[11px] text-slate-800 [&_[data-slot=select-value]]:min-w-0"
                  >
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="[&_[data-slot=select-item]]:text-xs">
                    <SelectItem value="Claim Similarity (% High to Low)">Claim Similarity (% High to Low)</SelectItem>
                    <SelectItem value="Gazette Date (Newest first)">Gazette Date (Newest first)</SelectItem>
                    <SelectItem value="Jurisdiction (IPO first)">Jurisdiction (IPO first)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 3 Patent Landscape Cards — equal height, actions bottom-aligned */}
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">

              {/* Card 1: Granted Patent IN-349821-B */}
              <article className="@container flex min-h-0 flex-col rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex shrink-0 flex-wrap items-center justify-between gap-x-2 gap-y-1 border-b border-slate-100 pb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded bg-red-100 text-red-800 font-mono font-bold text-xs">
                      IN-349821-B (GRANTED)
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-semibold">
                      IPC: A61K 36/81 • A61K 36/9066
                    </span>
                    <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 text-[11px] font-bold border border-red-200">
                      Ayush Revocation Active (Sec 64)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Claim Overlap:</span>
                    <div className="px-2.5 py-0.5 rounded bg-red-600 text-white font-mono font-bold text-xs">
                      91% MATCH
                    </div>
                  </div>
                </div>

                <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[1fr_auto] gap-3 pt-2.5 @2xl:grid-cols-[minmax(0,1fr)_14rem] @2xl:grid-rows-1">
                  <div className="min-w-0 space-y-1.5">
                    <h4 className="text-sm font-bold leading-snug text-[#00263f]">
                      Topical anti-inflammatory composition comprising Withania and Curcumin extract in vesicular carrier
                    </h4>
                    <p className="text-xs text-slate-500">
                      <strong>Applicant:</strong> Multinational Phytopharma Solutions Ltd. | <strong>Published:</strong> IPO Gazette W-14/2021 | <strong>Grant Date:</strong> 18 Oct 2021
                    </p>
                    <div className="p-3 bg-red-50/70 border border-red-100 rounded-lg text-xs space-y-1">
                      <div className="font-bold text-red-800 flex items-center gap-1">
                        <GavelIcon className="w-3.5 h-3.5 text-red-600" />
                        Critical Statutory Ground under Indian Patent Act 1970:
                      </div>
                      <p className="text-slate-700 leading-relaxed">
                        Claim 1 monopolizes the specific extraction ratio of 1:1 Withania to Curcumin in emulgel formulation. Directly invalidated by <span className="font-semibold text-[#00263f]">TKDL Entry AK/409 (Bhavaprakasha)</span>. Ministry of Ayush IP Cell has filed Revocation Petition under <span className="font-mono text-[#00263f] font-semibold">Section 64(1)(p)</span> before the High Court of Delhi.
                      </p>
                    </div>
                  </div>

                  <div className="flex min-w-0 shrink-0 flex-col justify-between gap-2 rounded-md border border-slate-200 bg-slate-50 p-2.5 @2xl:justify-start">
                    <div className="space-y-1 text-[11px]">
                      <div className="flex items-baseline justify-between gap-2 text-slate-500">
                        <span>Filing Office:</span>
                        <span className="font-semibold text-slate-800">IPO Chennai Branch</span>
                      </div>
                      <div className="flex items-baseline justify-between gap-2 text-slate-500">
                        <span>Status:</span>
                        <span className="font-bold text-red-600">Sub-Judice Revocation</span>
                      </div>
                      <div className="flex items-baseline justify-between gap-2 text-slate-500">
                        <span>Legal Risk to You:</span>
                        <span className="font-bold text-red-600">High Infringement Risk</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setActiveModal("claims_matrix")}
                        className="w-full py-2 px-3 bg-[#00263f] text-white text-xs font-semibold rounded-lg hover:bg-[#001d32] shadow-sm transition-colors text-center"
                      >
                        View Comparative Claims Matrix
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          router.push(
                            "/chat?prompt=" +
                              encodeURIComponent(
                                "Generate an intervention petition under Section 64 of the Indian Patents Act for IN-349821-B citing TKDL Entry AK/409 classical anticipation."
                              )
                          );
                        }}
                        className="w-full py-2 px-3 bg-white hover:bg-slate-100 text-red-700 text-xs font-bold rounded-lg border border-red-300 shadow-sm transition-colors text-center"
                      >
                        Join Ayush Sec 64 Revocation Suit
                      </button>
                    </div>
                  </div>
                </div>
              </article>

              {/* Card 2: Published Application 202311048291 A */}
              <article className="@container flex min-h-0 flex-col rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex shrink-0 flex-wrap items-center justify-between gap-x-2 gap-y-1 border-b border-slate-100 pb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded bg-slate-100 text-[#00263f] font-mono font-bold text-xs">
                      202311048291 A (APPLICATION)
                    </span>
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-[#00263f] text-[11px] font-semibold">
                      IPC: A61K 9/107 • A61K 36/00
                    </span>
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-[#E65100] text-[11px] font-bold">
                      FER Issued (Sec 3(e) Objection)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Claim Overlap:</span>
                    <div className="px-2.5 py-0.5 rounded bg-[#FF9933] text-slate-900 font-mono font-bold text-xs">
                      78% MATCH
                    </div>
                  </div>
                </div>

                <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[1fr_auto] gap-3 pt-2.5 @2xl:grid-cols-[minmax(0,1fr)_14rem] @2xl:grid-rows-1">
                  <div className="min-w-0 space-y-1.5">
                    <h4 className="text-sm font-bold leading-snug text-[#00263f]">
                      Synergistic botanical nano-emulsion for joint care and chondrocyte protection
                    </h4>
                    <p className="text-xs text-slate-500">
                      <strong>Applicant:</strong> BioVeda Formulations Pvt. Ltd. | <strong>Gazette Date:</strong> 04 Aug 2023 | <strong>Examining Group:</strong> Chemistry/Biotech (IPO Delhi)
                    </p>
                    <div className="p-3 bg-amber-50/70 border border-amber-100 rounded-lg text-xs space-y-1">
                      <div className="font-bold text-[#E65100] flex items-center gap-1">
                        <CheckVerifiedIcon className="w-3.5 h-3.5" />
                        Patent Examiner Official Objections:
                      </div>
                      <p className="text-slate-700 leading-relaxed">
                        First Examination Report (FER) issued citing <span className="font-semibold text-[#00263f]">Section 3(e)</span> — mere aggregation of properties without statistical synergistic index evidence; applicant currently within 6-month response window.
                      </p>
                    </div>
                  </div>

                  <div className="flex min-w-0 shrink-0 flex-col justify-between gap-2 rounded-md border border-slate-200 bg-slate-50 p-2.5 @2xl:justify-start">
                    <div className="space-y-1 text-[11px]">
                      <div className="flex items-baseline justify-between gap-2 text-slate-500">
                        <span>Gazette Status:</span>
                        <span className="font-semibold text-slate-800">Published (FER Pending)</span>
                      </div>
                      <div className="flex items-baseline justify-between gap-2 text-slate-500">
                        <span>Opp. Window:</span>
                        <span className="font-bold text-[#1B5E20]">Open for Sec 25(1) Opp.</span>
                      </div>
                      <div className="flex items-baseline justify-between gap-2 text-slate-500">
                        <span>Prior Art Advantage:</span>
                        <span className="font-bold text-[#000080]">TKDL Pre-dating</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setActiveModal("claims_matrix")}
                        className="w-full py-2 px-3 bg-white hover:bg-slate-100 text-[#00263f] text-xs font-semibold rounded-lg border border-slate-200 shadow-sm transition-colors text-center"
                      >
                        Examine Claims & FER Notice
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveModal("form7a")}
                        className="w-full py-2 px-3 bg-[#2a6b2c] hover:bg-[#1e5020] text-white text-xs font-bold rounded-lg shadow-sm transition-colors text-center"
                      >
                        File Pre-Grant Opposition (Form 7A)
                      </button>
                    </div>
                  </div>
                </div>
              </article>

              {/* Card 3: US Patent US9844572B2 */}
              <article className="@container flex min-h-0 flex-col rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex shrink-0 flex-wrap items-center justify-between gap-x-2 gap-y-1 border-b border-slate-100 pb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded bg-slate-100 text-[#00263f] font-mono font-bold text-xs">
                      US9844572B2 (USPTO)
                    </span>
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-[#00263f] text-[11px] font-semibold">
                      Jurisdiction: United States (Expired in India)
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#eaf7eb] text-[#1B5E20] text-[11px] font-bold">
                      India Freedom-To-Operate (FTO) CLEAR
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Claim Overlap:</span>
                    <div className="px-2.5 py-0.5 rounded bg-slate-100 text-[#00263f] font-mono font-bold text-xs">
                      64% MATCH
                    </div>
                  </div>
                </div>

                <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[1fr_auto] gap-3 pt-2.5 @2xl:grid-cols-[minmax(0,1fr)_14rem] @2xl:grid-rows-1">
                  <div className="min-w-0 space-y-1.5">
                    <h4 className="text-sm font-bold leading-snug text-[#00263f]">
                      Method of isolating active withanolide-curcuminoid conjugate for sub-dermal delivery
                    </h4>
                    <p className="text-xs text-slate-500">
                      <strong>Applicant:</strong> CurraHealth Therapeutics Inc. (Delaware) | <strong>Granted:</strong> Dec 2017 | <strong>PCT Filing:</strong> Expired without Indian National Phase
                    </p>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                      <p className="text-slate-600 leading-relaxed">
                        Enforceable exclusively within US territory. No corresponding Indian Patent application filed within 31 months statutory PCT window. <span className="font-semibold text-[#1B5E20]">Safe for domestic manufacturing and distribution in India</span>; requires carve-out if exporting to the United States.
                      </p>
                    </div>
                  </div>

                  <div className="flex min-w-0 shrink-0 flex-col justify-between gap-2 rounded-md border border-slate-200 bg-slate-50 p-2.5 @2xl:justify-start">
                    <div className="space-y-1 text-[11px]">
                      <div className="flex items-baseline justify-between gap-2 text-slate-500">
                        <span>Indian Jurisdiction:</span>
                        <span className="font-bold text-[#1B5E20]">Public Domain in India</span>
                      </div>
                      <div className="flex items-baseline justify-between gap-2 text-slate-500">
                        <span>US Export Barrier:</span>
                        <span className="font-bold text-[#E65100]">Requires Claim Carve-out</span>
                      </div>
                      <div className="flex items-baseline justify-between gap-2 text-slate-500">
                        <span>Expiry Date:</span>
                        <span className="font-mono text-slate-800">2035-09-12</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => setActiveModal("us_wrapper")}
                        className="w-full py-2 px-3 bg-white hover:bg-slate-100 text-[#00263f] text-xs font-semibold rounded-lg border border-slate-200 shadow-sm transition-colors text-center"
                      >
                        Download US File Wrapper & Claims
                      </button>
                    </div>
                  </div>
                </div>
              </article>

            </div>
        </div>
      )}

      {/* ═══ Prosecution toolkits + regulatory footer ══════════════════ */}
      {scanComplete && (
        <section className={deck}>
            {/* Legal Toolkit Action Console */}
            <section className="shrink-0 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="min-w-0 border-b border-slate-100 pb-2">
                <span className="text-[10px] font-bold uppercase tracking-wide text-[#1B5E20]">
                  Statutory Compliance &amp; Prosecution Actions
                </span>
                <h3 className="text-sm font-bold text-[#00263f] sm:text-base">
                  Ayush Legal Advisor Automated Toolkits
                </h3>
                <p className="text-[11px] text-slate-500">
                  Generate legally compliant drafts and documentation adhering to the Patents Act 1970.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 pt-3 md:grid-cols-3">
                {/* Toolkit 1 */}
                <div className="flex min-h-0 flex-col justify-between gap-2 rounded-md border border-slate-200 bg-[#EEF3F8] p-3">
                  <div className="space-y-1">
                    <div className="w-8 h-8 rounded bg-[#00263f] text-white flex items-center justify-center">
                      <PdfDocIcon className="w-4 h-4 text-[#FF9933]" />
                    </div>
                    <h4 className="pt-1 text-xs font-bold leading-snug text-[#00263f]">
                      Download Patent Landscape Dossier
                    </h4>
                    <p className="text-[11px] leading-snug text-slate-600">
                      Comprehensive 38-page audit containing all 8 patent citations, claims overlap percentages, and TKDL concordance tables.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      alert("Generating comprehensive 38-page Patent Landscape PDF Dossier...");
                    }}
                    className="w-full rounded-md bg-[#00263f] px-2.5 py-1.5 text-[11px] font-semibold text-white shadow-sm transition-colors hover:bg-[#001d32]"
                  >
                    Generate PDF Dossier (1.8 MB)
                  </button>
                </div>

                {/* Toolkit 2 */}
                <div className="flex min-h-0 flex-col justify-between gap-2 rounded-md border border-slate-200 bg-[#EEF3F8] p-3">
                  <div className="space-y-1">
                    <div className="w-8 h-8 rounded bg-red-600 text-white flex items-center justify-center">
                      <GavelIcon className="w-4 h-4" />
                    </div>
                    <h4 className="pt-1 text-xs font-bold leading-snug text-[#00263f]">
                      Draft Pre-Grant Opposition (Form 7A)
                    </h4>
                    <p className="text-[11px] leading-snug text-slate-600">
                      Auto-populates Statement of Case with TKDL references for filing under Section 25(1)(d) against app 202311048291 A.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveModal("form7a")}
                    className="w-full rounded-md bg-[#2a6b2c] px-2.5 py-1.5 text-[11px] font-semibold text-white shadow-sm transition-colors hover:bg-[#1e5020]"
                  >
                    Open Form 7A Legal Drafter
                  </button>
                </div>

                {/* Toolkit 3 */}
                <div className="flex min-h-0 flex-col justify-between gap-2 rounded-md border border-slate-200 bg-[#EEF3F8] p-3">
                  <div className="space-y-1">
                    <div className="w-8 h-8 rounded bg-[#002855] text-white flex items-center justify-center">
                      <BiotechIcon className="w-4 h-4 text-green-400" />
                    </div>
                    <h4 className="pt-1 text-xs font-bold leading-snug text-[#00263f]">
                      Section 3(e) Synergistic Protocol
                    </h4>
                    <p className="text-[11px] leading-snug text-slate-600">
                      Statutory testing protocol template for validating non-obvious synergistic enhancement to overcome Patent Office objections.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      alert("Downloading Section 3(e) Laboratory Testing Protocol (.DOCX)...");
                    }}
                    className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-[#00263f] shadow-sm transition-colors hover:bg-slate-100"
                  >
                    Download Lab Template (.DOCX)
                  </button>
                </div>
              </div>
            </section>

            {/* ── Official Regulatory Authenticity Footer ───────────────── */}
            <footer className="flex shrink-0 flex-wrap items-center justify-between gap-x-3 gap-y-1.5 rounded-lg border border-slate-200 bg-[#EEF3F8] px-3 py-2 text-[11px] text-slate-600">
              <div className="min-w-0 space-y-0.5">
                <div className="text-[11px] font-bold text-[#00263f]">
                  GOVERNMENT OF INDIA • MINISTRY OF AYUSH • TRADITIONAL KNOWLEDGE DIGITAL LIBRARY (TKDL) ACCESS DESK
                </div>
                <div className="font-mono text-[10px] text-slate-500">
                  Concordance with IPO Official Gazette (CGPDTM Weekly Bulletin v2024.36), WIPO Patentscope API, and Ministry of Ayush Prior Art Unit.
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 font-mono text-[10px]">
                <div className="flex items-center gap-1 rounded border border-slate-200 bg-white px-1.5 py-0.5 shadow-sm">
                  <span className="text-[#1B5E20]">🛡️</span>
                  <span>SHA-256: 8FA1-C039-DE02-77EA</span>
                </div>
                <div className="flex items-center gap-1 rounded border border-slate-200 bg-white px-1.5 py-0.5 font-semibold text-[#00263f] shadow-sm">
                  <span className="text-[#FF9933]">🔒</span>
                  <span>GIGW Compliant Level-3</span>
                </div>
              </div>
            </footer>
        </section>
      )}

      </div>

      {/* ── MODALS ──────────────────────────────────────────────────────── */}

      {/* 1. Claims Matrix Modal */}
      {activeModal === "claims_matrix" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col overflow-hidden border border-slate-200">
            <div className="p-5 bg-[#00263f] text-white flex items-center justify-between">
              <h3 className="font-bold text-base sm:text-lg">
                Comparative Claims Overlap Matrix — IN-349821-B vs Classical Art
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-300 hover:text-white text-xl font-bold">
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
              <div className="overflow-x-auto">
              <table className="w-full min-w-[34rem] text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b">
                    <th className="p-2.5 font-bold">Patent Claim Element (IN-349821-B)</th>
                    <th className="p-2.5 font-bold">TKDL Prior Art Citation (Bhavaprakasha AK/409)</th>
                    <th className="p-2.5 font-bold">Overlap Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-2.5 font-mono">Claim 1: Withania + Curcuma 1:1 w/w</td>
                    <td className="p-2.5 text-slate-600">Haritakyadi Varga Verse 142: Equal parts Ashwagandha & Haridra in Ghrita</td>
                    <td className="p-2.5 text-red-600 font-bold">100% Identical Prior Art</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-mono">Claim 3: Topical dermal penetration enhancer</td>
                    <td className="p-2.5 text-slate-600">Pippali powder added as Yogavahi bio-enhancer (Sneha Kalpana)</td>
                    <td className="p-2.5 text-red-600 font-bold">Prior Art Anticipated</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-mono">Claim 7: Specific synthetic emulgel copolymer</td>
                    <td className="p-2.5 text-slate-600">Synthetic carbomer polymer excipient carrier</td>
                    <td className="p-2.5 text-green-700 font-bold">Potentially Narrow Novel Scope</td>
                  </tr>
                </tbody>
              </table>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button onClick={() => setActiveModal(null)} className="px-4 py-2 bg-[#00263f] text-white text-xs font-semibold rounded">
                Close Matrix
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Form 7A Legal Drafter Modal */}
      {activeModal === "form7a" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden border border-slate-200">
            <div className="p-5 bg-[#00263f] text-white flex items-center justify-between">
              <h3 className="font-bold text-base">
                Form 7A Legal Drafter — Pre-Grant Opposition under Section 25(1)
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-300 hover:text-white text-xl font-bold">
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-3 text-xs sm:text-sm text-slate-700">
              <p className="text-xs text-slate-600">
                Notice of opposition under Section 25(1) of Patents Act against application <strong>202311048291 A</strong>.
              </p>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs space-y-2">
                <div>
                  <strong>Grounds Relied Upon:</strong> Section 25(1)(d) (Prior public knowledge in India) & Section 25(1)(f) (Non-patentable under Section 3(e) & 3(p)).
                </div>
                <div>
                  <strong>Institutional Evidentiary Document:</strong> CSIR-TKDL Reference AK/409 & Charaka Samhita Chikitsasthana 28/45.
                </div>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button onClick={() => setActiveModal(null)} className="px-4 py-2 bg-slate-200 text-slate-700 text-xs font-semibold rounded">
                Cancel
              </button>
              <button
                onClick={() => {
                  alert("Form 7A Notice of Opposition and Statement of Case exported.");
                  setActiveModal(null);
                }}
                className="px-4 py-2 bg-[#2a6b2c] text-white text-xs font-semibold rounded"
              >
                Export Form 7A Package
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. FTO Report Generator Modal */}
      {activeModal === "fto" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 text-xs sm:text-sm border border-slate-200 space-y-4">
            <h3 className="font-bold text-base text-[#00263f]">Freedom-To-Operate (FTO) Assessment</h3>
            <p className="text-slate-600 leading-relaxed">
              Based on the screening of <strong>{productTitle}</strong> across IPO, USPTO, EPO, and WIPO databases:
            </p>
            <ul className="list-disc pl-4 space-y-1 text-slate-700">
              <li><strong>Indian Jurisdiction:</strong> Clean manufacturing clearance subject to Section 3(p) disclaimer.</li>
              <li><strong>US Export Market:</strong> Avoid Claim 1 of US9844572B2 until expiry 2035.</li>
              <li><strong>EU Market:</strong> Clear to operate under classical traditional knowledge exemptions.</li>
            </ul>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setActiveModal(null)} className="px-4 py-2 bg-[#00263f] text-white text-xs font-semibold rounded">
                Download Certified FTO Memo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. US File Wrapper Modal */}
      {activeModal === "us_wrapper" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 text-xs sm:text-sm border border-slate-200 space-y-4">
            <h3 className="font-bold text-base text-[#00263f]">US9844572B2 — USPTO File Wrapper</h3>
            <p className="text-slate-600">
              Title: Method of isolating active withanolide-curcuminoid conjugate for sub-dermal delivery.
            </p>
            <div className="p-3 bg-slate-50 border rounded font-mono text-[11px] text-slate-700">
              Grant Date: Dec 12, 2017<br />
              Status: Active in United States<br />
              PCT Status: Expired without Indian National Phase filing
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setActiveModal(null)} className="px-4 py-2 bg-slate-200 text-slate-700 text-xs rounded font-semibold">
                Close
              </button>
              <button
                onClick={() => {
                  alert("US File Wrapper PDF package downloaded.");
                  setActiveModal(null);
                }}
                className="px-4 py-2 bg-[#00263f] text-white text-xs rounded font-semibold"
              >
                Download Wrapper PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Upload Spec Modal */}
      {activeModal === "upload" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 text-xs sm:text-sm border border-slate-200 space-y-4">
            <h3 className="font-bold text-base text-[#00263f]">Upload Patent Specification (.XML / .PDF)</h3>
            <p className="text-slate-600">
              Select provisional or complete patent specification to automatically parse claims, IPC classification, and extract bioactives.
            </p>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center text-slate-500 hover:bg-slate-50 cursor-pointer">
              <UploadIcon className="w-8 h-8 mx-auto mb-2 text-[#00263f]" />
              <span className="font-semibold text-xs">Click to browse or drag and drop specification</span>
              <span className="block text-[11px] text-slate-400 mt-1">Supports WIPO ST.36 XML, PDF, DOCX (Max 25MB)</span>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setActiveModal(null)} className="px-4 py-2 bg-slate-200 text-slate-700 text-xs rounded font-semibold">
                Cancel
              </button>
              <button
                onClick={() => {
                  alert("Specification uploaded and parsed successfully.");
                  setActiveModal(null);
                }}
                className="px-4 py-2 bg-[#00263f] text-white text-xs rounded font-semibold"
              >
                Upload & Parse
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
