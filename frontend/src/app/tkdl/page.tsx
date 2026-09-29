"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/interfaces-select";

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

// Trigger styling shared by the four filter-console dropdowns.
const filterTriggerCls =
  "w-full rounded-md border-slate-200 bg-[#F4F6F9] text-xs text-slate-800 data-[state=open]:bg-white";
// Keeps option rows at the dense 12px scale used by this console.
const filterContentCls = "[&_[data-slot=select-item]]:text-xs";

// ── Console content ─────────────────────────────────────────────────────────
// Headline metrics, rendered as one dense strip (label + value + note per tile).
const REGISTRY_STATS: {
  label: string; value: string; valueCls: string; note: string; noteCls: string;
  icon: ReactNode; iconCls: string;
}[] = [
  {
    label: "Digitized Formulations", value: "384,192", valueCls: "text-[#00263f]",
    note: "100% IPC indexed", noteCls: "text-[#2a6b2c]",
    icon: <BookIcon className="w-4 h-4" />, iconCls: "bg-blue-50 text-[#00263f]",
  },
  {
    label: "Classical Treatises", value: "156", valueCls: "text-[#00263f]",
    note: "Texts · Veda → 19th C.", noteCls: "text-slate-500",
    icon: <span className="text-base leading-none">📜</span>, iconCls: "bg-blue-50 text-[#00263f]",
  },
  {
    label: "Botanical Flora", value: "12,480", valueCls: "text-[#00263f]",
    note: "Phyto-verified", noteCls: "text-[#2a6b2c]",
    icon: <span className="text-base leading-none">🌿</span>, iconCls: "bg-green-50 text-[#1B5E20]",
  },
  {
    label: "Prior-Art Defense", value: "99.82%", valueCls: "text-[#1B5E20]",
    note: "EPO · USPTO · JPO · CIPO", noteCls: "text-slate-500",
    icon: <ShieldIcon className="w-4 h-4 text-[#1B5E20]" />, iconCls: "bg-green-50 text-[#1B5E20]",
  },
];

// Filter console dropdowns — one state slot each (see `INITIAL_FILTERS`).
type FilterKey = "treatise" | "karma" | "kalpana" | "legal";

const FILTER_CONSOLE: { key: FilterKey; label: string; options: string[] }[] = [
  {
    key: "treatise", label: "Source Treatise",
    options: [
      "Charaka Samhita (चर्क संहिता)",
      "Sushruta Samhita (सुश्रुत संहिता)",
      "Ashtanga Hridaya (अष्टाङ्ग हृदयम्)",
      "Bhavaprakasha Nighantu (भावप्रकाश)",
      "Sarangadhara Samhita (शार्ङ्गधर)",
      "Chakradatta (चक्रदत्त)",
    ],
  },
  {
    key: "karma", label: "Therapeutic Action",
    options: [
      "Shothahara (Anti-inflammatory / Arthritic)",
      "Rasayana (Immunomodulatory & Longevity)",
      "Deepana-Pachana (Bioavailability & Digestion)",
      "Jwarahara (Antipyretic / Febrile)",
      "Medhya (Neuro-protective & Nootropic)",
    ],
  },
  {
    key: "kalpana", label: "Kalpana / Dosage",
    options: [
      "Ghrita / Sneha Paka (Medicated Lipid Base)",
      "Kwatha / Kashaya (Aqueous Decoction)",
      "Churna / Choorna (Micro-pulverized Powder)",
      "Vati / Gutika (Compacted Tablet)",
      "Asava-Arishta (Bio-fermented Extract)",
      "Taila (Medicated Sesame Oil)",
    ],
  },
  {
    key: "legal", label: "Legal Status",
    options: [
      "Section 3(p) · Absolute Classical Bar",
      "Section 3(e) · Mere Admixture (No Synergism)",
      "Section 3(d) · New Form / Known Substance",
      "Active Global Third-Party Observation Sent",
    ],
  },
];

const INITIAL_FILTERS: Record<FilterKey, string> = {
  treatise: FILTER_CONSOLE[0].options[0],
  karma: FILTER_CONSOLE[1].options[0],
  kalpana: FILTER_CONSOLE[2].options[0],
  legal: FILTER_CONSOLE[3].options[0],
};

