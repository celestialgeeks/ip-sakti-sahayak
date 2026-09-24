"use client";

/** /ayurveda/plants/[id] — full plant monograph with safety & IP annotations. */
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ayurvedaApi, Plant, RelatedEntry } from "@/lib/ayurveda";
import {
  DisclaimerBanner, DoshaBadge, ErrorState, LoadingState, RelatedLinks, TypeBadge,
} from "@/components/ayurveda/LibraryShared";

export default function PlantDetailPage() {
  const params = useParams<{ id: string }>();
  const [plant, setPlant] = useState<Plant | null>(null);
  const [related, setRelated] = useState<RelatedEntry[]>([]);
  const [disclaimer, setDisclaimer] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params?.id) return;
    let cancelled = false;
    setLoading(true); setError(null);
    ayurvedaApi.getPlant(params.id)
      .then((res) => {
        if (cancelled) return;
        setPlant(res.plant); setRelated(res.related); setDisclaimer(res.disclaimer);
      })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : String(e)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [params?.id]);

  if (loading) return <Wrap><LoadingState label="Loading monograph…" /></Wrap>;
  if (error || !plant) return <Wrap><ErrorState message={error ?? `Plant “${params?.id}” was not found in the library.`} /></Wrap>;

  return (
    <Wrap disclaimer={disclaimer}>
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-5">
          {/* Properties */}
          <Card title="Pharmacological Profile (Dravyaguna)">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-3">
              <Field label="Rasa (Taste)" value={plant.rasa.join(", ") || "—"} />
              <Field label="Virya (Potency)" value={plant.virya || "—"} />
              <Field label="Vipaka (Post-digestive)" value={plant.vipaka || "—"} />
              <Field label="Guna (Qualities)" value={plant.guna.join(", ") || "—"} />
              <Field label="Prabhava (Specific action)" value={plant.prabhava || "—"} />
              <Field label="Parts Used" value={plant.parts_used.join(", ") || "—"} />
            </dl>
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500">Balances:</span>
              {plant.doshas_balanced.map((d) => <DoshaBadge key={d} dosha={d} />)}
            </div>
          </Card>

          <Card title="Traditional Uses">
            <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
              {plant.traditional_uses.map((u) => <li key={u}>{u}</li>)}
            </ul>
          </Card>

          <Card title="Classical Formulations Containing This Herb">
            {plant.formulations.length ? (
              <ul className="flex flex-wrap gap-2 text-sm">
                {plant.formulations.map((f) => <li key={f} className="rounded-full bg-blue-50 px-3 py-1 text-[#00263f]">{f}</li>)}
              </ul>
            ) : <p className="text-sm text-slate-500">None recorded.</p>}
          </Card>

          <Card title="Active Constituents">
            <p className="text-sm text-slate-700">{plant.active_constituents.join(" · ") || "—"}</p>
          </Card>

          <Card title="Typical Dosage">
            <p className="text-sm text-slate-700">{plant.typical_dosage || "—"}</p>
          </Card>

          {/* Safety block — visually distinct, always present when data exists */}
          {(plant.safety_notes || plant.contraindications.length || plant.interactions.length) && (
            <section aria-label="Safety information" className="rounded-xl border-2 border-red-200 bg-red-50 p-4">
              <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-red-800">
                <svg aria-hidden className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" /></svg>
                Safety &amp; Contraindications
              </h2>
              {plant.safety_notes && <p className="mt-2 text-sm text-red-900">{plant.safety_notes}</p>}
              {plant.contraindications.length > 0 && (
                <p className="mt-2 text-sm text-red-900"><strong>Contraindicated:</strong> {plant.contraindications.join("; ")}</p>
              )}
              {plant.interactions.length > 0 && (
                <p className="mt-1 text-sm text-red-900"><strong>Interactions:</strong> {plant.interactions.join("; ")}</p>
              )}
            </section>
          )}

          {/* IP annotation block */}
          <section aria-label="Intellectual property notes" className="rounded-xl border-l-4 border-[#FF9933] bg-white p-4 shadow-sm">
            <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-500">
              <TypeBadge type="plant" /> Intellectual Property Notes
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">{plant.ip_notes || "No specific IP annotations."}</p>
            {plant.gi_status && (
              <p className="mt-2 rounded-md bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800">
                GI Tag: {plant.gi_status}
              </p>
            )}
          </section>
        </div>

        <aside className="space-y-5">
          <Card title="Names">
            <p className="text-sm font-bold text-[#00263f]">{plant.sanskrit_name}</p>
            <p className="text-sm italic text-slate-600">{plant.botanical_name}</p>
            <p className="text-xs text-slate-500">{plant.english_name} · Family {plant.family}</p>
            {Object.keys(plant.vernacular_names).length > 0 && (
              <ul className="mt-2 space-y-0.5 text-xs text-slate-600">
                {Object.entries(plant.vernacular_names).map(([lang, name]) => (
                  <li key={lang}><span className="font-semibold uppercase text-slate-400">{lang}</span> {name}</li>
                ))}
              </ul>
            )}
          </Card>
          <RelatedLinks entries={related} />
          <Link href="/ayurveda" className="block rounded-lg border border-slate-200 bg-white p-3 text-center text-sm font-semibold text-[#00263f] hover:bg-slate-50">
            ← Back to Library
          </Link>
        </aside>
      </div>
    </Wrap>
  );
}

function Wrap({ children, disclaimer }: { children: React.ReactNode; disclaimer?: string }) {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      <div className="mb-4">
        <DisclaimerBanner text={disclaimer ?? "Educational reference only — not medical or legal advice."} />
      </div>
      {children}
    </main>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section aria-label={title} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase text-slate-400">{label}</dt>
      <dd className="text-slate-700">{value}</dd>
    </div>
  );
}
