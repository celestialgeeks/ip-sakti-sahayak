"use client";

/** /ayurveda/formulations/[id] — classical formulation monograph. */
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ayurvedaApi, Formulation, Plant, RelatedEntry } from "@/lib/ayurveda";
import {
  DisclaimerBanner, ErrorState, LoadingState, RelatedLinks, TypeBadge,
} from "@/components/ayurveda/LibraryShared";

export default function FormulationDetailPage() {
  const params = useParams<{ id: string }>();
  const [form, setForm] = useState<Formulation | null>(null);
  const [ingredients, setIngredients] = useState<Plant[]>([]);
  const [related, setRelated] = useState<RelatedEntry[]>([]);
  const [disclaimer, setDisclaimer] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params?.id) return;
    let cancelled = false;
    setLoading(true); setError(null);
    ayurvedaApi.getFormulation(params.id)
      .then((res) => {
        if (cancelled) return;
        setForm(res.formulation); setIngredients(res.ingredient_details);
        setRelated(res.related); setDisclaimer(res.disclaimer);
      })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : String(e)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [params?.id]);

  if (loading) return <Wrap><LoadingState label="Loading formulation…" /></Wrap>;
  if (error || !form) return <Wrap><ErrorState message={error ?? `Formulation “${params?.id}” was not found.`} /></Wrap>;

  return (
    <Wrap disclaimer={disclaimer}>
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-5">
          <Card title="Preparation Method (Yukti)">
            <p className="text-sm leading-relaxed text-slate-700">{form.preparation_method || "—"}</p>
          </Card>

          <Card title="Therapeutic Uses">
            <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
              {form.therapeutic_uses.map((u) => <li key={u}>{u}</li>)}
            </ul>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card title="Dosage"><p className="text-sm text-slate-700">{form.dosage || "—"}</p></Card>
            <Card title="Shelf Life"><p className="text-sm text-slate-700">{form.shelf_life || "—"}</p></Card>
          </div>

          <Card title="Regulatory Classification">
            <p className="text-sm capitalize text-slate-700">Category: <strong>{form.category}</strong></p>
            <p className="mt-1 text-sm text-slate-700">{form.regulatory_notes}</p>
            {form.schedule_t_ref && (
              <p className="mt-2 rounded-md bg-blue-50 px-3 py-1.5 text-xs font-semibold text-[#00263f]">
                Schedule T: {form.schedule_t_ref}
              </p>
            )}
          </Card>

          {form.safety_notes && (
            <section aria-label="Safety information" className="rounded-xl border-2 border-red-200 bg-red-50 p-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-red-800">Safety Notes</h2>
              <p className="mt-2 text-sm text-red-900">{form.safety_notes}</p>
            </section>
          )}

          <section aria-label="Intellectual property notes" className="rounded-xl border-l-4 border-[#FF9933] bg-white p-4 shadow-sm">
            <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-500">
              <TypeBadge type="formulation" /> Intellectual Property Notes
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">{form.ip_notes || "No specific IP annotations."}</p>
          </section>
        </div>

        <aside className="space-y-5">
          <Card title="Key Ingredients">
            {ingredients.length ? (
              <ul className="space-y-1.5">
                {ingredients.map((p) => (
                  <li key={p.id}>
                    <Link href={`/ayurveda/plants/${p.id}`} className="group flex items-baseline justify-between rounded-md px-2 py-1 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00263f]">
                      <span className="text-sm font-semibold text-[#00263f] group-hover:underline">{p.sanskrit_name}</span>
                      <span className="text-xs italic text-slate-500">{p.botanical_name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : <p className="text-sm text-slate-500">Ingredient details unavailable.</p>}
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
