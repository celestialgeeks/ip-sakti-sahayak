"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// ── Inline SVGs ─────────────────────────────────────────────────────────────
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

function GavelIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 13l-7.5 7.5a2.12 2.12 0 1 1-3-3L11 10M16 8l2-2a2.83 2.83 0 1 1 4 4l-2 2M8 16l4-4M13 3l8 8" />
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

function BookIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function ScienceIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3h6M10 9h4M10 3v6l-4 8a2 2 0 0 0 1.8 2.9h8.4a2 2 0 0 0 1.8-2.9L14 9V3" />
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

function VolumeIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  );
}

function TableIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="3" y1="15" x2="21" y2="15" />
      <line x1="9" y1="3" x2="9" y2="21" />
      <line x1="15" y1="3" x2="15" y2="21" />
    </svg>
  );
}

export default function TKDLPage() {
  const router = useRouter();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState(
    "Ashwagandha Haridra Ghrita | Withania somnifera Curcuma longa | A61K 36/81"
  );
  const [selectedTreatise, setSelectedTreatise] = useState("Charaka Samhita (चर्क संहिता)");
  const [selectedKarma, setSelectedKarma] = useState("Shothahara (Anti-inflammatory / Arthritic)");
  const [selectedKalpana, setSelectedKalpana] = useState("Ghrita / Sneha Paka (Medicated Lipid Base)");
  const [selectedLegal, setSelectedLegal] = useState("Section 3(p) · Absolute Classical Bar");

  // Active Parameters tags
  const [activeTags, setActiveTags] = useState([
    { id: "1", label: "IPC: A61K 36/81", color: "bg-blue-100 text-[#00263f]" },
    { id: "2", label: "Treatise: Charaka Samhita", color: "bg-blue-100 text-[#00263f]" },
    { id: "3", label: "Withania + Curcuma Synergistic Base", color: "bg-green-100 text-[#0c5216]" },
  ]);

  // Dossier Detail Tabs
  const [activeDossierTab, setActiveDossierTab] = useState<
    "treatise" | "pharmacology" | "phytochemical" | "defense"
  >("treatise");

  // Audio Play State Simulation
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Modals
  const [activeModal, setActiveModal] = useState<
    "validate_citation" | "high_res_folio" | "legal_precedents" | "third_party_memo" | "signed_cert" | null
  >(null);

  const handleToggleAudio = () => {
    setIsPlayingAudio(!isPlayingAudio);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setActiveTags([]);
  };

  const handleRemoveTag = (id: string) => {
    setActiveTags((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="w-full min-h-[calc(100vh-95px)] bg-[#F4F6F9] text-[#111c2d]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* ── Page Header & Sovereign Action Center ─────────────────────── */}
        <section className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 pb-2">
          <div className="flex flex-col max-w-4xl space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-blue-100 text-[#00263f] text-[11px] font-bold uppercase tracking-wide">
                <CheckVerifiedIcon className="w-3.5 h-3.5 text-[#FF9933]" />
                Official Concordance · CSIR-NIScPR & Ayush Joint System
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-xs font-semibold text-[#2a6b2c]">
                G.S.R. 513(E) Compliant
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-[#00263f] tracking-tight">
              Ayurvedic Library & Classical Knowledge Registry
            </h1>

            <p className="text-sm text-slate-600 leading-relaxed">
              Official digital concordance of ASU formulations, Sanskrit classical citations, phytochemical profiles, and verified therapeutic compounding ratios under Section 3(p) of the Indian Patents Act, 1970.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => alert("Synchronized with CSIR-NIScPR TKDL digital servers.")}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-100 text-[#00263f] text-xs font-semibold rounded-lg shadow-sm border border-slate-200 transition-colors"
            >
              <SyncIcon className="w-4 h-4 text-[#00263f]" />
              <span>Sync CSIR-TKDL</span>
            </button>

            <button
              type="button"
              onClick={() => router.push("/patents")}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-100 text-[#00263f] text-xs font-semibold rounded-lg shadow-sm border border-slate-200 transition-colors"
            >
              <GavelIcon className="w-4 h-4 text-[#E65100]" />
              <span>Cross-Check Patent Claims</span>
            </button>

            <button
              type="button"
              onClick={() => {
                alert("Generating official bilingual TKDL Registry XML & PDF Dossier...");
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#00263f] hover:bg-[#001d32] text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
            >
              <DownloadIcon className="w-4 h-4 text-[#FF9933]" />
              <span>Export Dossier (XML/PDF)</span>
            </button>
          </div>
        </section>

        {/* ── Real-Time Registry Statistics Metrics Bar ─────────────────── */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Digitized Formulations
              </span>
              <div className="text-2xl sm:text-3xl font-bold text-[#00263f]">
                384,192
              </div>
              <span className="text-xs text-[#2a6b2c] font-semibold flex items-center gap-1 pt-0.5">
                <CheckVerifiedIcon className="w-3.5 h-3.5" />
                100% IPC Indexed
              </span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#00263f] flex items-center justify-center">
              <BookIcon className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Classical Treatises
              </span>
              <div className="text-2xl sm:text-3xl font-bold text-[#00263f]">
                156 Texts
              </div>
              <span className="text-xs text-slate-500 block pt-0.5">
                Veda to 19th Century CE
              </span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#00263f] flex items-center justify-center">
              <span className="text-lg">📜</span>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Botanical Flora Classified
              </span>
              <div className="text-2xl sm:text-3xl font-bold text-[#00263f]">
                12,480
              </div>
              <span className="text-xs text-[#2a6b2c] font-semibold flex items-center gap-1 pt-0.5">
                <ScienceIcon className="w-3.5 h-3.5" />
                Phytochemical verified
              </span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#00263f] flex items-center justify-center">
              <span className="text-lg">🌿</span>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Prior Art Defense Success
              </span>
              <div className="text-2xl sm:text-3xl font-bold text-[#1B5E20]">
                99.82%
              </div>
              <span className="text-xs text-slate-500 block pt-0.5">
                EPO • USPTO • JPO • CIPO
              </span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-green-50 text-[#1B5E20] flex items-center justify-center">
              <ShieldIcon className="w-5 h-5 text-[#1B5E20]" />
            </div>
          </div>
        </section>

        {/* ── Advanced Search & Classical Treatise Filter Console ───────── */}
        <section className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          {/* Search Line */}
          <div className="relative w-full flex items-center">
            <SearchIcon className="w-5 h-5 absolute left-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Sanskrit shloka, classical yoga name (e.g. Ashwagandharishta, Trikatu), IPC code (A61K 36/00), or botanical name..."
              className="w-full pl-11 pr-28 py-3 bg-[#F4F6F9] text-sm text-[#00263f] rounded-lg border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00263f]"
            />
            <button
              type="button"
              className="absolute right-1.5 px-4 py-2 bg-[#00263f] text-white text-xs font-bold rounded-md hover:bg-[#001d32] shadow-sm transition-colors"
            >
              Search TKDL
            </button>
          </div>

          {/* 4 Classification Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Classical Source Treatise
              </label>
              <select
                value={selectedTreatise}
                onChange={(e) => setSelectedTreatise(e.target.value)}
                className="w-full px-3 py-2 bg-[#F4F6F9] border border-slate-200 text-xs rounded-lg text-slate-800 focus:bg-white focus:outline-none cursor-pointer"
              >
                <option>Charaka Samhita (चर्क संहिता)</option>
                <option>Sushruta Samhita (सुश्रुत संहिता)</option>
                <option>Ashtanga Hridaya (अष्टाङ्ग हृदयम्)</option>
                <option>Bhavaprakasha Nighantu (भावप्रकाश)</option>
                <option>Sarangadhara Samhita (शार्ङ्गधर)</option>
                <option>Chakradatta (चक्रदत्त)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Therapeutic Action (Karma)
              </label>
              <select
                value={selectedKarma}
                onChange={(e) => setSelectedKarma(e.target.value)}
                className="w-full px-3 py-2 bg-[#F4F6F9] border border-slate-200 text-xs rounded-lg text-slate-800 focus:bg-white focus:outline-none cursor-pointer"
              >
                <option>Shothahara (Anti-inflammatory / Arthritic)</option>
                <option>Rasayana (Immunomodulatory & Longevity)</option>
                <option>Deepana-Pachana (Bioavailability & Digestion)</option>
                <option>Jwarahara (Antipyretic / Febrile)</option>
                <option>Medhya (Neuro-protective & Nootropic)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Kalpana (Dosage Matrix)
              </label>
              <select
                value={selectedKalpana}
                onChange={(e) => setSelectedKalpana(e.target.value)}
                className="w-full px-3 py-2 bg-[#F4F6F9] border border-slate-200 text-xs rounded-lg text-slate-800 focus:bg-white focus:outline-none cursor-pointer"
              >
                <option>Ghrita / Sneha Paka (Medicated Lipid Base)</option>
                <option>Kwatha / Kashaya (Aqueous Decoction)</option>
                <option>Churna / Choorna (Micro-pulverized Powder)</option>
                <option>Vati / Gutika (Compacted Tablet)</option>
                <option>Asava-Arishta (Bio-fermented Extract)</option>
                <option>Taila (Medicated Sesame Oil)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Legal Invalidation Status
              </label>
              <select
                value={selectedLegal}
                onChange={(e) => setSelectedLegal(e.target.value)}
                className="w-full px-3 py-2 bg-[#F4F6F9] border border-slate-200 text-xs rounded-lg text-slate-800 focus:bg-white focus:outline-none cursor-pointer"
              >
                <option>Section 3(p) · Absolute Classical Bar</option>
                <option>Section 3(e) · Mere Admixture (No Synergism)</option>
                <option>Section 3(d) · New Form / Known Substance</option>
                <option>Active Global Third-Party Observation Sent</option>
              </select>
            </div>
          </div>

          {/* Quick Active Filter Tags */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
            <span className="text-xs text-slate-500 font-semibold">Active Search Parameters:</span>
            {activeTags.map((tag) => (
              <span
                key={tag.id}
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold ${tag.color}`}
              >
                <span>{tag.label}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag.id)}
                  className="hover:text-red-600 font-bold ml-1 text-slate-400"
                >
                  ✕
                </button>
              </span>
            ))}
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs font-semibold text-[#00263f] hover:underline ml-auto"
            >
              Reset all criteria
            </button>
          </div>
        </section>

        {/* ── Featured Formulation Deep-Dive Dossier ─────────────────────── */}
        <section className="bg-white rounded-xl border border-slate-200 shadow-md overflow-hidden">
          {/* Top Identity Bar */}
          <div className="bg-gradient-to-r from-[#002855] via-[#0b3c5d] to-[#00263f] p-6 text-white">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-white/15 text-white font-mono text-xs tracking-wider">
                    TKDL/AYU/CS-2845
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white/15 text-white font-mono text-xs">
                    IPC CLASS: A61K 36/81 · A61K 36/9066
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#FF9933] text-slate-900 text-xs font-bold tracking-wide">
                    SEC 3(p) & 3(e) ABSOLUTE BAR
                  </span>
                  <span className="px-2 py-0.5 rounded bg-green-200 text-[#0c5216] text-xs font-bold flex items-center gap-1">
                    <CheckVerifiedIcon className="w-3.5 h-3.5" />
                    Prior Art Pre-Dates 1000 BCE
                  </span>
                </div>

                <div className="flex flex-wrap items-baseline gap-3 pt-1">
                  <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-serif">
                    अश्वगन्धाद्य घृतम्
                  </h2>
                  <span className="text-lg text-blue-100 font-semibold">
                    Ashwagandhadya Ghrita (Haridra-Ashwagandha Medicated Lipid Compound)
                  </span>
                </div>

                <p className="text-xs text-blue-200 max-w-3xl">
                  Standard Polyherbal Anupana formulation for chronic articular rheumatism, oxidative tissue degeneration, and immuno-neurological enhancement.
                </p>
              </div>

              {/* Action Buttons on Header */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveModal("validate_citation")}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#138808] hover:bg-[#0f6c06] text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
                >
                  <CheckVerifiedIcon className="w-4 h-4" />
                  <span>Validate Examiner Citation</span>
                </button>
                <button
                  type="button"
                  onClick={() => alert("Formulation bookmarked to your desk.")}
                  className="p-2 bg-white/15 hover:bg-white/25 text-white rounded-lg text-xs transition-colors"
                  title="Bookmark formulation"
                >
                  🔖
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Navigation Tabs for Classical Dossier */}
          <div className="flex items-center gap-2 p-2 bg-slate-100 border-b border-slate-200 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveDossierTab("treatise")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold shrink-0 transition-all ${
                activeDossierTab === "treatise"
                  ? "bg-[#00263f] text-white shadow-sm"
                  : "bg-white text-slate-700 hover:text-[#00263f] border border-slate-200"
              }`}
            >
              <BookIcon className="w-4 h-4" />
              <span>Classical Treatise & Shloka Concordance</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveDossierTab("pharmacology")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold shrink-0 transition-all ${
                activeDossierTab === "pharmacology"
                  ? "bg-[#00263f] text-white shadow-sm"
                  : "bg-white text-slate-700 hover:text-[#00263f] border border-slate-200"
              }`}
            >
              <TableIcon className="w-4 h-4" />
              <span>Botanical Compounding & Exact Ratios</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveDossierTab("phytochemical")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold shrink-0 transition-all ${
                activeDossierTab === "phytochemical"
                  ? "bg-[#00263f] text-white shadow-sm"
                  : "bg-white text-slate-700 hover:text-[#00263f] border border-slate-200"
              }`}
            >
              <ScienceIcon className="w-4 h-4" />
              <span>Phytochemical Markers & Rasa Panchaka</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveDossierTab("defense")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold shrink-0 transition-all ${
                activeDossierTab === "defense"
                  ? "bg-[#00263f] text-white shadow-sm"
                  : "bg-white text-slate-700 hover:text-[#00263f] border border-slate-200"
              }`}
            >
              <ShieldIcon className="w-4 h-4 text-[#FF9933]" />
              <span>Patent Scrutiny Memo & Section 3(p) Defense</span>
            </button>
          </div>

          {/* Dossier Content Area */}
          <div className="p-6">

            {/* TAB 1: Classical Treatise & Sanskrit Shloka Concordance */}
            {activeDossierTab === "treatise" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Devanagari Classical Citation */}
                <div className="lg:col-span-8 space-y-4 bg-slate-50 p-6 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#FF9933]" />
                      <span className="text-xs font-bold uppercase tracking-wider text-[#00263f]">
                        Charaka Samhita · Chikitsasthanam (चिकित्सास्थानम्)
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-500">
                        Chapter 28 (Vatavyadhi Chikitsa) · Verses 45-48
                      </span>
                      <button
                        type="button"
                        onClick={handleToggleAudio}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                          isPlayingAudio
                            ? "bg-[#2a6b2c] text-white animate-pulse"
                            : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <VolumeIcon className="w-3.5 h-3.5" />
                        <span>{isPlayingAudio ? "Playing Chanting..." : "Recitation"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Sanskrit Calligraphy */}
                  <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-inner">
                    <p className="text-base sm:text-lg text-[#00263f] leading-loose font-serif font-medium">
                      अश्वगन्धाकषायेण पिष्ट्वा हरिद्रया सह ।<br />
                      घृतं पचेत् पयोयुक्तं वातशोथहरं परम् ॥ ४५ ॥<br />
                      पिप्पलीचूर्णसंयुक्तं दीपनं बलवर्धनम् ।<br />
                      सन्धिशूलं प्रणुदति मेध्यं वयःस्थापनं परम् ॥ ४६ ॥
                    </p>
                  </div>

                  {/* IAST & Translation */}
                  <div className="space-y-3 text-xs sm:text-sm text-slate-700">
                    <div className="flex items-start gap-2">
                      <span className="font-bold text-[#00263f] uppercase w-20 shrink-0 text-xs">
                        IAST :
                      </span>
                      <p className="font-mono text-xs leading-relaxed text-slate-600">
                        aśvagandhā-kaṣāyeṇa piṣṭvā haridrayā saha | ghṛtaṁ pacet payo-yuktaṁ vāta-śotha-haraṁ param || 45 || pippalī-cūrṇa-saṁyuktaṁ dīpanaṁ bala-vardhanam | sandhi-śūlaṁ praṇudati medhyaṁ vayaḥ-sthāpanaṁ param || 46 ||
                      </p>
                    </div>

                    <div className="flex items-start gap-2 pt-2 border-t border-slate-200">
                      <span className="font-bold text-[#2a6b2c] uppercase w-20 shrink-0 text-xs">
                        Translation :
                      </span>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        "Having prepared a decoction of Ashwagandha (Withania somnifera) and blending it with the fine paste of Haridra (Curcuma longa rhizome), one should simmer pure cow's ghee (Ghrita) compounded with fresh cow's milk until the medicated lipid maturation (Sneha Paka) is attained. Blended further with the bio-activating powder of Pippali (Piper longum), this formulation supremely alleviates Vata-induced inflammatory swellings (Sandhi-Shotha), cures intractable joint-arthralgia, accelerates tissue vitality (Bala-Vardhana), stimulates deep metabolic assimilation, and serves as an eminent longevity adaptogen (Vayah-Sthapana)."
                      </p>
                    </div>
                  </div>
                </div>

                {/* Folio Provenance Sidebar */}
                <div className="lg:col-span-4 space-y-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#00263f] flex items-center gap-1.5">
                      <CheckVerifiedIcon className="w-4 h-4 text-[#138808]" />
                      Historical Folio Provenance
                    </h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between p-2 bg-white rounded border border-slate-100">
                        <span className="text-slate-500">Corpus Epoch:</span>
                        <span className="font-semibold text-slate-800">Vedic / Classical (~1000 BCE)</span>
                      </div>
                      <div className="flex justify-between p-2 bg-white rounded border border-slate-100">
                        <span className="text-slate-500">Archival MS ID:</span>
                        <span className="font-mono font-bold text-[#00263f]">BORI-MS-7402/Vol-IV</span>
                      </div>
                      <div className="flex justify-between p-2 bg-white rounded border border-slate-100">
                        <span className="text-slate-500">Script & Language:</span>
                        <span className="font-medium text-slate-800">Devanagari / Vedic Sanskrit</span>
                      </div>
                      <div className="flex justify-between p-2 bg-white rounded border border-slate-100">
                        <span className="text-slate-500">National Library Record:</span>
                        <span className="font-mono text-slate-700">NL-KOL/CS-0921-A</span>
                      </div>
                    </div>

                    {/* Folio Scan Box */}
                    <div className="rounded-lg border border-slate-200 overflow-hidden bg-white">
                      <div className="p-3 bg-amber-50 border-b border-amber-200 text-amber-900 font-mono text-[11px] text-center">
                        📜 Folio 148B · Charaka Samhita (1000 BCE)
                      </div>
                      <div className="p-4 text-center text-xs text-slate-500">
                        <span>Palm-leaf manuscript digitization index #7402</span>
                        <button
                          type="button"
                          onClick={() => setActiveModal("high_res_folio")}
                          className="block mx-auto mt-2 text-xs font-bold text-[#00263f] hover:underline"
                        >
                          View High-Res Manuscript Scan →
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Statutory Precedent */}
                  <div className="bg-[#00263f] p-4 rounded-xl text-white shadow-sm space-y-2">
                    <div className="flex items-center gap-1.5 text-[#FF9933] text-xs font-bold uppercase tracking-wider">
                      <span>⚖️</span>
                      <span>Statutory Precedent</span>
                    </div>
                    <p className="text-xs text-blue-100 leading-relaxed">
                      Cited in 42 international patent revocations including EPO Application EP1984021 and USPTO US8921412.
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveModal("legal_precedents")}
                      className="w-full mt-1 py-1.5 px-3 bg-white/15 hover:bg-white/25 text-white rounded text-xs font-semibold transition-colors"
                    >
                      Review 42 Legal Precedents
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Botanical Compounding & Exact Ratios */}
            {activeDossierTab === "pharmacology" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-[#00263f]">
                      Classical Master Compounding Ratio & Modern Standardized Equivalents
                    </h3>
                    <p className="text-xs text-slate-500">
                      Standard Sneha Kalpana matrix as recorded in Ayurvedic Pharmacopoeia of India (API Part II, Vol I).
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded bg-blue-100 text-[#00263f] text-xs font-bold">
                    Maturation Mode: Khara Paka (Oral Use)
                  </span>
                </div>

                <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-[#002855] text-white">
                      <tr>
                        <th className="py-3 px-3.5">Botanical / Source Entity</th>
                        <th className="py-3 px-3.5">Sanskrit Classical Name</th>
                        <th className="py-3 px-3.5">Plant Part</th>
                        <th className="py-3 px-3.5">Ratio</th>
                        <th className="py-3 px-3.5">w/w %</th>
                        <th className="py-3 px-3.5">Standard Phytochemical Marker</th>
                        <th className="py-3 px-3.5">Pharmacological Role</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr className="hover:bg-slate-50">
                        <td className="py-3 px-3.5 font-semibold text-[#00263f]">Withania somnifera (L.) Dunal</td>
                        <td className="py-3 px-3.5">अश्वगन्धा (Ashwagandha)</td>
                        <td className="py-3 px-3.5 text-slate-500">Moola (Dried Root)</td>
                        <td className="py-3 px-3.5 font-mono font-bold text-[#00263f]">1 Part</td>
                        <td className="py-3 px-3.5 font-mono">12.5%</td>
                        <td className="py-3 px-3.5 text-xs text-blue-700">Withanolide A & D ≥ 2.5 mg/g</td>
                        <td className="py-3 px-3.5 text-slate-600">Primary adaptogenic & chondroprotective active</td>
                      </tr>
                      <tr className="hover:bg-slate-50 bg-slate-50/50">
                        <td className="py-3 px-3.5 font-semibold text-[#00263f]">Curcuma longa L.</td>
                        <td className="py-3 px-3.5">हरिद्रा (Haridra)</td>
                        <td className="py-3 px-3.5 text-slate-500">Kanda (Rhizome)</td>
                        <td className="py-3 px-3.5 font-mono font-bold text-[#00263f]">1 Part</td>
                        <td className="py-3 px-3.5 font-mono">12.5%</td>
                        <td className="py-3 px-3.5 text-xs text-[#E65100]">Curcuminoids ≥ 95% Standard</td>
                        <td className="py-3 px-3.5 text-slate-600">Direct NF-kB inhibition, potent Shothahara action</td>
                      </tr>
                      <tr className="hover:bg-slate-50">
                        <td className="py-3 px-3.5 font-semibold text-[#00263f]">Piper longum L.</td>
                        <td className="py-3 px-3.5">पिप्पली (Pippali)</td>
                        <td className="py-3 px-3.5 text-slate-500">Phala (Fruit Spike)</td>
                        <td className="py-3 px-3.5 font-mono font-bold text-[#00263f]">0.25 Part</td>
                        <td className="py-3 px-3.5 font-mono">3.125%</td>
                        <td className="py-3 px-3.5 text-xs text-slate-700">Piperine ≥ 4.0% HPLC</td>
                        <td className="py-3 px-3.5 font-semibold text-[#1B5E20]">Yogavahi: Increases Curcumin bioavailability by 2000%</td>
                      </tr>
                      <tr className="hover:bg-slate-50 bg-slate-50/50">
                        <td className="py-3 px-3.5 font-semibold text-[#00263f]">Go-Ghrita (Cow Ghee)</td>
                        <td className="py-3 px-3.5">गोघृत (Go-Ghrita)</td>
                        <td className="py-3 px-3.5 text-slate-500">Lipid Medium (Anupana)</td>
                        <td className="py-3 px-3.5 font-mono font-bold text-[#00263f]">4 Parts</td>
                        <td className="py-3 px-3.5 font-mono">50.0%</td>
                        <td className="py-3 px-3.5 text-xs text-slate-500">Conjugated Linoleic Acid / Butyrate</td>
                        <td className="py-3 px-3.5 text-slate-600">Crosses synovial barrier, lipid carrier</td>
                      </tr>
                      <tr className="hover:bg-slate-50">
                        <td className="py-3 px-3.5 font-semibold text-[#00263f]">Godugdha (Bovine Milk Decoction)</td>
                        <td className="py-3 px-3.5">क्षीर (Ksheera)</td>
                        <td className="py-3 px-3.5 text-slate-500">Liquid Drava Dravya</td>
                        <td className="py-3 px-3.5 font-mono font-bold text-[#00263f]">16 Parts</td>
                        <td className="py-3 px-3.5 font-mono">Reduced in Paka</td>
                        <td className="py-3 px-3.5 text-xs text-slate-500">Bioactive Peptides / Lactoferrin</td>
                        <td className="py-3 px-3.5 text-slate-600">Pitta-shamaka buffering matrix</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Proportion Strip */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                  <span className="text-xs font-bold text-[#00263f]">
                    Compounding Matrix Proportions (Sneha Kalpana Law):
                  </span>
                  <div className="h-6 w-full flex rounded-lg overflow-hidden shadow-inner text-[10px] font-bold text-white">
                    <div className="bg-[#00263f] flex items-center justify-center" style={{ width: "12.5%" }}>12.5% Withania</div>
                    <div className="bg-[#FF9933] text-slate-900 flex items-center justify-center" style={{ width: "12.5%" }}>12.5% Curcuma</div>
                    <div className="bg-[#451300] flex items-center justify-center" style={{ width: "3.125%" }}>3%</div>
                    <div className="bg-[#B8860B] text-slate-900 flex items-center justify-center" style={{ width: "50%" }}>50% Medicated Cow Ghrita Carrier</div>
                    <div className="bg-[#396285] flex items-center justify-center" style={{ width: "21.875%" }}>22% Ksheera Matrix</div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Phytochemical Markers & Rasa Panchaka */}
            {activeDossierTab === "phytochemical" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] uppercase font-bold text-[#00263f]">Steroidal Lactone</span>
                        <span className="font-mono text-xs bg-white px-2 py-0.5 rounded border">C28H38O6</span>
                      </div>
                      <h4 className="text-base font-bold text-[#00263f] mt-1">Withaferin A & Withanolide D</h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        Potent inhibitor of angiogenesis and IkB kinase complex. Modulates GABAergic neurotransmission.
                      </p>
                      <div className="mt-3 p-2 bg-white rounded border border-slate-100 text-xs">
                        <span className="font-semibold text-[#00263f]">Target:</span> IL-6, TNF-a suppression (IC50 = 12 uM)
                      </div>
                    </div>
                    <div className="pt-2 border-t border-slate-200 flex justify-between text-xs text-slate-500">
                      <span className="text-[#1B5E20] font-bold">✓ HPTLC Validated</span>
                      <span className="font-mono">Rf: 0.42</span>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] uppercase font-bold text-[#E65100]">Polyphenolic Curcuminoid</span>
                        <span className="font-mono text-xs bg-white px-2 py-0.5 rounded border">C21H20O6</span>
                      </div>
                      <h4 className="text-base font-bold text-[#00263f] mt-1">Diferuloylmethane (Curcumin I-III)</h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        Selective COX-2 down-regulation without gastric ulcerogenicity. Suppresses AP-1 and reduces MMP-3 and MMP-9.
                      </p>
                      <div className="mt-3 p-2 bg-white rounded border border-slate-100 text-xs">
                        <span className="font-semibold text-[#00263f]">Conjugation:</span> Ghrita micellar core
                      </div>
                    </div>
                    <div className="pt-2 border-t border-slate-200 flex justify-between text-xs text-slate-500">
                      <span className="text-[#1B5E20] font-bold">✓ HPLC Spectrometry</span>
                      <span className="font-mono">λmax: 425 nm</span>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] uppercase font-bold text-[#00263f]">Alkaloid Bio-Enhancer</span>
                        <span className="font-mono text-xs bg-white px-2 py-0.5 rounded border">C17H19NO3</span>
                      </div>
                      <h4 className="text-base font-bold text-[#00263f] mt-1">Piperine (1-Peperoylpiperidine)</h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        Inhibits hepatic and intestinal glucuronidation. Converts low oral bioavailability curcumin into high serum levels.
                      </p>
                      <div className="mt-3 p-2 bg-white rounded border border-slate-100 text-xs">
                        <span className="font-semibold text-[#00263f]">Classical Attribute:</span> Yogavahi (योगवाही गुण)
                      </div>
                    </div>
                    <div className="pt-2 border-t border-slate-200 flex justify-between text-xs text-slate-500">
                      <span className="text-[#1B5E20] font-bold">✓ In-Vitro Verified</span>
                      <span className="font-mono">AUC: +2000%</span>
                    </div>
                  </div>
                </div>

                {/* Rasa Panchaka */}
                <div className="p-5 bg-white rounded-xl border border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#00263f] flex items-center gap-2">
                    <span>🌿</span>
                    Ayurvedic Pharmacodynamics (Dravyaguna Rasa-Panchaka Concordance)
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs text-center">
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-slate-500 font-semibold block">Rasa (Taste)</span>
                      <span className="font-bold text-[#00263f] block mt-1">Tikta, Kashaya, Madhura</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-slate-500 font-semibold block">Guna (Attributes)</span>
                      <span className="font-bold text-[#00263f] block mt-1">Guru, Snigdha</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-slate-500 font-semibold block">Virya (Potency)</span>
                      <span className="font-bold text-[#E65100] block mt-1">Ushna (उष्ण)</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-slate-500 font-semibold block">Vipaka (Post-Digestive)</span>
                      <span className="font-bold text-[#00263f] block mt-1">Madhura (मधुर)</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-slate-500 font-semibold block">Dosha Karma</span>
                      <span className="font-bold text-[#1B5E20] block mt-1">Vata-Kapha Shamaka</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: Patent Scrutiny Memo & Section 3(p) Defense */}
            {activeDossierTab === "defense" && (
              <div className="space-y-6">
                <div className="bg-blue-50/60 p-6 rounded-xl border border-blue-200/80 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#00263f] text-white flex items-center justify-center shrink-0">
                      <ShieldIcon className="w-6 h-6 text-[#FF9933]" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-base sm:text-lg font-bold text-[#00263f]">
                        Binding Statutory Notice for Patent Examiners & Search Authorities (CGPDTM / PCT / EPO)
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                        Under <strong>Section 3(p)</strong> of the Indian Patents Act, 1970 (as amended), an invention which in effect is traditional knowledge or an aggregation or duplication of known properties of traditionally known components is <strong>non-patentable subject matter</strong>.
                      </p>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                        Furthermore, under <strong>Section 3(e)</strong>, a substance obtained by a mere admixture resulting only in the aggregation of the properties of the components thereof is barred. Modern filings claiming novel synergy between <em>Withania somnifera</em> (Ashwagandha) and <em>Curcuma longa</em> (Turmeric) in lipid medium fail the statutory test unless applicant proves a Combination Index (Chou-Talalay CI &lt; 0.55) exceeding the verified classical ratio documented in TKDL/AYU/CS-2845.
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-blue-200 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded bg-red-600 text-white font-bold text-xs">
                        ESTABLISHED PRIOR ART: 1000 BCE
                      </span>
                      <span className="text-xs text-slate-600">
                        IPO Binding Circular: CGPDTM/TKDL/2021/4
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveModal("third_party_memo")}
                        className="px-4 py-2 bg-[#00263f] text-white text-xs font-semibold rounded-lg hover:bg-[#001d32] shadow-sm transition-colors flex items-center gap-1.5"
                      >
                        <GavelIcon className="w-4 h-4" />
                        <span>Generate Third-Party Objection Memo</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveModal("signed_cert")}
                        className="px-4 py-2 bg-white text-[#00263f] text-xs font-semibold rounded-lg border border-slate-300 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
                      >
                        <DownloadIcon className="w-4 h-4" />
                        <span>Download Signed Prior Art Certificate</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </section>

        {/* ── Related Prior-Art Formulations Mini-Grid ───────────────────── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-[#00263f]">
                Related Prior-Art Formulations & Classical Yogas
              </h3>
              <p className="text-xs text-slate-500">
                Active records with verified Section 3(p) statutory clearance certificates.
              </p>
            </div>
            <button
              type="button"
              onClick={() => alert("Loading full catalog of 384,192 formulations...")}
              className="text-xs font-bold text-[#00263f] hover:underline"
            >
              View all 384,192 records in Registry →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: Trikatu Churna */}
            <article className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#00263f] bg-blue-100 px-2 py-0.5 rounded">
                    TKDL/AYU/SS-1108
                  </span>
                  <span className="px-2 py-0.5 rounded bg-green-100 text-[#0c5216] text-[10px] font-bold">
                    Sec 3(p) Protected
                  </span>
                </div>
                <h4 className="text-base font-bold text-[#00263f]">त्रिकटु चूर्ण (Trikatu Churna)</h4>
                <p className="text-xs text-slate-500">Sushruta Samhita · Sutrasthanam 38.58</p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Sunthi (Zingiber officinale), Maricha (Piper nigrum), and Pippali (Piper longum) in strict 1:1:1 stoichiometric ratio. Classical Deepana, Pachana, and systemic bio-enhancing adjuvant.
                </p>
                <div className="flex flex-wrap gap-1 pt-1">
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[11px] font-mono">Piperine 3.8%</span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[11px] font-mono">6-Gingerol 1.4%</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">IPC: A61K 36/9068</span>
                <button
                  type="button"
                  onClick={() => setSearchQuery("Trikatu Churna | Piper longum Zingiber officinale | A61K 36/9068")}
                  className="text-xs font-bold text-[#00263f] hover:underline"
                >
                  Inspect Data →
                </button>
              </div>
            </article>

            {/* Card 2: Triphala Guggulu */}
            <article className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#00263f] bg-blue-100 px-2 py-0.5 rounded">
                    TKDL/AYU/SR-0412
                  </span>
                  <span className="px-2 py-0.5 rounded bg-green-100 text-[#0c5216] text-[10px] font-bold">
                    Sec 3(p) Protected
                  </span>
                </div>
                <h4 className="text-base font-bold text-[#00263f]">त्रिफला गुग्गुलु (Triphala Guggulu)</h4>
                <p className="text-xs text-slate-500">Sarngadhara Samhita · Madhyama Khanda 7.82</p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Haritaki, Bibhitaki, Amalaki combined with Shuddha Guggulu resin and Pippali. Classical formulation for lipid metabolism disorders (Medoroga), sinus fistulae, and inflammatory joint degeneration.
                </p>
                <div className="flex flex-wrap gap-1 pt-1">
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[11px] font-mono">Guggulsterone E&Z</span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[11px] font-mono">Gallic Acid 4.2%</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">IPC: A61K 36/185</span>
                <button
                  type="button"
                  onClick={() => setSearchQuery("Triphala Guggulu | Commiphora mukul Terminalia chebula | A61K 36/185")}
                  className="text-xs font-bold text-[#00263f] hover:underline"
                >
                  Inspect Data →
                </button>
              </div>
            </article>

            {/* Card 3: Brahmi Ghrita */}
            <article className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#00263f] bg-blue-100 px-2 py-0.5 rounded">
                    TKDL/AYU/AS-0914
                  </span>
                  <span className="px-2 py-0.5 rounded bg-green-100 text-[#0c5216] text-[10px] font-bold">
                    Sec 3(p) Protected
                  </span>
                </div>
                <h4 className="text-base font-bold text-[#00263f]">ब्राह्मी घृतम् (Brahmi Ghrita)</h4>
                <p className="text-xs text-slate-500">Ashtanga Hridaya · Uttarasthana 6.23</p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Bacopa monnieri fresh leaf juice cooked in aged Go-Ghrita with Shankhpushpi, Vacha, and Maricha. Canonical Medhya Rasayana indicated for cognitive decline, convulsions, and mental fatigue.
                </p>
                <div className="flex flex-wrap gap-1 pt-1">
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[11px] font-mono">Bacoside A & B ≥ 20%</span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[11px] font-mono">Lipid Delivery Matrix</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">IPC: A61K 36/68</span>
                <button
                  type="button"
                  onClick={() => setSearchQuery("Brahmi Ghrita | Bacopa monnieri Convolvulus pluricaulis | A61K 36/68")}
                  className="text-xs font-bold text-[#00263f] hover:underline"
                >
                  Inspect Data →
                </button>
              </div>
            </article>
          </div>
        </section>

        {/* ── Government Footer Concordance Disclaimer ──────────────────── */}
        <footer className="p-4 bg-slate-200/60 rounded-xl border border-slate-300/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <GavelIcon className="w-4 h-4 text-[#00263f]" />
            <span>
              Confidential Government of India Knowledge Concordance · Access restricted to Authorized International Patent Offices & CGPDTM Patent Examiners under bilateral TKDL Access Agreements.
            </span>
          </div>
          <div className="flex items-center gap-4 shrink-0 font-semibold text-xs">
            <span className="text-[#1B5E20] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#1B5E20]" />
              API Node V2.8 Secure
            </span>
            <span>ISO 27001 Certified</span>
          </div>
        </footer>

      </div>

      {/* ── MODALS ──────────────────────────────────────────────────────── */}

      {/* 1. Validate Examiner Citation Modal */}
      {activeModal === "validate_citation" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 text-xs sm:text-sm border border-slate-200 space-y-4">
            <h3 className="font-bold text-base text-[#00263f]">Examiner Citation Verification Protocol</h3>
            <p className="text-slate-600 leading-relaxed">
              Official verification for patent examiners referencing <strong>TKDL/AYU/CS-2845</strong>:
            </p>
            <div className="p-3 bg-green-50 border border-green-200 rounded text-xs space-y-1 text-green-900">
              <div><strong>Status:</strong> Legally Enforceable Prior Art</div>
              <div><strong>International Treaty Binding:</strong> Yes (WIPO / EPO / USPTO TKDL Agreement)</div>
              <div><strong>Section 3(p) Invalidation Probability:</strong> 99.8%</div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setActiveModal(null)} className="px-4 py-2 bg-[#00263f] text-white text-xs font-semibold rounded">
                Close Verification
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. High Res Folio Manuscript Modal */}
      {activeModal === "high_res_folio" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 text-xs sm:text-sm border border-slate-200 space-y-4">
            <h3 className="font-bold text-base text-[#00263f]">Charaka Samhita — Folio 148B High-Resolution Scan</h3>
            <div className="p-4 bg-amber-50 border border-amber-300 rounded font-serif text-center space-y-2">
              <div className="text-lg text-amber-900 font-bold">॥ चरकसंहिता चिकित्सास्थानम् अ.२८ ॥</div>
              <p className="text-xs text-amber-800 italic">
                Aged birch-bark manuscript archival record cataloged under Bhandarkar Oriental Research Institute MS-7402. Transcribed into International Patent Classification A61K 36/81.
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setActiveModal(null)} className="px-4 py-2 bg-[#00263f] text-white text-xs font-semibold rounded">
                Close Manuscript
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Legal Precedents Modal */}
      {activeModal === "legal_precedents" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden border border-slate-200">
            <div className="p-5 bg-[#00263f] text-white flex items-center justify-between">
              <h3 className="font-bold text-base">42 International Legal Precedents (TKDL Citations)</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-300 hover:text-white text-xl font-bold">
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-3 text-xs">
              <div className="p-3 bg-slate-50 border rounded flex justify-between">
                <div>
                  <div className="font-bold text-[#00263f]">EPO Application EP1984021 (Withania/Curcumin Topical)</div>
                  <div className="text-slate-500">Applicant withdrew claims after TKDL Article 115 Third-Party Observation.</div>
                </div>
                <span className="font-bold text-red-600">Claims Revoked</span>
              </div>
              <div className="p-3 bg-slate-50 border rounded flex justify-between">
                <div>
                  <div className="font-bold text-[#00263f]">USPTO Patent US8921412 (Anti-arthritic Lipid Composition)</div>
                  <div className="text-slate-500">Invalidated under 35 U.S.C. 102 prior art citing Charaka Samhita.</div>
                </div>
                <span className="font-bold text-red-600">Invalidated</span>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button onClick={() => setActiveModal(null)} className="px-4 py-2 bg-[#00263f] text-white text-xs rounded font-semibold">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Third-Party Memo Modal */}
      {activeModal === "third_party_memo" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full p-6 text-xs sm:text-sm border border-slate-200 space-y-4">
            <h3 className="font-bold text-base text-[#00263f]">Third-Party Observation Memo Generator</h3>
            <p className="text-slate-600">
              Generate an official Article 115 EPC / 37 CFR 1.290 USPTO Third-Party Prior Art submission based on Ashwagandhadya Ghrita.
            </p>
            <div className="p-3 bg-slate-50 border rounded text-xs text-slate-700 space-y-1">
              <div><strong>Treatise Cited:</strong> Charaka Samhita Chikitsa 28/45-48</div>
              <div><strong>Statutory Invalidation Ground:</strong> Absolute prior art anticipatory bar</div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setActiveModal(null)} className="px-4 py-2 bg-slate-200 text-slate-700 text-xs font-semibold rounded">
                Cancel
              </button>
              <button
                onClick={() => {
                  alert("Third-Party Observation Memo generated and signed.");
                  setActiveModal(null);
                }}
                className="px-4 py-2 bg-[#00263f] text-white text-xs font-semibold rounded"
              >
                Download Signed Submission
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Signed Prior Art Certificate Modal */}
      {activeModal === "signed_cert" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 text-xs sm:text-sm border border-slate-200 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-green-100 text-[#1B5E20] flex items-center justify-center mx-auto text-xl">
              ✓
            </div>
            <h3 className="font-bold text-base text-[#00263f]">Signed Prior Art Certificate</h3>
            <p className="text-slate-600 text-xs">
              CSIR-NIScPR & Ministry of Ayush certified prior art document for <strong>Ashwagandhadya Ghrita (TKDL/AYU/CS-2845)</strong>.
            </p>
            <div className="font-mono text-[11px] text-slate-500 bg-slate-50 p-2 rounded">
              Digital Signature: CGPDTM-CSIR-2024-8849-VALID
            </div>
            <div className="flex justify-center gap-2 pt-2">
              <button
                onClick={() => {
                  alert("Certified Prior Art Certificate PDF downloaded.");
                  setActiveModal(null);
                }}
                className="px-4 py-2 bg-[#1B5E20] text-white text-xs font-bold rounded"
              >
                Download PDF Certificate
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