// Deck panels — one full viewport each, reached by scrolling or the dot rail.
const SECTIONS: { id: string; title: string; note: string; icon: ReactNode }[] = [
  {
    id: "registry", icon: <SearchIcon className="w-4 h-4" />,
    title: "Ayurvedic Library & Classical Knowledge Registry",
    note: "Official digital concordance of ASU formulations, Sanskrit classical citations, phytochemical profiles, and verified therapeutic compounding ratios under Section 3(p) of the Indian Patents Act, 1970.",
  },
  {
    id: "treatise", icon: <BookIcon className="w-4 h-4" />,
    title: "Classical Treatise & Shloka Concordance",
    note: "The anchor prior-art record, quoted from the manuscript folio with transliteration and full translation.",
  },
  {
    id: "ratios", icon: <TableIcon className="w-4 h-4" />,
    title: "Botanical Compounding & Exact Ratios",
    note: "Standard Sneha Kalpana matrix as recorded in the Ayurvedic Pharmacopoeia of India (API Part II, Vol I).",
  },
  {
    id: "phytochemistry", icon: <ScienceIcon className="w-4 h-4" />,
    title: "Phytochemical Markers & Rasa Panchaka",
    note: "Marker chemistry for the three actives, read alongside the classical Dravyaguna pharmacodynamics.",
  },
  {
    id: "defense", icon: <ShieldIcon className="w-4 h-4 text-[#FF9933]" />,
    title: "Patent Scrutiny Memo & Section 3(p) Defense",
    note: "Binding statutory notice for patent examiners and search authorities (CGPDTM / PCT / EPO).",
  },
  {
    id: "records", icon: <GavelIcon className="w-4 h-4" />,
    title: "Related Prior-Art Formulations & Classical Yogas",
    note: "Active records with verified Section 3(p) statutory clearance certificates.",
  },
];

function sectionMeta(id: string) {
  return SECTIONS.find((s) => s.id === id) ?? SECTIONS[0];
}

// Sneha Kalpana master formula (Sanskrit + plant part folded into one cell).
const COMPOUND_ROWS: {
  latin: string; sanskrit: string; part: string; ratio: string; pct: string;
  marker: string; markerCls: string; role: string; roleCls: string;
}[] = [
  {
    latin: "Withania somnifera (L.) Dunal", sanskrit: "अश्वगन्धा (Ashwagandha)", part: "Moola (Dried Root)",
    ratio: "1 Part", pct: "12.5%", marker: "Withanolide A & D ≥ 2.5 mg/g", markerCls: "text-blue-700",
    role: "Primary adaptogenic & chondroprotective active", roleCls: "text-slate-600",
  },
  {
    latin: "Curcuma longa L.", sanskrit: "हरिद्रा (Haridra)", part: "Kanda (Rhizome)",
    ratio: "1 Part", pct: "12.5%", marker: "Curcuminoids ≥ 95% Standard", markerCls: "text-[#E65100]",
    role: "Direct NF-kB inhibition, potent Shothahara action", roleCls: "text-slate-600",
  },
  {
    latin: "Piper longum L.", sanskrit: "पिप्पली (Pippali)", part: "Phala (Fruit Spike)",
    ratio: "0.25 Part", pct: "3.125%", marker: "Piperine ≥ 4.0% HPLC", markerCls: "text-slate-700",
    role: "Yogavahi: increases curcumin bioavailability by 2000%", roleCls: "font-semibold text-[#1B5E20]",
  },
  {
    latin: "Go-Ghrita (Cow Ghee)", sanskrit: "गोघृत (Go-Ghrita)", part: "Lipid Medium (Anupana)",
    ratio: "4 Parts", pct: "50.0%", marker: "Conjugated Linoleic Acid / Butyrate", markerCls: "text-slate-500",
    role: "Crosses synovial barrier, lipid carrier", roleCls: "text-slate-600",
  },
  {
    latin: "Godugdha (Bovine Milk Decoction)", sanskrit: "क्षीर (Ksheera)", part: "Liquid Drava Dravya",
    ratio: "16 Parts", pct: "Reduced in Paka", marker: "Bioactive Peptides / Lactoferrin", markerCls: "text-slate-500",
    role: "Pitta-shamaka buffering matrix", roleCls: "text-slate-600",
  },
];

// Proportion bar segments; labels live in the legend so thin slices stay readable.
const MATRIX_SEGMENTS: { name: string; label: string; width: string; cls: string }[] = [
  { name: "Withania", label: "12.5%", width: "12.5%", cls: "bg-[#00263f]" },
  { name: "Curcuma", label: "12.5%", width: "12.5%", cls: "bg-[#FF9933]" },
  { name: "Pippali", label: "3.125%", width: "3.125%", cls: "bg-[#451300]" },
  { name: "Medicated Cow Ghrita Carrier", label: "50%", width: "50%", cls: "bg-[#B8860B]" },
  { name: "Ksheera Matrix", label: "21.875%", width: "21.875%", cls: "bg-[#396285]" },
];

