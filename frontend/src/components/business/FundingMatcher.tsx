"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { matchFunding } from "@/lib/api";
import type {
  FundingMatchRequest,
  FundingMatchResponse,
  SchemeMatch,
  SchemeStatus,
} from "@/lib/types";

const DEFAULTS: FundingMatchRequest = {
  stage: "new",
  loan_amount: 0,
  project_cost: 0,
  turnover: 0,
  sector: "manufacturing",
  location: "urban",
  social_category: "general",
  is_woman: false,
  is_greenfield: true,
  wants_collateral_free: true,
  udyam_registered: false,
};

const STATUS_META: Record<SchemeStatus, { label: string; cls: string; spine: string }> = {
  eligible: { label: "Eligible", cls: "bg-[#E8F5E9] text-[#1B5E20] border-[#1B5E20]", spine: "bg-[#138808]" },
  locked: { label: "Needs Udyam", cls: "bg-[#FFF3E9] text-[#E65100] border-[#E65100]", spine: "bg-[#FF9933]" },
  likely: { label: "Likely", cls: "bg-[#e7eeff] text-[#00263f] border-[#0b3c5d]", spine: "bg-[#0b3c5d]" },
  not_eligible: { label: "Not matched", cls: "bg-slate-100 text-slate-500 border-slate-300", spine: "bg-slate-300" },
};

const field = "w-full h-10 rounded border border-[#D2D9E2] bg-white px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0b3c5d]";
const label = "block text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-1";

