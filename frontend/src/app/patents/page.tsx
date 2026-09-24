"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
      const resultsEl = document.getElementById("search-results-matrix");
      if (resultsEl) {
        resultsEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 1000);
  };

  return (
    <div className="w-full min-h-[calc(100vh-95px)] bg-[#F4F6F9] text-[#111c2d]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* ── Page Header & Action Bar ──────────────────────────────────── */}
        <section className="bg-white p-5 sm:p-7 rounded-xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-4xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#EEF3F8] text-[#00263f] text-[11px] font-semibold uppercase tracking-wider">
                <CheckVerifiedIcon className="w-3.5 h-3.5 text-[#FF9933]" />
                OFFICIAL PATENT GAZETTE & PRIOR ART CLEARANCE • CGPDTM / IPO & WIPO CONCORDANCE
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-100 text-red-800 text-[11px] font-bold">
                <GavelIcon className="w-3.5 h-3.5" />
                Patent Act 1970 / Section 3(p) & 3(e) Verification Engine
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-[#00263f] tracking-tight">
              Patent Database & Search Engine
            </h1>

            <p className="text-sm text-slate-600 leading-relaxed">
              Screen your Ayurvedic formulation, herbal composition, or bioactive extract against active patent applications, granted patents (IPO, USPTO, EPO, WIPO), and Traditional Knowledge prior art to evaluate novelty and Section 3(p) statutory patentability.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0 self-start md:self-center">
            <button
              type="button"
              onClick={() => alert("Connecting to IPO e-Gazette Bulk Docket stream...")}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-[#00263f] text-xs font-semibold rounded-lg transition-colors border border-slate-200 shadow-sm"
            >
              <SyncIcon className="w-4 h-4 text-[#00263f]" />
              <span>Bulk Docket Sync</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveModal("upload")}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-[#00263f] text-xs font-semibold rounded-lg transition-colors border border-slate-200 shadow-sm"
            >
              <UploadIcon className="w-4 h-4 text-[#E65100]" />
              <span>Upload Spec (.XML / .PDF)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveModal("fto")}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#2a6b2c] hover:bg-[#1e5020] text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
            >
              <ShieldCheckIcon className="w-4 h-4" />
              <span>Generate FTO Report</span>
            </button>
          </div>
        </section>

        {/* ── Dual Mode Navigation Tabs ─────────────────────────────────── */}
        <div className="flex flex-wrap gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("formulation")}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold rounded-t-lg transition-all shadow-sm ${
              activeTab === "formulation"
                ? "bg-[#0b3c5d] text-white"
                : "bg-slate-200/80 hover:bg-slate-300 text-slate-700"
            }`}
          >
            <BiotechIcon className="w-4 h-4" />
            <span>Product Formulation & Composition Matcher (AI Patentability Check)</span>
            <span className="ml-1 px-1.5 py-0.2 rounded bg-[#FF9933] text-slate-900 text-[10px] font-bold">
              RECOMMENDED
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("boolean")}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold rounded-t-lg transition-all shadow-sm ${
              activeTab === "boolean"
                ? "bg-[#0b3c5d] text-white"
                : "bg-slate-200/80 hover:bg-slate-300 text-slate-700"
            }`}
          >
            <SearchInsightsIcon className="w-4 h-4" />
            <span>Advanced Boolean / IPC Gazette Search (Class A61K 36/00)</span>
          </button>
        </div>

        {/* ── Tab 1: Product Formulation Console ─────────────────────────── */}
        {activeTab === "formulation" && (
          <section className="bg-white p-6 sm:p-7 rounded-b-xl rounded-tr-xl border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-6 bg-[#FF9933] rounded-full" />
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[#00263f]">
                    Check Your Product For Existing Patents & Classical Prior Art
                  </h2>
                  <p className="text-xs text-slate-500">
                    Cross-matches therapeutic fractions against 4.8M patent claims and 78,000+ TKDL medicinal formulations.
                  </p>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-2 text-[#00263f] text-xs font-semibold bg-[#EEF3F8] px-3 py-1.5 rounded-lg">
                <CheckVerifiedIcon className="w-4 h-4 text-[#1B5E20]" />
                <span>IPO Gazette Sync: Weekly Bulletin v2024.36</span>
              </div>
            </div>

            {/* Input Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Product Working Title */}
              <div className="md:col-span-8 space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Product / Formulation Working Title <span className="text-red-500">*</span></span>
                  <span className="font-normal text-slate-400">Standard INN / Ayush Nomenclature</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-slate-400">💊</span>
                  <input
                    type="text"
                    value={productTitle}
                    onChange={(e) => setProductTitle(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00263f]"
                  />
                </div>
              </div>

              {/* Dosage Form */}
              <div className="md:col-span-4 space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Formulation Type / Dosage Form <span className="text-red-500">*</span>
                </label>
                <select
                  value={dosageForm}
                  onChange={(e) => setDosageForm(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00263f] cursor-pointer"
                >
                  <option>Emulgel / Hydrogel Topical Matrix</option>
                  <option>Tablet / Vati / Gutika</option>
                  <option>Medicated Oil / Ghrita / Taila</option>
                  <option>Phytosomal Nano-dispersion</option>
                  <option>Liquid Extract / Asava-Arishta</option>
                </select>
              </div>

              {/* Botanical Ingredients Tag Field */}
              <div className="md:col-span-12 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <span>Botanical Ingredients & Bioactive Standardization Markers</span>
                    <span className="text-slate-400 cursor-help" title="Quantified bioactives critical for Section 3(e) evaluation">ℹ️</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="text-xs font-bold text-[#00263f] hover:text-[#001d32] flex items-center gap-1"
                  >
                    <span>+ Add Herb / Excipient</span>
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200 min-h-[52px]">
                  {botanicalTags.map((tag) => (
                    <div
                      key={tag.id}
                      className="inline-flex items-center gap-2 px-3 py-1 rounded bg-white shadow-sm border border-slate-200 text-xs font-semibold text-[#00263f]"
                    >
                      <span className={`w-2 h-2 rounded-full ${tag.color}`} />
                      <span>{tag.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag.id)}
                        className="text-slate-400 hover:text-red-600 font-bold ml-1"
                      >
                        ✕
                      </button>
                    </div>
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
                    placeholder="Type botanical name or CAS No and press Enter..."
                    className="flex-1 min-w-[220px] bg-transparent text-xs text-slate-700 placeholder-slate-400 focus:outline-none px-2 py-1"
                  />
                </div>
              </div>

              {/* Claimed Utility */}
              <div className="md:col-span-8 space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Intended Therapeutic Indication / Claimed Utility
                </label>
                <textarea
                  value={therapeuticUtility}
                  onChange={(e) => setTherapeuticUtility(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00263f]"
                />
              </div>

              {/* Extraction Chemistry */}
              <div className="md:col-span-4 space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Extraction Chemistry & Claimed Synergy
                </label>
                <div className="bg-[#EEF3F8] p-3 rounded-lg border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Solvent Ratio:</span>
                    <span className="font-mono font-bold text-[#00263f]">Hydro-ethanolic (60:40 v/v)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Synergistic Index (CI):</span>
                    <span className="font-mono font-bold text-[#1B5E20]">1.42 (Combination Index)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Bioavailability Mod:</span>
                    <span className="font-mono text-slate-700">12.4x Piperine boost</span>
                  </div>
                </div>
              </div>

              {/* Target Patent Jurisdictions */}
              <div className="md:col-span-12">
                <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-blue-50/70 border border-blue-100 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#00263f]">Target Repositories & Gazette Sources:</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-700">
                    <label className="inline-flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" defaultChecked className="accent-[#00263f]" />
                      <span>Indian Patent Office (IPO / CGPDTM)</span>
                    </label>
                    <label className="inline-flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" defaultChecked className="accent-[#00263f]" />
                      <span>WIPO (Patentscope & PCT)</span>
                    </label>
                    <label className="inline-flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" defaultChecked className="accent-[#00263f]" />
                      <span>USPTO (US Patents & Pre-Grant)</span>
                    </label>
                    <label className="inline-flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" defaultChecked className="accent-[#00263f]" />
                      <span>EPO (Espacenet)</span>
                    </label>
                    <label className="inline-flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" className="accent-[#00263f]" />
                      <span>CNIPA (China)</span>
                    </label>
                    <label className="inline-flex items-center gap-1.5 cursor-pointer font-bold text-[#1B5E20]">
                      <input type="checkbox" defaultChecked className="accent-[#1B5E20]" />
                      <span>TKDL Classical Veda Repositories</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Scan Action Row */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <LockIcon className="w-4 h-4 text-amber-600" />
                <span>Queries executed under Ministry of Ayush SAKTI Secure Sandbox. Strictly privileged.</span>
              </div>

              <button
                type="button"
                id="scan-action-btn"
                onClick={handleScan}
                disabled={isScanning}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#00263f] hover:bg-[#001d32] text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-md transition-all active:scale-[0.99]"
              >
                {isScanning ? (
                  <>
                    <SyncIcon className="w-4 h-4 animate-spin text-[#FF9933]" />
                    <span>Scanning IPO, WIPO & TKDL Dockets...</span>
                  </>
                ) : (
                  <>
                    <SearchInsightsIcon className="w-4 h-4 text-[#FF9933]" />
                    <span>Scan Patent Repositories & Classical Prior Art</span>
                  </>
                )}
              </button>
            </div>
          </section>
        )}

        {/* ── Tab 2: Advanced Boolean Search Console ──────────────────────── */}
        {activeTab === "boolean" && (
          <section className="bg-white p-6 sm:p-7 rounded-b-xl rounded-tl-xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-6 bg-[#000080] rounded-full" />
                <h2 className="text-base sm:text-lg font-bold text-[#00263f]">
                  Official CGPDTM Gazette & Boolean Expression Builder
                </h2>
              </div>
              <span className="font-mono text-xs text-slate-500">Standard: ST.36 / XML IPO Schema</span>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-[#EEF3F8] rounded-lg space-y-2">
                <label className="text-xs font-bold text-[#00263f]">Gazette Query Syntax</label>
                <input
                  type="text"
                  defaultValue='(IPC:"A61K36/81" OR IPC:"A61K36/9066") AND ("Withania" AND "Curcuma") AND NOT APPLICANT:"Ministry of Ayush"'
                  className="w-full p-2.5 bg-white font-mono text-xs text-slate-800 rounded border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00263f]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700">IPC / CPC Classification</label>
                  <input
                    type="text"
                    defaultValue="A61K 36/00, A61P 19/02"
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 text-xs rounded"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Gazette Publication Date Window</label>
                  <input
                    type="text"
                    defaultValue="2020-01-01 to 2024-10-31"
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 text-xs rounded"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Applicant / Assignee Entity</label>
                  <input
                    type="text"
                    placeholder="e.g., L'Oreal, Dabur, Patanjali, Pfizer..."
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 text-xs rounded"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleScan}
                  className="px-5 py-2.5 bg-[#00263f] text-white text-xs font-bold rounded-lg shadow-sm hover:bg-[#001d32] transition-colors"
                >
                  Execute Gazette Query
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ── Real-Time Prior Art & Conflict Analysis Section ───────────── */}
        {scanComplete && (
          <div id="search-results-matrix" className="space-y-6 pt-2">

            {/* Executive Patentability Summary Card */}
            <section className="bg-white p-6 sm:p-7 rounded-xl border border-slate-200/80 shadow-sm space-y-6">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="space-y-2 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-red-100 text-red-800 text-[11px] font-bold uppercase tracking-wider">
                      ⚠️ High Prior Art Overlap
                    </span>
                    <span className="font-mono text-xs text-slate-500">Docket Hash: #AYU-2024-GAZ-9941</span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-[#00263f] tracking-tight">
                    Moderate-to-High Section 3(p) & Section 3(e) Vulnerability (88% Prior Art Overlap)
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Statutory objection expected under <strong className="text-[#00263f]">Section 3(p)</strong> (Traditional Knowledge) due to direct concordance with classical Ayurvedic texts, and <strong className="text-[#00263f]">Section 3(e)</strong> (Mere Admixture) unless non-obvious synergistic efficacy is substantiated by clinical combination index data.
                  </p>
                </div>

                {/* Metric KPI Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
                  <div className="p-3 bg-[#EEF3F8] border border-slate-200 rounded-lg text-center min-w-[110px]">
                    <div className="text-2xl font-bold text-red-600">3</div>
                    <div className="text-[11px] text-slate-600 font-semibold leading-tight">
                      Granted Patents in Conflict
                    </div>
                  </div>
                  <div className="p-3 bg-[#EEF3F8] border border-slate-200 rounded-lg text-center min-w-[110px]">
                    <div className="text-2xl font-bold text-[#E65100]">5</div>
                    <div className="text-[11px] text-slate-600 font-semibold leading-tight">
                      Pending Gazette Applications
                    </div>
                  </div>
                  <div className="p-3 bg-[#EEF3F8] border border-slate-200 rounded-lg text-center min-w-[110px]">
                    <div className="text-2xl font-bold text-[#000080]">4</div>
                    <div className="text-[11px] text-slate-600 font-semibold leading-tight">
                      TKDL Classical Citations
                    </div>
                  </div>
                  <div className="p-3 bg-[#eaf7eb] border border-green-200 rounded-lg text-center min-w-[110px]">
                    <div className="text-2xl font-bold text-[#1B5E20]">1</div>
                    <div className="text-[11px] text-[#0c5216] font-semibold leading-tight">
                      Novel Extraction Ground
                    </div>
                  </div>
                </div>
              </div>

              {/* Visual Clearance Spectrum Bar */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
                  <span className="flex items-center gap-1.5 text-[#00263f]">
                    📊 Prior Art Density Spectrum
                  </span>
                  <span className="font-mono text-red-600 font-bold">
                    Novelty Clearance Score: 12% (Critical Statutory Challenge Zone)
                  </span>
                </div>

                <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden flex">
                  <div className="h-full bg-red-600" style={{ width: "62%" }} title="Classical Ayurvedic Prior Art (62%)" />
                  <div className="h-full bg-[#FF9933]" style={{ width: "26%" }} title="Commercial Patent Filings (26%)" />
                  <div className="h-full bg-[#138808]" style={{ width: "12%" }} title="Clear Novel Scope (12%)" />
                </div>

                <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 mt-2 font-medium">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block" /> 62% Classical Ayurvedic Formulations (TKDL)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FF9933] inline-block" /> 26% Existing Modern Patent Filings (IPO / WIPO)
                  </span>
                  <span className="flex items-center gap-1 text-[#1B5E20] font-bold">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#138808] inline-block" /> 12% Potentially Novel Scope (Carrier excipient synergy)
                  </span>
                </div>
              </div>
            </section>

            {/* Classical Knowledge Bar (TKDL Concordance Citation) */}
            <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm bg-gradient-to-r from-blue-50/40 via-white to-blue-50/40">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#00263f] text-white flex items-center justify-center shrink-0">
                    <BookIcon className="w-5 h-5 text-[#FF9933]" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold text-[#000080] bg-blue-100 px-2 py-0.5 rounded">
                        TKDL Institutional Concordance
                      </span>
                      <span className="font-mono text-xs text-slate-500 font-bold">
                        Citation Codes: RS/1024 & AK/409
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-[#00263f]">
                      Charaka Samhita (Chikitsa Sthana 28/45) & Bhavaprakasha Nighantu (Haritakyadi Varga)
                    </h4>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      Exhaustive documentation confirms topical co-application of <em>Ashwagandha</em> (Withania somnifera) and <em>Haridra</em> (Curcuma longa) in lipid carriers for Sandhigata Vata (Arthritis) predating 1000 BCE. Immediate statutory basis for Pre-Grant Opposition under Section 25(1)(d).
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => router.push("/tkdl")}
                    className="px-4 py-2 bg-[#00263f] text-white text-xs font-semibold rounded-lg hover:bg-[#001d32] shadow-sm transition-colors"
                  >
                    Inspect TKDL Treatises
                  </button>
                </div>
              </div>
            </section>

            {/* Detailed Patent Landscape Section */}
            <div className="flex items-center justify-between pt-1">
              <div>
                <h3 className="text-lg font-bold text-[#00263f]">
                  Detailed Patent Landscape & Overlapping Claims
                </h3>
                <p className="text-xs text-slate-500">
                  Ranked by claim similarity, IPC classification, and legal enforceability in Indian territory.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Sort by:</span>
                <select className="px-2.5 py-1 bg-white border border-slate-200 text-xs rounded-lg shadow-sm focus:outline-none">
                  <option>Claim Similarity (% High to Low)</option>
                  <option>Gazette Date (Newest first)</option>
                  <option>Jurisdiction (IPO first)</option>
                </select>
              </div>
            </div>

            {/* 3 Patent Landscape Cards */}
            <div className="grid grid-cols-1 gap-4">

              {/* Card 1: Granted Patent IN-349821-B */}
              <article className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-3 border-b border-slate-100">
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

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-3">
                  <div className="lg:col-span-8 space-y-2">
                    <h4 className="text-base font-bold text-[#00263f]">
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

                  <div className="lg:col-span-4 flex flex-col justify-between gap-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between text-slate-500">
                        <span>Filing Office:</span>
                        <span className="font-semibold text-slate-800">IPO Chennai Branch</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Status:</span>
                        <span className="font-bold text-red-600">Sub-Judice Revocation</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
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
              <article className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-3 border-b border-slate-100">
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

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-3">
                  <div className="lg:col-span-8 space-y-2">
                    <h4 className="text-base font-bold text-[#00263f]">
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

                  <div className="lg:col-span-4 flex flex-col justify-between gap-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between text-slate-500">
                        <span>Gazette Status:</span>
                        <span className="font-semibold text-slate-800">Published (FER Pending)</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Opp. Window:</span>
                        <span className="font-bold text-[#1B5E20]">Open for Sec 25(1) Opp.</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
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
              <article className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-3 border-b border-slate-100">
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

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-3">
                  <div className="lg:col-span-8 space-y-2">
                    <h4 className="text-base font-bold text-[#00263f]">
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

                  <div className="lg:col-span-4 flex flex-col justify-between gap-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between text-slate-500">
                        <span>Indian Jurisdiction:</span>
                        <span className="font-bold text-[#1B5E20]">Public Domain in India</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>US Export Barrier:</span>
                        <span className="font-bold text-[#E65100]">Requires Claim Carve-out</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
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

            {/* Legal Toolkit Action Console */}
            <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[11px] font-bold uppercase text-[#1B5E20]">
                    Statutory Compliance & Prosecution Actions
                  </span>
                  <h3 className="text-lg font-bold text-[#00263f]">
                    Ayush Legal Advisor Automated Toolkits
                  </h3>
                  <p className="text-xs text-slate-500">
                    Generate legally compliant drafts and documentation adhering to the Patents Act 1970.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                {/* Toolkit 1 */}
                <div className="p-4 bg-[#EEF3F8] rounded-xl border border-slate-200 space-y-3 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="w-8 h-8 rounded bg-[#00263f] text-white flex items-center justify-center">
                      <PdfDocIcon className="w-4 h-4 text-[#FF9933]" />
                    </div>
                    <h4 className="text-sm font-bold text-[#00263f] pt-1">
                      Download Patent Landscape Dossier
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Comprehensive 38-page audit containing all 8 patent citations, claims overlap percentages, and TKDL concordance tables.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      alert("Generating comprehensive 38-page Patent Landscape PDF Dossier...");
                    }}
                    className="w-full py-2 px-3 bg-[#00263f] hover:bg-[#001d32] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                  >
                    Generate PDF Dossier (1.8 MB)
                  </button>
                </div>

                {/* Toolkit 2 */}
                <div className="p-4 bg-[#EEF3F8] rounded-xl border border-slate-200 space-y-3 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="w-8 h-8 rounded bg-red-600 text-white flex items-center justify-center">
                      <GavelIcon className="w-4 h-4" />
                    </div>
                    <h4 className="text-sm font-bold text-[#00263f] pt-1">
                      Draft Pre-Grant Opposition (Form 7A)
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Auto-populates Statement of Case with TKDL references for filing under Section 25(1)(d) against app 202311048291 A.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveModal("form7a")}
                    className="w-full py-2 px-3 bg-[#2a6b2c] hover:bg-[#1e5020] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                  >
                    Open Form 7A Legal Drafter
                  </button>
                </div>

                {/* Toolkit 3 */}
                <div className="p-4 bg-[#EEF3F8] rounded-xl border border-slate-200 space-y-3 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="w-8 h-8 rounded bg-[#002855] text-white flex items-center justify-center">
                      <BiotechIcon className="w-4 h-4 text-green-400" />
                    </div>
                    <h4 className="text-sm font-bold text-[#00263f] pt-1">
                      Section 3(e) Synergistic Protocol
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Statutory testing protocol template for validating non-obvious synergistic enhancement to overcome Patent Office objections.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      alert("Downloading Section 3(e) Laboratory Testing Protocol (.DOCX)...");
                    }}
                    className="w-full py-2 px-3 bg-white hover:bg-slate-100 text-[#00263f] text-xs font-bold rounded-lg border border-slate-200 shadow-sm transition-colors"
                  >
                    Download Lab Template (.DOCX)
                  </button>
                </div>
              </div>
            </section>

          </div>
        )}

        {/* ── Official Regulatory Authenticity Footer ─────────────────────── */}
        <footer className="p-4 bg-[#EEF3F8] rounded-xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <div className="space-y-0.5">
            <div className="text-xs font-bold text-[#00263f]">
              GOVERNMENT OF INDIA • MINISTRY OF AYUSH • TRADITIONAL KNOWLEDGE DIGITAL LIBRARY (TKDL) ACCESS DESK
            </div>
            <div className="font-mono text-[11px] text-slate-500">
              Concordance with IPO Official Gazette (CGPDTM Weekly Bulletin v2024.36), WIPO Patentscope API, and Ministry of Ayush Prior Art Unit.
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono text-[10px] shrink-0">
            <div className="flex items-center gap-1 bg-white px-2.5 py-1 rounded shadow-sm border border-slate-200">
              <span className="text-[#1B5E20]">🛡️</span>
              <span>SHA-256: 8FA1-C039-DE02-77EA</span>
            </div>
            <div className="flex items-center gap-1 bg-white px-2.5 py-1 rounded shadow-sm border border-slate-200 text-[#00263f] font-semibold">
              <span className="text-[#FF9933]">🔒</span>
              <span>GIGW Compliant Level-3</span>
            </div>
          </div>
        </footer>

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
              <table className="w-full text-left text-xs border-collapse">
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
