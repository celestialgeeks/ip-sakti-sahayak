"use client";

import { useState } from "react";
import { checkLabel } from "@/lib/api";
import type { LabelCheckResponse, LabelFinding } from "@/lib/types";

const SAMPLE = `अश्वगन्धाद्य चूर्ण / Ashwagandhadya Churna
Manufactured by: Divya Ayurvedic Pvt Ltd, 12 MG Road, Indore (M.P.)
Mfg. Lic. No. MHP-23-B/1122
Net Wt: 100 g  |  Batch No: A-204
Mfg Date: 09/2026  |  Exp Date: 08/2029
Ingredients: Withania somnifera root 100%
Dosage: 3–6 g twice daily with warm milk.
MRP ₹120 (inclusive of all taxes).`;

const statusCls: Record<LabelFinding["status"], string> = {
  present: "bg-[#E8F5E9] text-[#1B5E20] border-[#1B5E20]",
  needs_review: "bg-[#FFF3E9] text-[#E65100] border-[#E65100]",
  missing: "bg-[#FDECEA] text-[#b71c1c] border-[#b71c1c]",
};
const statusLabel: Record<LabelFinding["status"], string> = {
  present: "Present",
  needs_review: "Review",
  missing: "Missing",
};
const sevCls: Record<string, string> = {
  critical: "text-[#b71c1c]",
  major: "text-[#0b3c5d]",
  minor: "text-slate-400",
};

const btn = "rounded px-3 py-2 text-xs font-bold transition-colors";

export function LabelChecker() {
  const [draft, setDraft] = useState("");
  const [ruleset, setRuleset] = useState<"" | "ayush" | "fssai">("");
  const [result, setResult] = useState<LabelCheckResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      setResult(await checkLabel({ draft_text: draft, ruleset: ruleset || null }));
    } catch {
      setError("Could not reach the label validator. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = (s: number) => (s >= 80 ? "#138808" : s >= 50 ? "#FF9933" : "#b71c1c");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-5">
      {/* Input */}
      <section className="rounded-lg border border-[#D2D9E2] bg-white p-5 shadow-sm">
        <h3 className="text-base font-bold text-[#00263f]">Draft label screening</h3>
        <p className="text-xs text-slate-500 mb-3">
          Checked against the actual AYUSH (D&amp;C Rules Rule 161 / Sch. E(1)) or FSSAI (Labelling &amp; Display) rules — not a generic checklist.
        </p>

        <div className="mb-3">
          <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-1">
            Regulatory pathway
          </label>
          <div className="grid grid-cols-3 gap-1 rounded border border-[#D2D9E2] p-1 bg-[#F4F6F9]">
            {([["", "Auto"], ["ayush", "AYUSH drug"], ["fssai", "FSSAI food"]] as const).map(([val, lab]) => (
              <button key={val || "auto"} type="button" onClick={() => setRuleset(val)}
                className={`py-1.5 rounded text-xs font-semibold transition-colors ${ruleset === val ? "bg-[#0b3c5d] text-white" : "text-slate-600 hover:bg-white"}`}>
                {lab}
              </button>
            ))}
          </div>
        </div>

        <textarea
          aria-label="Draft label text"
          className="w-full h-64 rounded border border-[#D2D9E2] bg-white p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0b3c5d] font-mono"
          placeholder="Paste your draft label text here…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button type="button" onClick={run} disabled={loading || draft.trim().length === 0}
            className={`${btn} bg-[#0b3c5d] text-white hover:bg-[#00263f] disabled:opacity-50`}>
            {loading ? "Checking…" : "Validate Label"}
          </button>
          <button type="button" onClick={() => setDraft(SAMPLE)} className={`${btn} bg-white border border-[#D2D9E2] text-[#0b3c5d] hover:bg-[#EEF3F8]`}>
            Load sample
          </button>
          {result && (
            <span className="ml-auto text-xs">
              Routed to <span className="font-bold text-[#0b3c5d]">{result.ruleset_label}</span>
            </span>
          )}
        </div>
        {error && (
          <div className="mt-2 flex items-center gap-3">
            <p className="text-xs text-[#E65100]">{error}</p>
            <button type="button" onClick={run} className="rounded border border-[#E65100] px-2 py-0.5 text-[11px] font-semibold text-[#E65100] hover:bg-[#FFF3E9]">Retry</button>
          </div>
        )}
      </section>

      {/* Results */}
      <section className="space-y-3">
        {loading && (
          <div className="space-y-2" aria-busy="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-16 rounded-lg border border-[#D2D9E2] bg-white animate-pulse" />
            ))}
          </div>
        )}
        {!result && !loading && (
          <div className="rounded-lg border border-dashed border-[#D2D9E2] bg-white/60 p-10 text-center">
            <p className="text-sm text-slate-500">Paste a label draft and validate to get an element-by-element compliance report.</p>
          </div>
        )}

        {result && (
          <>
            <div className="rounded-lg border border-[#D2D9E2] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-[#00263f]">Compliance score</span>
                <span className="text-2xl font-black" style={{ color: scoreColor(result.score) }}>{result.score}%</span>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${result.score}%`, background: scoreColor(result.score) }} />
              </div>
              <div className="mt-3 flex gap-4 text-xs text-slate-600">
                <span><b className="text-[#138808]">{result.present}</b> present</span>
                <span><b className="text-[#b71c1c]">{result.missing}</b> missing</span>
                {result.critical_missing > 0 && <span><b className="text-[#b71c1c]">{result.critical_missing}</b> critical</span>}
              </div>
              <p className="mt-2 text-[11px] text-slate-400">Authority: {result.authority}</p>
            </div>

            <div className="space-y-2">
              {result.findings.map((f) => (
                <div key={f.id} className="rounded-lg border border-[#D2D9E2] bg-white p-3 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${f.status === "present" ? "bg-[#138808]" : f.status === "needs_review" ? "bg-[#FF9933]" : "bg-[#b71c1c]"}`} />
                      <span className="text-sm font-semibold text-[#00263f]">{f.label}</span>
                    </div>
                    <span className={`shrink-0 rounded border px-2 py-0.5 text-[10px] font-bold ${statusCls[f.status]}`}>{statusLabel[f.status]}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-2 pl-4">
                    <p className={`text-[11px] font-bold uppercase tracking-wide ${sevCls[f.severity]}`}>{f.severity}</p>
                    <a href={f.citation?.url} target="_blank" rel="noopener noreferrer" className="text-[11px] text-slate-400 hover:text-[#0b3c5d] no-underline">
                      {f.citation?.source} ↗
                    </a>
                  </div>
                  {f.status !== "present" && f.guidance && (
                    <p className="mt-1 pl-4 text-[12px] text-slate-600 leading-relaxed">{f.guidance}</p>
                  )}
                </div>
              ))}
            </div>

            {result.disclaimer && <p className="text-[11px] italic text-slate-400 px-1">{result.disclaimer}</p>}
          </>
        )}
      </section>
    </div>
  );
}