// Related records shown in the right rail (compact concordance cards).
const RELATED_FORMS: {
  acc: string; name: string; source: string; desc: string; markers: string[]; ipc: string; query: string;
}[] = [
  {
    acc: "TKDL/AYU/SS-1108", name: "त्रिकटु चूर्ण (Trikatu Churna)",
    source: "Sushruta Samhita · Sutrasthanam 38.58",
    desc: "Sunthi (Zingiber officinale), Maricha (Piper nigrum), and Pippali (Piper longum) in strict 1:1:1 stoichiometric ratio. Classical Deepana, Pachana, and systemic bio-enhancing adjuvant.",
    markers: ["Piperine 3.8%", "6-Gingerol 1.4%"], ipc: "A61K 36/9068",
    query: "Trikatu Churna | Piper longum Zingiber officinale | A61K 36/9068",
  },
  {
    acc: "TKDL/AYU/SR-0412", name: "त्रिफला गुग्गुलु (Triphala Guggulu)",
    source: "Sarngadhara Samhita · Madhyama Khanda 7.82",
    desc: "Haritaki, Bibhitaki, Amalaki combined with Shuddha Guggulu resin and Pippali. Classical formulation for lipid metabolism disorders (Medoroga), sinus fistulae, and inflammatory joint degeneration.",
    markers: ["Guggulsterone E&Z", "Gallic Acid 4.2%"], ipc: "A61K 36/185",
    query: "Triphala Guggulu | Commiphora mukul Terminalia chebula | A61K 36/185",
  },
  {
    acc: "TKDL/AYU/AS-0914", name: "ब्राह्मी घृतम् (Brahmi Ghrita)",
    source: "Ashtanga Hridaya · Uttarasthana 6.23",
    desc: "Bacopa monnieri fresh leaf juice cooked in aged Go-Ghrita with Shankhpushpi, Vacha, and Maricha. Canonical Medhya Rasayana indicated for cognitive decline, convulsions, and mental fatigue.",
    markers: ["Bacoside A & B ≥ 20%", "Lipid Delivery Matrix"], ipc: "A61K 36/68",
    query: "Brahmi Ghrita | Bacopa monnieri Convolvulus pluricaulis | A61K 36/68",
  },
];

