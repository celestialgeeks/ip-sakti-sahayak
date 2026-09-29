"use client";

// Stage 1 — Entry doors (spec §4). Asks for a concrete object, never a persona.
// Every preset card carries computed chips (§8.3 — engine output, never hand
// declared) and names exactly one known weakness (§4.1).

import React, { useEffect, useMemo, useState } from "react";
import { BotanicalItem, IngredientRatio, PresetFormulation, ScenarioSummary } from "@/lib/formulation/types";
import { getApiUrl } from "@/lib/api";

type DoorId = "condition" | "hero" | "classical" | "ranked";

interface DraftSummary {
  title: string;
  herbCount: number;
  totalRatio: number;
  entityType: "domestic" | "foreign";
  savedAt?: number;
}

interface EntryDoorsProps {
  herbs: BotanicalItem[];
  presets: PresetFormulation[];
  scenarios: ScenarioSummary[];
  catalogOffline: boolean;
  /** Autosaved local draft, shown as the "resume" card; null when none. */
  draft: DraftSummary | null;
  onSelectPreset: (preset: PresetFormulation) => void;
  onStartFromHerbs: (title: string, ingredients: IngredientRatio[]) => void;
  onContinue: (scenarioId: string) => void;
  onResumeDraft: () => void;
  onNewBlank: () => void;
}

interface ConditionEntry {
  id: string;
  name: string;
  sanskrit_name: string;
  modern_equivalents: string[];
  related_plants?: string[];
}

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

/** Patent-position ranking (§4 door 4): statutory risk first, then power. */
function patentPositionScore(p: PresetFormulation): number {
  const c = p.computed;
  if (!c) return -1;
  let s = c.quality * 0.4 + c.ci * -50;
  if (c.sec_3e_status !== "CLEARED") s -= 60;
  if (c.tkdl_concordance_score >= 90) s -= 40;
  if (c.nba_abs_royalty_percentage >= 5) s -= 5;
  return s;
}

/** "just now / 12 min ago / 3 days ago" — the recency line on resume cards. */
function relativeTime(ts?: string | number): string {
  if (ts === undefined || ts === null || ts === "") return "recently";
  const t = typeof ts === "number" ? ts : Date.parse(ts);
  if (Number.isNaN(t)) return "recently";
  const min = Math.max(0, Math.round((Date.now() - t) / 60000));
  if (min < 1) return "just now";
  if (min < 60) return `${min} min ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr} hr ago`;
  const day = Math.round(hr / 24);
  if (day < 30) return `${day} day${day === 1 ? "" : "s"} ago`;
  return `${Math.round(day / 30)} mo ago`;
}

