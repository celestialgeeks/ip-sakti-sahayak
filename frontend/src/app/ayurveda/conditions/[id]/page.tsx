"use client";

/** /ayurveda/conditions/[id] — traditional condition with remedy cross-links. */
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ayurvedaApi, Condition, RelatedEntry } from "@/lib/ayurveda";
import {
  DisclaimerBanner, ErrorState, LoadingState, RelatedLinks, TypeBadge,
} from "@/components/ayurveda/LibraryShared";

export default function ConditionDetailPage() {
  const params = useParams<{ id: string }>();
  const [cond, setCond] = useState<Condition | null>(null);
  const [related, setRelated] = useState<RelatedEntry[]>([]);
  const [disclaimer, setDisclaimer] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params?.id) return;
    let cancelled = false;
    setLoading(true); setError(null);
    ayurvedaApi.getCondition(params.id)
      .then((res) => {
        if (cancelled) return;
        setCond(res.condition); setRelated(res.related); setDisclaimer(res.disclaimer);
      })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : String(e)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [params?.id]);

  if (loading) return <Wrap><LoadingState label="Loading condition entry…" /></Wrap>;
  if (error || !cond) return <Wrap><ErrorState message={error ?? `Condition “${params?.id}” was not found.`} /></Wrap>;

  return (
    <Wrap disclaimer={disclaimer}>
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-5">
          <Card title="Classical Description">
            <p className="text-sm leading-relaxed text-slate-700">{cond.description}</p>
          </Card>
          <Card title="Modern Medical Equivalents (indicative mapping only)">
            <ul className="flex flex-wrap gap-2">
              {cond.modern_equivalents.map((m) => (
                <li key={m} className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900">{m}</li>
              ))}
            </ul>
          </Card>
          <section aria-label="Intellectual property notes" className="rounded-xl border-l-4 border-[#FF9933] bg-white p-4 shadow-sm">
            <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-500">
              <TypeBadge type="condition" /> Intellectual Property Notes
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">{cond.ip_notes || "No specific IP annotations."}</p>
          </section>
        </div>
        <aside className="space-y-5">
          <RelatedLinks entries={related} title="Traditional Remedies" />
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