// One content block of the page: natural height, header rule, wide content
// spread across columns so the horizontal space is actually used.
function Section({ id, actions, children }: {
  id: string; actions?: ReactNode; children: ReactNode;
}) {
  const meta = sectionMeta(id);
  return (
    <section id={id} aria-label={meta.title} className="flex min-w-0 flex-col gap-3">
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2 border-b border-slate-200 pb-2">
        <div className="flex min-w-0 items-start gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#00263f] text-[#FF9933]">
            {meta.icon}
          </span>
          <div className="min-w-0">
            <h2 className="text-sm font-bold tracking-tight text-[#00263f] sm:text-base">{meta.title}</h2>
            <p className="mt-0.5 max-w-4xl text-[11px] leading-snug text-slate-600 sm:text-xs">{meta.note}</p>
          </div>
        </div>
        {actions ? <div className="flex max-w-full flex-wrap items-center gap-1.5">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}

export default function TKDLPage() {
  const router = useRouter();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState(
    "Ashwagandha Haridra Ghrita | Withania somnifera Curcuma longa | A61K 36/81"
  );
  const [filters, setFilters] = useState<Record<FilterKey, string>>(INITIAL_FILTERS);

  // Active Parameters tags
  const [activeTags, setActiveTags] = useState([
    { id: "1", label: "IPC: A61K 36/81", color: "bg-blue-100 text-[#00263f]" },
    { id: "2", label: "Treatise: Charaka Samhita", color: "bg-blue-100 text-[#00263f]" },
    { id: "3", label: "Withania + Curcuma Synergistic Base", color: "bg-green-100 text-[#0c5216]" },
  ]);

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
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4 px-3 py-4 sm:px-5 lg:px-6">

        {/* ── Page Header & Sovereign Action Bar ────────────────────────── */}
        <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="inline-flex items-center gap-1.5 rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#00263f]">
                <CheckVerifiedIcon className="w-3 h-3 text-[#FF9933]" />
                Official Concordance · CSIR-NIScPR & Ayush Joint System
              </span>
              <span className="text-[10px] font-semibold text-[#2a6b2c]">G.S.R. 513(E) Compliant</span>
            </div>

            <h1 className="text-lg font-bold tracking-tight text-[#00263f] sm:text-xl xl:text-2xl">
              Ayurvedic Library & Classical Knowledge Registry
            </h1>

            <p className="max-w-4xl text-[11px] leading-snug text-slate-600 sm:text-xs">
              Official digital concordance of ASU formulations, Sanskrit classical citations, phytochemical profiles, and verified therapeutic compounding ratios under Section 3(p) of the Indian Patents Act, 1970.
            </p>
          </div>

          <div className="flex min-w-0 flex-wrap items-center gap-1.5 lg:shrink-0">
            <button
              type="button"
              onClick={() => alert("Synchronized with CSIR-NIScPR TKDL digital servers.")}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-[#00263f] shadow-sm transition-colors hover:bg-slate-100"
            >
              <SyncIcon className="w-3.5 h-3.5 text-[#00263f]" />
              <span>Sync CSIR-TKDL</span>
            </button>
            <button
              type="button"
              onClick={() => router.push("/patents")}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-[#00263f] shadow-sm transition-colors hover:bg-slate-100"
            >
              <GavelIcon className="w-3.5 h-3.5 text-[#E65100]" />
              <span>Cross-Check Patent Claims</span>
            </button>
            <button
              type="button"
              onClick={() => alert("Generating official bilingual TKDL Registry XML & PDF Dossier...")}
              className="inline-flex items-center gap-1.5 rounded-md bg-[#00263f] px-2.5 py-1.5 text-[11px] font-bold text-white shadow-sm transition-colors hover:bg-[#001d32]"
            >
              <DownloadIcon className="w-3.5 h-3.5 text-[#FF9933]" />
              <span>Export Dossier (XML/PDF)</span>
            </button>
          </div>
        </header>

        {/* ── Registry Statistics ───────────────────────────────────────── */}
        <section aria-label="Registry statistics" className="grid grid-cols-1 gap-3 min-[520px]:grid-cols-2 xl:grid-cols-4">
        {REGISTRY_STATS.map((s) => (
          <div key={s.label} className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${s.iconCls}`}>
              {s.icon}
            </span>
            <div className="min-w-0">
              <span className="block truncate text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {s.label}
              </span>
              <div className="flex min-w-0 items-baseline gap-2">
                <span className={`shrink-0 text-2xl font-bold leading-tight 2xl:text-3xl ${s.valueCls}`}>
                  {s.value}
                </span>
                <span className={`truncate text-[11px] font-semibold ${s.noteCls}`} title={s.note}>{s.note}</span>
              </div>
            </div>
          </div>
        ))}
      </section>
      <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        {/* Search line */}
        <div className="relative flex items-center">
          <SearchIcon className="pointer-events-none absolute left-3.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Sanskrit shloka, classical yoga name (e.g. Ashwagandharishta, Trikatu), IPC code (A61K 36/00), or botanical name..."
            className="h-10 w-full rounded-md border border-slate-200 bg-[#F4F6F9] pl-10 pr-28 text-[13px] text-[#00263f] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00263f]"
          />
          <button
            type="button"
            className="absolute right-1.5 h-7 rounded-md bg-[#00263f] px-3 text-xs font-bold text-white transition-colors hover:bg-[#001d32]"
          >
            Search TKDL
          </button>
        </div>

        {/* Classification dropdowns */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {FILTER_CONSOLE.map((group) => (
            <div key={group.key} className="min-w-0 space-y-1">
              <label className="block truncate text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {group.label}
              </label>
              <Select
                value={filters[group.key]}
                onValueChange={(v) => setFilters((prev) => ({ ...prev, [group.key]: v }))}
              >
                <SelectTrigger size="sm" className={filterTriggerCls}>
                  <SelectValue placeholder={group.label} />
                </SelectTrigger>
                <SelectContent className={filterContentCls}>
                  {group.options.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>

        {/* Active filter tags */}
        <div className="flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Active parameters:
          </span>
          {activeTags.map((tag) => (
            <span
              key={tag.id}
              className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold ${tag.color}`}
            >
              <span className="max-w-[14rem] truncate">{tag.label}</span>
              <button
                type="button"
                onClick={() => handleRemoveTag(tag.id)}
                className="font-bold text-slate-400 hover:text-red-600"
                aria-label={`Remove ${tag.label}`}
              >
                ✕
              </button>
            </span>
          ))}
          {activeTags.length === 0 && (
            <span className="text-[10px] text-slate-400">None — showing the full registry</span>
          )}
          <button
            type="button"
            onClick={handleResetFilters}
            className="ml-auto text-[11px] font-semibold text-[#00263f] hover:underline"
          >
            Reset all criteria
          </button>
        </div>
      </section>

      <Section
        id="treatise"
        actions={
          <>
            <button
              type="button"
              onClick={() => setActiveModal("validate_citation")}
              className="inline-flex items-center gap-1.5 rounded-md bg-[#138808] px-3 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#0f6c06]"
            >
              <CheckVerifiedIcon className="w-3.5 h-3.5" />
              <span>Validate Examiner Citation</span>
            </button>
            <button
              type="button"
              onClick={() => alert("Formulation bookmarked to your desk.")}
              className="rounded-md border border-slate-200 bg-white p-2 text-sm transition-colors hover:bg-slate-50"
              title="Bookmark formulation"
              aria-label="Bookmark formulation"
            >
              🔖
            </button>
          </>
        }
      >
        <div className="rounded-xl bg-gradient-to-r from-[#002855] via-[#0b3c5d] to-[#00263f] px-4 py-3 text-white">
          <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
            <div className="min-w-0 space-y-0.5">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="rounded bg-white/15 px-1.5 py-0.5 font-mono text-[10px] tracking-wider">
                  TKDL/AYU/CS-2845
                </span>
                <span className="rounded bg-white/15 px-1.5 py-0.5 font-mono text-[10px]">
                  IPC A61K 36/81 · 36/9066
                </span>
                <span className="rounded bg-[#FF9933] px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-slate-900">
                  SEC 3(p) &amp; 3(e) BAR
                </span>
                <span className="inline-flex items-center gap-1 rounded bg-green-200 px-1.5 py-0.5 text-[10px] font-bold text-[#0c5216]">
                  <CheckVerifiedIcon className="w-3 h-3" />
                  Pre-Dates 1000 BCE
                </span>
              </div>

              <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5 pt-0.5">
                <h2 className="font-serif text-lg font-bold leading-tight tracking-tight sm:text-xl">
                  अश्वगन्धाद्य घृतम्
                </h2>
                <span className="text-[11px] font-semibold text-blue-100 sm:text-xs">
                  Ashwagandhadya Ghrita (Haridra-Ashwagandha Medicated Lipid Compound)
                </span>
              </div>

              <p className="text-[11px] leading-snug text-blue-200">
                Standard Polyherbal Anupana for chronic articular rheumatism, oxidative tissue degeneration, and immuno-neurological enhancement.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_18rem]">
          {/* Devanagari Classical Citation */}
          <div className="min-w-0 space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b border-slate-200 pb-2">
              <div className="flex min-w-0 items-center gap-2">
                <span className="h-2 w-2 shrink-0 rounded-full bg-[#FF9933]" />
                <span className="truncate text-[11px] font-bold uppercase tracking-wider text-[#00263f]">
                  Charaka Samhita · Chikitsasthanam (चिकित्सास्थानम्)
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="text-[10px] text-slate-500">
                  Chapter 28 (Vatavyadhi Chikitsa) · Verses 45-48
                </span>
                <button
                  type="button"
                  onClick={handleToggleAudio}
                  className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-bold transition-colors ${
                    isPlayingAudio
                      ? "animate-pulse bg-[#2a6b2c] text-white"
                      : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <VolumeIcon className="w-3 h-3" />
                  <span>{isPlayingAudio ? "Playing Chanting..." : "Recitation"}</span>
                </button>
              </div>
            </div>

            {/* Sanskrit Calligraphy */}
            <div className="rounded-md border border-slate-200 bg-white p-3.5 shadow-inner">
              <p className="font-serif text-sm font-medium leading-loose text-[#00263f] sm:text-base">
                अश्वगन्धाकषायेण पिष्ट्वा हरिद्रया सह ।<br />
                घृतं पचेत् पयोयुक्तं वातशोथहरं परम् ॥ ४५ ॥<br />
                पिप्पलीचूर्णसंयुक्तं दीपनं बलवर्धनम् ।<br />
                सन्धिशूलं प्रणुदति मेध्यं वयःस्थापनं परम् ॥ ४६ ॥
              </p>
            </div>

            {/* IAST & Translation */}
            <div className="space-y-2 text-xs text-slate-700">
              <div className="flex items-start gap-2">
                <span className="w-20 shrink-0 text-[10px] font-bold uppercase tracking-wide text-[#00263f]">
                  IAST :
                </span>
                <p className="min-w-0 font-mono text-[11px] leading-relaxed text-slate-600">
                                              aśvagandhā-kaṣāyeṇa piṣṭvā haridrayā saha | ghṛtaṁ pacet payo-yuktaṁ vāta-śotha-haraṁ param || 45 || pippalī-cūrṇa-saṁyuktaṁ dīpanaṁ bala-vardhanam | sandhi-śūlaṁ praṇudati medhyaṁ vayaḥ-sthāpanaṁ param || 46 ||
                </p>
              </div>

              <div className="flex items-start gap-2 border-t border-slate-200 pt-2">
                <span className="w-20 shrink-0 text-[10px] font-bold uppercase tracking-wide text-[#2a6b2c]">
                  Translation :
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] leading-relaxed text-slate-700">
                                                  "Having prepared a decoction of Ashwagandha (Withania somnifera) and blending it with the fine paste of Haridra (Curcuma longa rhizome), one should simmer pure cow's ghee (Ghrita) compounded with fresh cow's milk until the medicated lipid maturation (Sneha Paka) is attained. Blended further with the bio-activating powder of Pippali (Piper longum), this formulation supremely alleviates Vata-induced inflammatory swellings (Sandhi-Shotha), cures intractable joint-arthralgia, accelerates tissue vitality (Bala-Vardhana), stimulates deep metabolic assimilation, and serves as an eminent longevity adaptogen (Vayah-Sthapana)."
                  </p>
                                            </div>
              </div>
            </div>
          </div>

          {/* Folio Provenance Sidebar */}
          <div className="min-w-0 space-y-2.5">
            <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <h4 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#00263f]">
                <CheckVerifiedIcon className="w-3.5 h-3.5 text-[#138808]" />
                Historical Folio Provenance
              </h4>
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4 lg:grid-cols-1">
                {[
                  { k: "Corpus Epoch", v: "Vedic / Classical (~1000 BCE)", mono: false },
                  { k: "Archival MS ID", v: "BORI-MS-7402/Vol-IV", mono: true },
                  { k: "Script & Language", v: "Devanagari / Vedic Sanskrit", mono: false },
                  { k: "National Library Record", v: "NL-KOL/CS-0921-A", mono: true },
                ].map((row) => (
                  <div key={row.k} className="min-w-0 rounded border border-slate-100 bg-white p-1.5">
                    <span className="block truncate text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                      {row.k}
                    </span>
                    <span className={`block text-[11px] font-semibold ${row.mono ? "font-mono text-[#00263f]" : "text-slate-800"}`}>
                      {row.v}
                    </span>
                  </div>
                ))}
              </div>

              {/* Folio Scan Box */}
              <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
                <div className="border-b border-amber-200 bg-amber-50 p-2 text-center font-mono text-[10px] text-amber-900">
                  📜 Folio 148B · Charaka Samhita (1000 BCE)
                </div>
                <div className="p-2.5 text-center text-[10px] text-slate-500">
                  <span>Palm-leaf manuscript digitization index #7402</span>
                  <button
                    type="button"
                    onClick={() => setActiveModal("high_res_folio")}
                    className="mx-auto mt-1 block text-[11px] font-bold text-[#00263f] hover:underline"
                  >
                    View High-Res Manuscript Scan →
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </Section>

      {/* ── 03 · Botanical compounding & exact ratios ─────────────────── */}
      <Section id="ratios">
        <div className="space-y-3">
          <span className="ml-auto w-fit rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-[#00263f]">
            Maturation Mode: Khara Paka (Oral Use)
          </span>

          <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
            <table className="w-full min-w-[560px] table-fixed border-collapse text-left text-[11px]">
              <thead className="bg-[#002855] text-white">
                <tr>
                  <th className="w-[26%] px-2.5 py-2 font-bold">Botanical / Classical Entity</th>
                  <th className="w-[11%] px-2.5 py-2 font-bold">Ratio</th>
                  <th className="w-[11%] px-2.5 py-2 font-bold">w/w %</th>
                  <th className="w-[24%] px-2.5 py-2 font-bold">Phytochemical Marker</th>
                  <th className="px-2.5 py-2 font-bold">Pharmacological Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {COMPOUND_ROWS.map((row, idx) => (
                  <tr key={row.latin} className={idx % 2 ? "bg-slate-50/60 hover:bg-slate-50" : "hover:bg-slate-50"}>
                    <td className="px-2.5 py-2 align-top">
                      <span className="block font-semibold text-[#00263f]">{row.latin}</span>
                      <span className="block text-[10px] text-slate-500">{row.sanskrit} · {row.part}</span>
                    </td>
                    <td className="px-2.5 py-2 align-top font-mono font-bold text-[#00263f]">{row.ratio}</td>
                    <td className="px-2.5 py-2 align-top font-mono">{row.pct}</td>
                    <td className={`px-2.5 py-2 align-top ${row.markerCls}`}>{row.marker}</td>
                    <td className={`px-2.5 py-2 align-top ${row.roleCls}`}>{row.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Proportion strip — labels live in the legend, never inside the slice */}
          <div className="space-y-1.5 rounded-md border border-slate-200 bg-slate-50 p-3">
            <span className="block text-[11px] font-bold text-[#00263f]">
              Compounding Matrix Proportions (Sneha Kalpana Law):
            </span>
            <div className="flex h-5 w-full overflow-hidden rounded-md shadow-inner">
              {MATRIX_SEGMENTS.map((seg) => (
                <div
                  key={seg.name}
                  className={seg.cls}
                  style={{ width: seg.width }}
                  title={`${seg.name} — ${seg.label}`}
                />
              ))}
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-600">
              {MATRIX_SEGMENTS.map((seg) => (
                <span key={seg.name} className="flex items-center gap-1">
                  <span className={`h-2 w-2 shrink-0 rounded-sm ${seg.cls}`} />
                  <span className="font-semibold">{seg.name}</span>
                  <span className="font-mono">{seg.label}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ── 04 · Phytochemical markers & Rasa Panchaka ────────────────── */}
      <Section id="phytochemistry">
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="flex min-w-0 flex-col justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase font-bold text-[#00263f]">Steroidal Lactone</span>
                  <span className="font-mono text-xs bg-white px-2 py-0.5 rounded border">C28H38O6</span>
                </div>
                <h4 className="mt-0.5 text-[13px] font-bold text-[#00263f]">Withaferin A & Withanolide D</h4>
                <p className="mt-1 text-[11px] leading-snug text-slate-600">
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

            <div className="flex min-w-0 flex-col justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase font-bold text-[#E65100]">Polyphenolic Curcuminoid</span>
                  <span className="font-mono text-xs bg-white px-2 py-0.5 rounded border">C21H20O6</span>
                </div>
                <h4 className="mt-0.5 text-[13px] font-bold text-[#00263f]">Diferuloylmethane (Curcumin I-III)</h4>
                <p className="mt-1 text-[11px] leading-snug text-slate-600">
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

            <div className="flex min-w-0 flex-col justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase font-bold text-[#00263f]">Alkaloid Bio-Enhancer</span>
                  <span className="font-mono text-xs bg-white px-2 py-0.5 rounded border">C17H19NO3</span>
                </div>
                <h4 className="mt-0.5 text-[13px] font-bold text-[#00263f]">Piperine (1-Peperoylpiperidine)</h4>
                <p className="mt-1 text-[11px] leading-snug text-slate-600">
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
          <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#00263f] flex items-center gap-2">
              <span>🌿</span>
              Ayurvedic Pharmacodynamics (Dravyaguna Rasa-Panchaka Concordance)
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-center md:grid-cols-5">
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-2">
                <span className="text-slate-500 font-semibold block">Rasa (Taste)</span>
                <span className="font-bold text-[#00263f] block mt-1">Tikta, Kashaya, Madhura</span>
              </div>
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-2">
                <span className="text-slate-500 font-semibold block">Guna (Attributes)</span>
                <span className="font-bold text-[#00263f] block mt-1">Guru, Snigdha</span>
              </div>
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-2">
                <span className="text-slate-500 font-semibold block">Virya (Potency)</span>
                <span className="font-bold text-[#E65100] block mt-1">Ushna (उष्ण)</span>
              </div>
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-2">
                <span className="text-slate-500 font-semibold block">Vipaka (Post-Digestive)</span>
                <span className="font-bold text-[#00263f] block mt-1">Madhura (मधुर)</span>
              </div>
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-2">
                <span className="text-slate-500 font-semibold block">Dosha Karma</span>
                <span className="font-bold text-[#1B5E20] block mt-1">Vata-Kapha Shamaka</span>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ── 05 · Section 3(p) defence memo ────────────────────────────── */}
      <Section id="defense">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="space-y-3 rounded-xl border border-blue-200/80 bg-blue-50/60 p-3.5">
            <div className="flex items-start gap-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#00263f] text-white">
                <ShieldIcon className="w-5 h-5 text-[#FF9933]" />
              </div>
              <div className="space-y-2">
                <p className="text-[11px] leading-snug text-slate-700">
                  Under <strong>Section 3(p)</strong> of the Indian Patents Act, 1970 (as amended), an invention which in effect is traditional knowledge or an aggregation or duplication of known properties of traditionally known components is <strong>non-patentable subject matter</strong>.
                </p>
                <p className="text-[11px] leading-snug text-slate-700">
                  Furthermore, under <strong>Section 3(e)</strong>, a substance obtained by a mere admixture resulting only in the aggregation of the properties of the components thereof is barred. Modern filings claiming novel synergy between <em>Withania somnifera</em> (Ashwagandha) and <em>Curcuma longa</em> (Turmeric) in lipid medium fail the statutory test unless applicant proves a Combination Index (Chou-Talalay CI &lt; 0.55) exceeding the verified classical ratio documented in TKDL/AYU/CS-2845.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-blue-200 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="rounded bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white">
                  ESTABLISHED PRIOR ART: 1000 BCE
                </span>
                <span className="text-[10px] text-slate-600">
                  IPO Binding Circular: CGPDTM/TKDL/2021/4
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModal("third_party_memo")}
                  className="rounded-md bg-[#00263f] px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-[#001d32] shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <GavelIcon className="w-4 h-4" />
                  <span>Generate Third-Party Objection Memo</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModal("signed_cert")}
                  className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-[#00263f] hover:bg-slate-50 transition-colors flex items-center gap-1.5"
                >
                  <DownloadIcon className="w-4 h-4" />
                  <span>Download Signed Prior Art Certificate</span>
                </button>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 rounded-xl bg-[#00263f] p-4 text-white shadow-sm">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#FF9933]">
              <span>⚖️</span>
              <span>Statutory Precedent</span>
            </div>
            <p className="text-xs leading-relaxed text-blue-100">
              Cited in 42 international patent revocations including EPO Application EP1984021 (claims
              withdrawn under Article 115 EPC) and USPTO US8921412 (invalidated under 35 U.S.C. 102).
            </p>
            <button
              type="button"
              onClick={() => setActiveModal("legal_precedents")}
              className="mt-auto w-full rounded-md bg-white/15 px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-white/25"
            >
              Review 42 Legal Precedents
            </button>
          </div>
        </div>
      </Section>

      {/* ── 06 · Related prior-art records ────────────────────────────── */}
      <Section id="records">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {RELATED_FORMS.map((form) => (
            <article key={form.acc} className="flex min-w-0 flex-col justify-between gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate rounded bg-blue-100 px-2 py-0.5 font-mono text-[11px] font-bold text-[#00263f]">
                    {form.acc}
                  </span>
                  <span className="shrink-0 rounded bg-green-100 px-2 py-0.5 text-[10px] font-bold text-[#0c5216]">
                    Sec 3(p) Protected
                  </span>
                </div>
                <h3 className="text-sm font-bold text-[#00263f]">{form.name}</h3>
                <p className="text-[11px] text-slate-500">{form.source}</p>
                <p className="text-[11px] leading-relaxed text-slate-600">{form.desc}</p>
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {form.markers.map((marker) => (
                    <span key={marker} className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[10px] text-slate-600">
                      {marker}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 pt-2">
                <span className="text-[10px] text-slate-500">IPC: {form.ipc}</span>
                <button
                  type="button"
                  onClick={() => setSearchQuery(form.query)}
                  className="text-[11px] font-bold text-[#00263f] hover:underline"
                >
                  Inspect Data →
                </button>
              </div>
            </article>
          ))}
        </div>

        <section className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 rounded-xl border border-slate-300/80 bg-slate-200/60 px-4 py-3 text-[11px] text-slate-600">
          <div className="flex min-w-0 items-start gap-2">
            <GavelIcon className="w-4 h-4 shrink-0 text-[#00263f]" />
            <p className="leading-snug">
              Confidential Government of India Knowledge Concordance · Access restricted to authorised
              international patent offices &amp; CGPDTM examiners under bilateral TKDL access agreements.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1 font-semibold">
            <span className="flex items-center gap-1.5 text-[#1B5E20]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#1B5E20]" />
              API Node V2.8 Secure
            </span>
            <span>ISO 27001 Certified</span>
            <button
              type="button"
              onClick={() => alert("Loading full catalog of 384,192 formulations...")}
              className="rounded-md bg-[#00263f] px-3 py-1.5 text-[11px] font-bold text-white transition-colors hover:bg-[#001d32]"
            >
              View all 384,192 records →
            </button>
          </div>
        </section>
      </Section>
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