export function FundingMatcher() {
  const router = useRouter();
  const [form, setForm] = useState<FundingMatchRequest>(DEFAULTS);
  const [result, setResult] = useState<FundingMatchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof FundingMatchRequest>(k: K, v: FundingMatchRequest[K]) =>
    setForm((f) => ({ ...f, [k]: v }));
  const num = (v: string) => {
    const n = parseFloat(v.replace(/[^0-9.]/g, ""));
    return isNaN(n) ? 0 : n;
  };

  const runMatch = async () => {
    setError(null);
    if (form.loan_amount <= 0 && form.project_cost <= 0) {
      setError("Enter a loan amount or project cost to match schemes.");
      return;
    }
    setLoading(true);
    try {
      setResult(await matchFunding(form));
    } catch (e) {
      setError("Could not reach the eligibility matcher. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setForm(DEFAULTS);
    setResult(null);
    setError(null);
  };

  const askAdvisor = (m: SchemeMatch) => {
    const q = `I may be eligible for ${m.name}. Explain how to apply, documents needed, and any compliance steps for my Ayush enterprise.`;
    const sid = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `session_${Date.now()}`;
    localStorage.setItem("chat_session", sid);
    router.push(`/chat?q=${encodeURIComponent(q)}&j=india&session=${sid}`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-5">
      {/* Eligibility form */}
      <form onSubmit={(e) => { e.preventDefault(); runMatch(); }} className="bg-white rounded-lg border border-[#D2D9E2] shadow-sm p-5 h-fit">
        <h3 className="text-base font-bold text-[#00263f]">Check your eligibility</h3>
        <p className="text-xs text-slate-500 mb-4">A few inputs — matched against live 2025-26 scheme rules.</p>

        <div className="space-y-3.5">
          <div>
            <span className={label}>Enterprise stage</span>
            <div className="grid grid-cols-3 gap-1 rounded border border-[#D2D9E2] p-1 bg-[#F4F6F9]">
              {(["idea", "new", "established"] as const).map((s) => (
                <button key={s} type="button" onClick={() => set("stage", s)}
                  className={`py-1.5 rounded text-xs font-semibold capitalize transition-colors ${form.stage === s ? "bg-[#0b3c5d] text-white" : "text-slate-600 hover:bg-white"}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label} htmlFor="fm-loan">Loan needed (₹)</label>
              <input id="fm-loan" className={field} inputMode="numeric" placeholder="e.g. 800000"
                value={form.loan_amount || ""} onChange={(e) => set("loan_amount", num(e.target.value))} />
            </div>
            <div>
              <label className={label} htmlFor="fm-cost">Project cost (₹)</label>
              <input id="fm-cost" className={field} inputMode="numeric" placeholder="e.g. 800000"
                value={form.project_cost || ""} onChange={(e) => set("project_cost", num(e.target.value))} />
            </div>
          </div>

          <div>
            <label className={label} htmlFor="fm-turnover">Annual turnover (₹)</label>
            <input id="fm-turnover" className={field} inputMode="numeric" placeholder="e.g. 3000000"
              value={form.turnover || ""} onChange={(e) => set("turnover", num(e.target.value))} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label} htmlFor="fm-sector">Sector</label>
              <select id="fm-sector" className={field} value={form.sector} onChange={(e) => set("sector", e.target.value as FundingMatchRequest["sector"])}>
                <option value="manufacturing">Manufacturing</option>
                <option value="service">Wellness service</option>
                <option value="trading">Trading</option>
                <option value="export">Export</option>
              </select>
            </div>
            <div>
              <label className={label} htmlFor="fm-location">Location</label>
              <select id="fm-location" className={field} value={form.location} onChange={(e) => set("location", e.target.value as FundingMatchRequest["location"])}>
                <option value="urban">Urban</option>
                <option value="rural">Rural</option>
              </select>
            </div>
          </div>

          <div>
            <label className={label} htmlFor="fm-category">Promoter category</label>
            <select id="fm-category" className={field} value={form.social_category} onChange={(e) => set("social_category", e.target.value as FundingMatchRequest["social_category"])}>
              <option value="general">General</option>
              <option value="obc">OBC</option>
              <option value="sc">SC</option>
              <option value="st">ST</option>
            </select>
          </div>

          <div className="space-y-2 pt-1">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" className="accent-[#0b3c5d]" checked={form.is_woman} onChange={(e) => set("is_woman", e.target.checked)} />
              Woman / women-led enterprise
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" className="accent-[#0b3c5d]" checked={form.is_greenfield} onChange={(e) => set("is_greenfield", e.target.checked)} />
              Greenfield (first-time) unit
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" className="accent-[#0b3c5d]" checked={form.udyam_registered} onChange={(e) => set("udyam_registered", e.target.checked)} />
              Udyam (MSME) registered
            </label>
          </div>

          <div className="flex items-center gap-2">
            <button type="submit" disabled={loading}
              className="flex-1 h-10 mt-1 rounded bg-[#0b3c5d] hover:bg-[#00263f] text-white text-sm font-bold transition-colors disabled:opacity-60">
              {loading ? "Matching…" : "Match Schemes"}
            </button>
            {result && (
              <button type="button" onClick={reset}
                className="h-10 mt-1 px-3 rounded border border-[#D2D9E2] text-xs font-semibold text-[#0b3c5d] hover:bg-[#EEF3F8] transition-colors">
                Reset
              </button>
            )}
          </div>
          {error && <p role="alert" className="text-xs text-[#E65100]">{error}</p>}
        </div>
      </form>

      {/* Results */}
      <section className="space-y-3">
        {loading && (
          <div className="space-y-3" aria-busy="true" aria-label="Matching schemes">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-28 rounded-lg border border-[#D2D9E2] bg-white animate-pulse" />
            ))}
          </div>
        )}

        {!result && !loading && (
          <div className="rounded-lg border border-dashed border-[#D2D9E2] bg-white/60 p-10 text-center">
            <p className="text-sm text-slate-500">
              Fill the form and click <span className="font-semibold text-[#0b3c5d]">Match Schemes</span> to see
              Mudra, PMEGP, Stand-Up India &amp; CGTMSE eligibility.
            </p>
          </div>
        )}

        {result?.locked_udyam && (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-[#E65100]/40 bg-[#FFF3E9] p-4">
            <div className="text-sm text-[#E65100]">
              <span className="font-bold">Some schemes are locked.</span> Register on Udyam to unlock PMEGP &amp; CGTMSE benefits.
            </div>
            <button onClick={() => router.push("/wizard")}
              className="shrink-0 rounded bg-[#E65100] px-3 py-2 text-xs font-bold text-white hover:bg-[#c94500] transition-colors">
              Get Udyam Registered →
            </button>
          </div>
        )}

        {result && !loading && (
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 px-1">
            <span>Enterprise class: <span className="uppercase text-[#0b3c5d]">{result.size_class}</span></span>
            <span>
              {result.matches.filter((m) => m.status === "eligible").length} eligible ·{" "}
              {result.matches.filter((m) => m.status === "locked").length} need Udyam
            </span>
          </div>
        )}


        {result?.matches.map((m) => {
          const meta = STATUS_META[m.status];
          return (
            <article key={m.id} className="relative overflow-hidden rounded-lg border border-[#D2D9E2] bg-white shadow-sm">
              <div className={`absolute left-0 top-0 h-full w-1 ${meta.spine}`} />
              <div className="p-4 pl-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-[#00263f]">{m.name}</h4>
                    <p className="text-[11px] text-slate-500">{m.ministry}</p>
                  </div>
                  <span className={`rounded border px-2 py-0.5 text-[11px] font-bold ${meta.cls}`}>{meta.label}</span>
                </div>

                {m.amount_hint && (
                  <p className="mt-1 text-[12px] font-semibold text-[#0b3c5d]">{m.amount_hint}</p>
                )}
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">{m.benefit}</p>

                {m.reasons.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {m.reasons.map((r, i) => (
                      <li key={i} className="flex gap-1.5 text-[12px] text-slate-600">
                        <span className="text-[#138808]">▸</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {m.status !== "not_eligible" && (
                  <details className="mt-2 text-[12px] text-slate-600">
                    <summary className="cursor-pointer font-semibold text-[#0b3c5d]">Documents required</summary>
                    <ul className="mt-1 list-disc pl-5 space-y-0.5">
                      {m.docs.map((d, i) => <li key={i}>{d}</li>)}
                    </ul>
                  </details>
                )}

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <a href={m.portal_url} target="_blank" rel="noopener noreferrer"
                    className="rounded border border-[#0b3c5d] px-3 py-1.5 text-xs font-semibold text-[#0b3c5d] hover:bg-[#EEF3F8] transition-colors no-underline">
                    Official Apply Portal ↗
                  </a>
                  <button onClick={() => askAdvisor(m)}
                    className="rounded bg-[#1B5E20] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#14491b] transition-colors">
                    Ask Legal Advisor
                  </button>
                  <a href={m.citation?.url} target="_blank" rel="noopener noreferrer"
                    className="ml-auto text-[11px] text-slate-400 hover:text-[#0b3c5d] no-underline">
                    Source: {m.citation?.source}
                  </a>
                </div>
              </div>
            </article>
          );
        })}

        {result?.disclaimer && (
          <p className="px-1 pt-1 text-[11px] italic text-slate-400">{result.disclaimer}</p>
        )}
      </section>
    </div>
  );
}
