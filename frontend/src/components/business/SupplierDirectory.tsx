"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchSuppliers } from "@/lib/api";
import type { Supplier } from "@/lib/types";

const STATES = ["", "Kerala", "Karnataka", "Delhi", "Uttar Pradesh", "Maharashtra", "Jammu & Kashmir", "Madhya Pradesh", "Tamil Nadu"];
const CERTS = ["", "GMP", "FSSAI", "AYUSH", "organic"];

const field = "h-9 rounded border border-[#D2D9E2] bg-white px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0b3c5d]";

export function SupplierDirectory() {
  const [items, setItems] = useState<Supplier[]>([]);
  const [q, setQ] = useState("");
  const [state, setState] = useState("");
  const [cert, setCert] = useState("");
  const [giOnly, setGiOnly] = useState(false);
  const [disclaimer, setDisclaimer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchSuppliers({ q, state, gi_only: giOnly, certification: cert || undefined });
      setItems(res.items);
      setDisclaimer(res.disclaimer);
    } catch {
      setError("Could not load the supplier directory. Please retry.");
    } finally {
      setLoading(false);
    }
  }, [q, state, giOnly, cert]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-[#D2D9E2] bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <input aria-label="Search suppliers" className={`${field} flex-1 min-w-[200px]`} placeholder="Search material, supplier or region (e.g. Ashwagandha, Turmeric)"
            value={q} onChange={(e) => setQ(e.target.value)} />
          <select aria-label="Filter by state" className={field} value={state} onChange={(e) => setState(e.target.value)}>
            {STATES.map((s) => <option key={s} value={s}>{s || "All states"}</option>)}
          </select>
          <select aria-label="Filter by certification" className={field} value={cert} onChange={(e) => setCert(e.target.value)}>
            {CERTS.map((c) => <option key={c} value={c}>{c || "Any certification"}</option>)}
          </select>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" className="accent-[#138808]" checked={giOnly} onChange={(e) => setGiOnly(e.target.checked)} />
            GI-tagged only
          </label>
          {(q || state || cert || giOnly) && (
            <button type="button" onClick={() => { setQ(""); setState(""); setCert(""); setGiOnly(false); }}
              className="text-xs font-semibold text-[#0b3c5d] hover:underline">
              Clear filters
            </button>
          )}
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Sourcing GI-tagged or region-specific raw material ties directly into your{" "}
          <span className="font-semibold text-[#0b3c5d]">ABS &amp; TKDL</span> obligations — verify authorised-user licensing.
        </p>
      </div>

      {loading && <p className="text-sm text-slate-500">Loading suppliers…</p>}
      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-[#E65100]/40 bg-[#FFF3E9] p-3">
          <p className="text-sm text-[#E65100]">{error}</p>
          <button type="button" onClick={load} className="rounded border border-[#E65100] px-2.5 py-1 text-xs font-semibold text-[#E65100] hover:bg-white">Retry</button>
        </div>
      )}

      {!loading && !error && (
        <>
          <p className="text-xs font-semibold text-slate-500">{items.length} supplier{items.length === 1 ? "" : "s"} found</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((s) => (
            <article key={s.id} className="rounded-lg border border-[#D2D9E2] bg-white p-4 shadow-sm flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-sm font-bold text-[#00263f]">{s.name}</h4>
                {s.verified ? (
                  <span className="shrink-0 inline-flex items-center gap-1 rounded border border-[#1B5E20] bg-[#E8F5E9] px-1.5 py-0.5 text-[10px] font-bold text-[#1B5E20]">
                    ✓ Verified
                  </span>
                ) : (
                  <span className="shrink-0 rounded border border-slate-300 bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
                    Unverified
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500">{s.region}</p>

              <div className="mt-2 flex flex-wrap gap-1.5">
                {s.materials.slice(0, 5).map((m) => (
                  <span key={m} className="rounded bg-[#EEF3F8] px-1.5 py-0.5 text-[10px] font-medium text-[#0b3c5d]">{m}</span>
                ))}
              </div>

              {s.gi_tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {s.gi_tags.map((g) => (
                    <span key={g} className="rounded border border-[#FF9933] bg-[#FFF3E9] px-1.5 py-0.5 text-[10px] font-bold text-[#E65100]">
                      🌿 {g}
                    </span>
                  ))}
                </div>
              )}

              {s.certifications.length > 0 && (
                <p className="mt-2 text-[11px] text-slate-600"><span className="font-semibold">Cert:</span> {s.certifications.join(" · ")}</p>
              )}
              {s.abs_note && <p className="mt-1 text-[11px] italic text-slate-500">{s.abs_note}</p>}

              {s.website && (
                <a href={s.website} target="_blank" rel="noopener noreferrer"
                  className="mt-3 text-xs font-semibold text-[#0b3c5d] hover:underline no-underline">
                  Visit supplier ↗
                </a>
              )}
            </article>
          ))}
          {items.length === 0 && (
            <p className="text-sm text-slate-500 col-span-full">No suppliers match these filters.</p>
          )}
        </div>
        </>
      )}

      {disclaimer && <p className="text-[11px] text-slate-400 leading-relaxed">{disclaimer}</p>}
    </div>
  );
}
