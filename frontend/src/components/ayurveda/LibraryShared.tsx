"use client";

/**
 * Shared UI primitives for the Ayurvedic Library pages.
 * Data-driven badge colors (dosha/type), disclaimer banner, related-entry links.
 */
import Link from "next/link";
import { RelatedEntry } from "@/lib/ayurveda";

export const DOSHA_STYLES: Record<string, string> = {
  Vata: "bg-violet-100 text-violet-800 border-violet-200",
  Pitta: "bg-orange-100 text-orange-800 border-orange-200",
  Kapha: "bg-emerald-100 text-emerald-800 border-emerald-200",
};

export function DoshaBadge({ dosha }: { dosha: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${DOSHA_STYLES[dosha] ?? "bg-slate-100 text-slate-700 border-slate-200"}`}
    >
      {dosha}
    </span>
  );
}

const TYPE_STYLES: Record<string, string> = {
  plant: "bg-green-100 text-[#0c5216]",
  formulation: "bg-blue-100 text-[#00263f]",
  condition: "bg-amber-100 text-amber-900",
};

export function TypeBadge({ type }: { type: string }) {
  return (
    <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${TYPE_STYLES[type] ?? "bg-slate-100 text-slate-700"}`}>
      {type}
    </span>
  );
}

export function DisclaimerBanner({ text }: { text: string }) {
  return (
    <div role="note" aria-label="Medical disclaimer" className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900">
      <svg aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" viewBox="0 0 24 24" fill="currentColor">
        <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
      </svg>
      <span>{text}</span>
    </div>
  );
}

export function relatedHref(entry: { type: string; id: string }): string {
  if (entry.type === "plant") return `/ayurveda/plants/${entry.id}`;
  if (entry.type === "formulation") return `/ayurveda/formulations/${entry.id}`;
  return `/ayurveda/conditions/${entry.id}`;
}

export function RelatedLinks({ entries, title = "Related in library" }: { entries: RelatedEntry[]; title?: string }) {
  if (!entries.length) return null;
  return (
    <section aria-label={title} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{title}</h2>
      <ul className="mt-2 space-y-1.5">
        {entries.map((e) => (
          <li key={`${e.type}:${e.id}`}>
            <Link href={relatedHref(e)} className="group flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00263f]">
              <span className="font-semibold text-[#00263f] group-hover:underline">{e.title}</span>
              <span className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500">{e.relation}</span>
                <TypeBadge type={e.type} />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ErrorState({ message, retryLabel = "Ask the AI assistant" }: { message: string; retryLabel?: string }) {
  return (
    <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-900">
      <p className="font-bold">Could not load the Ayurvedic library</p>
      <p className="mt-1 break-words">{message}</p>
      <Link href="/chat" className="mt-3 inline-block font-semibold text-[#00263f] underline hover:text-[#001d32]">
        {retryLabel} →
      </Link>
    </div>
  );
}

export function LoadingState({ label = "Loading library…" }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
      <svg className="h-5 w-5 animate-spin text-[#00263f]" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      {label}
    </div>
  );
}