export function EntryDoors({
  herbs,
  presets,
  scenarios,
  catalogOffline,
  draft,
  onSelectPreset,
  onStartFromHerbs,
  onContinue,
  onResumeDraft,
  onNewBlank,
}: EntryDoorsProps) {
  const [door, setDoor] = useState<DoorId | null>(null);
  const [query, setQuery] = useState("");
  const [conditions, setConditions] = useState<ConditionEntry[] | null>(null);
  const [synonyms, setSynonyms] = useState<Record<string, string>>({});

  useEffect(() => {
    if (door !== "condition" || conditions) return;
    let cancelled = false;
    (async () => {
      try {
        const base = getApiUrl();
        const [cRes, sRes] = await Promise.all([
          fetch(`${base}/api/ayurveda/conditions?page_size=20`),
          fetch(`${base}/api/formulation-lab/synonyms`),
        ]);
        if (!cRes.ok || !sRes.ok) throw new Error();
        const cData = await cRes.json();
        const sData = await sRes.json();
        if (!cancelled) {
          setConditions(cData.items as ConditionEntry[]);
          setSynonyms(sData.synonyms as Record<string, string>);
        }
      } catch {
        if (!cancelled) setConditions([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [door, conditions]);

  const rankedPresets = useMemo(
    () => [...presets].sort((a, b) => patentPositionScore(b) - patentPositionScore(a)),
    [presets]
  );

  const conditionMatches = useMemo(() => {
    if (!conditions) return [];
    const q = query.trim().toLowerCase();
    if (!q) return conditions.slice(0, 7);
    return conditions.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.sanskrit_name.toLowerCase().includes(q) ||
        c.modern_equivalents.some((m) => m.toLowerCase().includes(q))
    );
  }, [conditions, query]);

  const startFromCondition = (c: ConditionEntry) => {
    const plants = (c.related_plants ?? [])
      .map((pid) => synonyms[pid])
      .filter((id): id is string => Boolean(id))
      .filter((id) => herbs.some((h) => h.id === id))
      .slice(0, 3);
    const ingredients: IngredientRatio[] = plants.map((id) => ({ herb_id: id, ratio: 18 }));
    ingredients.push({ herb_id: "pippali", ratio: 5 });
    ingredients.push({ herb_id: "ghee", ratio: 15 });
    const fixed = ingredients.map((i) => ({ ...i }));
    const total = fixed.reduce((s, i) => s + i.ratio, 0);
    // Normalise the starter to exactly 100 so the first gate isn't already red.
    let acc = 0;
    fixed.forEach((i, idx) => {
      const scaled = Math.round((i.ratio / total) * 100 * 10) / 10;
      if (idx === fixed.length - 1) i.ratio = Math.round((100 - acc) * 10) / 10;
      else {
        i.ratio = scaled;
        acc += scaled;
      }
    });
    onStartFromHerbs(`${c.name} · ${c.sanskrit_name.split(" (")[0]} Starter Yoga`, fixed);
  };

  const startFromHero = (herb: BotanicalItem) => {
    const ingredients: IngredientRatio[] = [
      { herb_id: herb.id, ratio: 50 },
      { herb_id: "pippali", ratio: 5 },
      { herb_id: "ghee", ratio: 15 },
      { herb_id: "amla", ratio: 20 },
      { herb_id: "guduchi", ratio: 10 },
    ];
    onStartFromHerbs(`${herb.common_name} Lead Formula`, ingredients);
  };

  const chips = (p: PresetFormulation) => {
    const c = p.computed;
    if (!c) return null;
    const tkdlTrap = c.tkdl_concordance_score >= 90;
    return (
      <div className="flex flex-wrap gap-1 mt-2">
        <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-secondary-container/50 text-on-secondary-container">
          Quality {c.quality}
        </span>
        <span
          className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
            c.sec_3e_status === "CLEARED"
              ? "bg-secondary-container/50 text-on-secondary-container"
              : "bg-error-container/70 text-on-error-container"
          }`}
        >
          {c.sec_3e_status === "CLEARED" ? "✓ §3(e)" : "🛑 §3(e)"} CI {c.ci}
        </span>
        <span
          className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
            tkdlTrap ? "bg-error-container/70 text-on-error-container" : "bg-portal-surface-subtle text-on-surface-variant"
          }`}
        >
          {tkdlTrap ? "🛑 " : ""}TKDL {c.tkdl_concordance_score}
        </span>
        <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-portal-surface-subtle text-on-surface-variant">
          Royalty {c.nba_abs_royalty_percentage.toFixed(1)}%
        </span>
        <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-tertiary-fixed/60 text-on-tertiary-fixed">
          {c.tier.replace("_", " ")}
        </span>
      </div>
    );
  };

  const PresetCard = ({ p, rank }: { p: PresetFormulation; rank?: number }) => (
    <button
      onClick={() => onSelectPreset(p)}
      className="text-left w-full rounded-xl border border-portal-border/60 bg-surface-container-lowest p-4 hover:border-tiranga-saffron hover:shadow-md transition-all group"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-title-md text-title-md font-bold text-portal-navy-deep leading-snug">
          {rank !== undefined && rank < 3 && (
            <span className="text-tiranga-green-deep font-semibold mr-1">{["🥇 ", "🥈 ", "🥉 "][rank]}</span>
          )}
          {p.title}
        </span>
        <span className="material-symbols-outlined text-[18px] text-outline group-hover:text-tiranga-saffron transition-colors">
          arrow_right_alt
        </span>
      </div>
      {/* §4.1 — the known weakness is mandatory card copy, not a surprise later. */}
      <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">{p.description}</p>
      {chips(p)}
    </button>
  );

  const DoorTile = ({ id, icon, question, detail }: { id: DoorId; icon: string; question: string; detail: string }) => (
    <button
      onClick={() => setDoor(door === id ? null : id)}
      className={`text-left rounded-xl border p-5 transition-all ${
        door === id
          ? "border-tiranga-saffron bg-tertiary-fixed/40 shadow-md"
          : "border-portal-border/60 bg-surface-container-lowest hover:border-primary hover:shadow-sm"
      }`}
    >
      <span className="material-symbols-outlined text-[26px] text-tiranga-saffron-deep">{icon}</span>
      <p className="font-title-md text-title-md font-bold text-portal-navy-deep mt-2">{question}</p>
      <p className="text-xs text-on-surface-variant mt-1">{detail}</p>
    </button>
  );

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8 space-y-6">
      <div className="text-center pt-2">
        <h1 className="font-title-lg text-title-lg md:text-[28px] font-bold text-portal-navy-deep">
          Formulation Lab — what are you holding?
        </h1>
        <p className="text-sm text-on-surface-variant mt-1">
          A what-if simulator that stress-tests your yoga against Indian IP statute <em>before</em> you pay filing fees.
        </p>
        {catalogOffline && (
          <span className="inline-flex items-center gap-1 mt-2 text-xs font-bold px-2 py-1 rounded bg-tertiary-fixed text-on-tertiary-fixed border border-emblem-gold/40">
            <span className="material-symbols-outlined text-[14px]">cloud_off</span>
            Static catalog — lab service unreachable
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DoorTile id="condition" icon="medical_information" question="What are you treating?" detail="Search by modern condition or Sanskrit name" />
        <DoorTile id="hero" icon="eco" question="What herb is your formula built around?" detail="Browse the herbarium by category" />
        <DoorTile id="classical" icon="menu_book" question="Start from a known recipe" detail="Classical & proprietary yogas, scored" />
        <DoorTile id="ranked" icon="workspace_premium" question="Show me the strongest patent position" detail="Ranked by computed statutory safety margin" />
      </div>

      {door === "condition" && (
        <div className="rounded-xl border border-portal-border/60 bg-surface-container-lowest p-4 space-y-3">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type 2 diabetes · Osteoarthritis · Asthma · Prameha · Sandhivata…"
            className="w-full rounded-lg border border-portal-border bg-surface-container-lowest px-3 py-2 text-sm focus:outline-none focus:border-tiranga-saffron"
          />
          {conditions === null && <p className="text-xs text-outline">Loading condition library…</p>}
          {conditions !== null && conditionMatches.length === 0 && (
            <p className="text-xs text-outline">No TKDL-indexed match. Try “fever”, “joints”, “skin”, or “sugar”.</p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {conditionMatches.map((c) => (
              <button
                key={c.id}
                onClick={() => startFromCondition(c)}
                className="text-left rounded-lg border border-portal-border/50 p-3 hover:border-primary hover:bg-portal-surface-subtle transition-colors"
              >
                <span className="text-sm font-bold text-portal-navy-deep">{c.name}</span>
                <span className="text-xs text-tiranga-saffron-deep ml-2 italic">{c.sanskrit_name}</span>
                <p className="text-xs text-on-surface-variant mt-0.5">{c.modern_equivalents.join(" · ")}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {door === "hero" && (
        <div className="rounded-xl border border-portal-border/60 bg-surface-container-lowest p-4 space-y-4">
          {CATEGORY_ORDER.map((cat) => {
            const group = herbs.filter((h) => h.category === cat);
            if (group.length === 0) return null;
            return (
              <div key={cat}>
                <p className="text-xs font-bold uppercase tracking-wider text-outline mb-1.5">{CATEGORY_LABELS[cat]}</p>
                <div className="flex flex-wrap gap-1.5">
                  {group.map((h) => (
                    <button
                      key={h.id}
                      onClick={() => startFromHero(h)}
                      title={h.description}
                      className="px-2.5 py-1.5 rounded-lg border border-portal-border/60 bg-surface-container-lowest text-xs font-semibold text-portal-navy-deep hover:border-tiranga-saffron hover:text-tiranga-saffron-deep transition-colors"
                    >
                      {h.common_name}
                      <span className="text-outline font-normal italic ml-1">{h.sanskrit_name.match(/\(([^)]+)\)/)?.[1] ?? ""}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {door === "classical" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {presets.map((p) => (
            <PresetCard key={p.id} p={p} />
          ))}
        </div>
      )}

      {door === "ranked" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {rankedPresets.map((p, i) => (
            <PresetCard key={p.id} p={p} rank={i} />
          ))}
        </div>
      )}

      <div className="text-center pt-2">
        {/* §4.4 — from-scratch is a tertiary text link, never a card. */}
        <button onClick={onNewBlank} className="text-sm text-primary hover:underline font-semibold">
          ＋ New from scratch
        </button>
      </div>

      {/* Resume / continue (§4.5, §14.7): past work is surfaced here — the lab
          no longer auto-jumps to the bench, so the navigation link always
          lands on this home. Parked below the doors and the from-scratch link
          and one notch tighter than the doors grid, so starting fresh stays
          the headline action and resuming supports it without overshadowing. */}
      {(draft || scenarios.length > 0) && (
        <section
          aria-label="Resume formulation history"
          className="rounded-xl border border-primary/30 bg-portal-surface-subtle p-3.5 space-y-2.5"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-primary">history</span>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Pick up where you left off
              </span>
            </div>
            <span className="text-xs text-outline hidden sm:block">
              Autosaved — nothing is filed or submitted from here
            </span>
          </div>

          {draft && (
            <button
              onClick={onResumeDraft}
              className="w-full text-left rounded-lg border border-tiranga-saffron/50 bg-surface-container-lowest hover:border-tiranga-saffron hover:shadow-md transition-all px-3.5 py-2.5 flex items-center justify-between gap-3 group"
            >
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wider text-tiranga-saffron-deep">
                  Last session draft · edited {relativeTime(draft.savedAt)}
                </p>
                <p className="text-sm font-bold text-portal-navy-deep truncate mt-0.5">
                  {draft.title}
                </p>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  {draft.herbCount} herbs · {draft.totalRatio.toFixed(1)}% w/w · {draft.entityType} entity
                </p>
              </div>
              <span className="inline-flex items-center gap-1 shrink-0 rounded-lg bg-tiranga-saffron px-3 py-1.5 text-xs font-bold text-white group-hover:gap-2 transition-all">
                Resume
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </span>
            </button>
          )}

          {scenarios.length > 0 && (
            <div>
              {draft && (
                <p className="text-[11px] font-bold uppercase tracking-wider text-outline mb-1.5">
                  Saved scenarios
                </p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {scenarios.slice(0, 4).map((s) => (
                  <button
                    key={s.id}
                    onClick={() => onContinue(s.id)}
                    className="text-left rounded-lg border border-portal-border bg-surface-container-lowest hover:border-primary hover:shadow-sm transition-all px-3 py-2"
                  >
                    <span className="text-xs font-semibold text-portal-navy-deep block truncate">{s.title}</span>
                    <span className="text-[11px] text-outline mt-0.5 block">
                      {s.herb_count} herbs · {s.total_ratio.toFixed(1)}% · {s.entity_type} · {relativeTime(s.updated_at)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
