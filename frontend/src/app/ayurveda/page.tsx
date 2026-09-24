"use client";

/**
 * /ayurveda — Ayurvedic Library hub: search, browse tabs (plants /
 * formulations / conditions), stats strip, and a prominent medical disclaimer.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ayurvedaApi,
  LibraryStats,
  SearchHit,
} from "@/lib/ayurveda";
import {
  DisclaimerBanner,
  DoshaBadge,
  ErrorState,
  LoadingState,
  TypeBadge,
  relatedHref,
} from "@/components/ayurveda/LibraryShared";

type Tab = "all" | "plant" | "formulation" | "condition";

const TABS: { id: Tab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "plant", label: "Herbs & Plants" },
  { id: "formulation", label: "Formulations" },
  { id: "condition", label: "Conditions" },
];

interface PlantCard {
  id: string; sanskrit_name: string; botanical_name: string; english_name: string; doshas_balanced: string[];
}
interface FormCard { id: string; name: string; type: string; category: string }
interface CondCard { id: string; name: string; sanskrit_name: string; modern_equivalents: string[] }

export default function AyurvedaLibraryPage() {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<Tab>("all");
  const [dosha, setDosha] = useState<string>("");
  const [stats, setStats] = useState<LibraryStats | null>(null);
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [plants, setPlants] = useState<PlantCard[]>([]);
  const [forms, setForms] = useState<FormCard[]>([]);
  const [conds, setConds] = useState<CondCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initial load: stats + default browse lists
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [s, p, f, c] = await Promise.all([
          ayurvedaApi.stats(),
          ayurvedaApi.listPlants({}),
          ayurvedaApi.listFormulations({}),
          ayurvedaApi.listConditions(),
        ]);
        if (cancelled) return;
        setStats(s); setPlants(p.items); setForms(f.items); setConds(c.items);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Debounced relevance search when a query is typed
  const runSearch = useCallback(async (q: string, d: string) => {
    try {
      const res = await ayurvedaApi.search(q, {
        types: tab === "all" ? undefined : [tab],
        dosha: d || undefined,
      });
      setHits(res.results);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, [tab]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) { setHits([]); return; }
    debounceRef.current = setTimeout(() => void runSearch(query.trim(), dosha), 250);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, dosha, runSearch]);

  const filteredPlants = useMemo(
    () => (dosha ? plants.filter((p) => p.doshas_balanced.includes(dosha)) : plants),
    [plants, dosha],
  );

  if (loading) return <Shell><LoadingState label="Loading the Ayurvedic library…" /></Shell>;
  if (error && !stats) return <Shell><ErrorState message={error} /></Shell>;

  const searching = query.trim().length > 0;

  return (
    <Shell disclaimer={stats?.disclaimer}>
      {/* Stats strip */}
      {stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label="Library statistics">
          {[
            { label: "Medicinal Plants", value: stats.plants },
            { label: "Classical Formulations", value: stats.formulations },
            { label: "Conditions Mapped", value: stats.conditions },
            { label: "Botanical Families", value: stats.families },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{s.label}</p>
              <p className="mt-1 text-2xl font-bold text-[#00263f]">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Controls */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative block w-full sm:max-w-md">
          <span className="sr-only">Search the Ayurvedic library</span>
          <svg aria-hidden className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by Sanskrit, botanical, English or vernacular name…"
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm shadow-sm focus:border-[#00263f] focus:outline-none focus:ring-1 focus:ring-[#00263f]"
          />
        </label>
        <div role="group" aria-label="Filter by dosha" className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-500">Balances:</span>
          {["", "Vata", "Pitta", "Kapha"].map((d) => (
            <button
              key={d || "any"}
              onClick={() => setDosha(d)}
              aria-pressed={dosha === d}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${dosha === d ? "border-[#00263f] bg-[#00263f] text-white" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"}`}
            >
              {d || "Any"}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div role="tablist" aria-label="Library sections" className="mt-4 flex gap-1 border-b border-slate-200">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-semibold ${tab === t.id ? "border-b-2 border-[#00263f] text-[#00263f]" : "text-slate-500 hover:text-[#00263f]"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && searching && <div className="mt-4"><ErrorState message={error} /></div>}

      {/* Results */}
      <div className="mt-5 pb-10">
        {searching ? (
          hits.length === 0 && !error ? (
            <p className="text-sm text-slate-500">No matches for “{query}”. Try a Sanskrit or botanical name.</p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-live="polite">
              {hits.map((h) => (
                <li key={`${h.type}:${h.id}`}>
                  <Link href={relatedHref(h)} className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00263f]">
                    <div className="flex items-center justify-between">
                      <TypeBadge type={h.type} />
                      {h.safety_flag && <span title="Has contraindications/safety notes" className="text-[10px] font-bold uppercase text-red-700">⚠ safety notes</span>}
                    </div>
                    <p className="mt-2 font-bold text-[#00263f]">{h.title}</p>
                    <p className="text-xs italic text-slate-500">{h.subtitle}</p>
                    {h.doshas_balanced && (
                      <div className="mt-2 flex gap-1">{h.doshas_balanced.map((d) => <DoshaBadge key={d} dosha={d} />)}</div>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )
        ) : (
          <>
            {(tab === "all" || tab === "plant") && (
              <Section title="Medicinal Plants" count={filteredPlants.length}>
                {filteredPlants.map((p) => (
                  <li key={p.id}>
                    <Link href={`/ayurveda/plants/${p.id}`} className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00263f]">
                      <p className="font-bold text-[#00263f]">{p.sanskrit_name}</p>
                      <p className="text-xs italic text-slate-500">{p.botanical_name}</p>
                      <p className="mt-0.5 text-xs text-slate-600">{p.english_name}</p>
                      <div className="mt-2 flex gap-1">{p.doshas_balanced.map((d) => <DoshaBadge key={d} dosha={d} />)}</div>
                    </Link>
                  </li>
                ))}
              </Section>
            )}
            {(tab === "all" || tab === "formulation") && (
              <Section title="Classical Formulations" count={forms.length}>
                {forms.map((f) => (
                  <li key={f.id}>
                    <Link href={`/ayurveda/formulations/${f.id}`} className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00263f]">
                      <p className="font-bold text-[#00263f]">{f.name}</p>
                      <p className="mt-1 flex gap-1.5 text-xs text-slate-600">
                        <TypeBadge type="formulation" /> {f.type} · {f.category}
                      </p>
                    </Link>
                  </li>
                ))}
              </Section>
            )}
            {(tab === "all" || tab === "condition") && (
              <Section title="Conditions (Roga)" count={conds.length}>
                {conds.map((c) => (
                  <li key={c.id}>
                    <Link href={`/ayurveda/conditions/${c.id}`} className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00263f]">
                      <p className="font-bold text-[#00263f]">{c.name}</p>
                      <p className="text-xs italic text-slate-500">{c.sanskrit_name}</p>
                      <p className="mt-1 text-xs text-slate-600">{c.modern_equivalents.join(" · ")}</p>
                    </Link>
                  </li>
                ))}
              </Section>
            )}
          </>
        )}
      </div>
    </Shell>
  );
}

function Shell({ children, disclaimer }: { children: React.ReactNode; disclaimer?: string }) {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      <header className="mb-5">
        <p className="text-[11px] font-bold uppercase tracking-widest text-[#2a6b2c]">Ayurvedic Library</p>
        <h1 className="text-2xl font-bold tracking-tight text-[#00263f] sm:text-3xl">
          Dravya &amp; Yoga Reference for IP Research
        </h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-600">
          Curated monographs of medicinal plants, classical formulations, and traditional
          condition mappings — each entry annotated with TKDL, GI-tag, and prior-art context.
        </p>
      </header>
      <div className="mb-5">
        <DisclaimerBanner text={disclaimer ?? "Educational reference only — not medical or legal advice."} />
      </div>
      {children}
    </main>
  );
}

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <section aria-label={title} className="mb-8">
      <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-500">
        {title} <span className="text-slate-400">({count})</span>
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{children}</ul>
    </section>
  );
}
