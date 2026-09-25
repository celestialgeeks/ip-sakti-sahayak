"use client";

/**
 * Per-step content for the "Get Registered" wizard. Steps collect the user's
 * actual data and do part of the work (MSME auto-classification, generated
 * application, GST threshold evaluation). The page renders the shared footer.
 */
import { useState } from "react";
import {
  STAGE_OPTIONS,
  StageValue,
  isGoodFit,
  UDYAM_CHECKLIST,
  UDYAM_BENEFITS,
  UDYAM_PORTAL_URL,
  UDYAM_FIELDS,
  ENTERPRISE_TYPES,
  ENTERPRISE_ACTIVITIES,
  classifyMsme,
  GMP_CHECKLIST,
  GST_CHECKLIST,
  GST_THRESHOLDS,
  GST_PORTAL_URL,
  evaluateGst,
  CLASSIFY_INTENDED_USE,
  branchFor,
  branchForCategory,
  ProductType,
  StepId,
  DISCLAIMER,
} from "@/lib/wizard/content";
import {
  useWizardState,
  setAnswers,
  setClassification,
} from "@/lib/wizard/store";
import { classifyFormulation } from "@/lib/api";

// ── Shared UI helpers ──────────────────────────────────────────────

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-[#D2D9E2] bg-white p-5 sm:p-6 space-y-5">{children}</div>
  );
}

const inputCls =
  "w-full rounded border border-[#D2D9E2] bg-white px-3 py-2 text-[14px] text-slate-800 focus:border-[#0b3c5d] focus:outline-none focus:ring-1 focus:ring-[#0b3c5d]";

function TextField({
  id,
  label,
  hint,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
}: {
  id: string;
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-[13px] font-semibold text-[#0b3c5d]">
        {label}
        {required ? <span className="ml-0.5 text-[#E65100]">*</span> : null}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={inputCls + " mt-1"}
        aria-describedby={hint ? id + "-hint" : undefined}
      />
      {hint ? (
        <p id={id + "-hint"} className="mt-1 text-[11.5px] text-slate-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function SelectField({
  id,
  label,
  hint,
  value,
  onChange,
  options,
  required,
}: {
  id: string;
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-[13px] font-semibold text-[#0b3c5d]">
        {label}
        {required ? <span className="ml-0.5 text-[#E65100]">*</span> : null}
      </label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={inputCls + " mt-1"}>
        <option value="">Select…</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {hint ? <p className="mt-1 text-[11.5px] text-slate-500">{hint}</p> : null}
    </div>
  );
}

function Checklist({ groupKey, items }: { groupKey: string; items: { id: string; label: string }[] }) {
  const { answers } = useWizardState();
  const checked = (answers[groupKey] as Record<string, boolean>) || {};
  const toggle = (id: string) => setAnswers({ [groupKey]: { ...checked, [id]: !checked[id] } });
  return (
    <ul className="space-y-2">
      {items.map((it) => (
        <li key={it.id}>
          <label className="flex items-start gap-3 rounded border border-[#D2D9E2] bg-white px-3 py-2.5 cursor-pointer hover:bg-[#EEF3F8]">
            <input type="checkbox" checked={!!checked[it.id]} onChange={() => toggle(it.id)} className="mt-0.5 h-4 w-4 accent-[#0b3c5d]" />
            <span className="text-[13.5px] text-slate-800">{it.label}</span>
          </label>
        </li>
      ))}
    </ul>
  );
}

// ── Step 1: Eligibility ────────────────────────────────────────────

export function EligibilityStep() {
  const { answers } = useWizardState();
  const stage = (answers.stage as StageValue) || "";
  const isAyurvedic = answers.isAyurvedic as boolean | undefined;
  const fit = isGoodFit(stage, isAyurvedic === true);

  return (
    <Card>
      <p className="text-[14px] text-slate-600">
        This wizard helps innovators and entrepreneurs who are ready to register and commercialize an
        Ayurvedic product. Two quick questions confirm fit.
      </p>

      <fieldset className="space-y-2">
        <legend className="text-[13px] font-semibold text-[#0b3c5d]">1. What stage are you at?</legend>
        {STAGE_OPTIONS.map((opt) => (
          <label
            key={opt.value}
            className={`flex items-center gap-3 rounded border px-3 py-2.5 cursor-pointer ${
              stage === opt.value ? "border-[#138808] bg-[#E8F5E9]" : "border-[#D2D9E2] hover:bg-[#EEF3F8]"
            }`}
          >
            <input type="radio" name="stage" checked={stage === opt.value} onChange={() => setAnswers({ stage: opt.value })} className="h-4 w-4 accent-[#138808]" />
            <span className="text-[13.5px] text-slate-800">{opt.label}</span>
          </label>
        ))}
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-[13px] font-semibold text-[#0b3c5d]">2. Is your product Ayurvedic / a heritage wellness product?</legend>
        <div className="flex gap-3">
          {[{ v: true, l: "Yes" }, { v: false, l: "No" }].map((o) => (
            <label
              key={String(o.v)}
              className={`flex items-center gap-2 rounded border px-4 py-2 cursor-pointer ${
                isAyurvedic === o.v ? "border-[#138808] bg-[#E8F5E9]" : "border-[#D2D9E2] hover:bg-[#EEF3F8]"
              }`}
            >
              <input type="radio" name="isAyurvedic" checked={isAyurvedic === o.v} onChange={() => setAnswers({ isAyurvedic: o.v })} className="h-4 w-4 accent-[#138808]" />
              <span className="text-[13.5px] text-slate-800">{o.l}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {stage && isAyurvedic !== undefined ? (
        fit ? (
          <div className="flex items-start gap-3 rounded border border-[#1B5E20] bg-[#E8F5E9] p-3">
            <CheckIcon className="mt-0.5 text-[#1B5E20]" />
            <p className="text-[13px] text-[#14532d]">
              <strong>This is for you</strong> — you are in the commercialization phase. We will guide you
              through Udyam registration, the correct licence, GMP, and GST milestones.
            </p>
          </div>
        ) : (
          <div className="flex items-start gap-3 rounded border border-[#E65100] bg-[#FFF3E0] p-3">
            <InfoIcon className="mt-0.5 text-[#E65100]" />
            <p className="text-[13px] text-[#7c2d12]">
              <strong>Not quite yet.</strong> This wizard is for the registration &amp; commercialization phase.
              If you are still exploring, try the Ayurvedic Library, Patent Database, or the Legal Advisor chat.
              You can still continue anyway below.
            </p>
          </div>
        )
      ) : null}
    </Card>
  );
}

// ── Step 2: Classification ─────────────────────────────────────────

export function ClassificationStep() {
  const { answers, classification, productType } = useWizardState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const name = (answers.classifyName as string) || "";
  const desc = (answers.classifyDesc as string) || "";
  const use = (answers.classifyUse as string) || "therapeutic";
  const ingredients = (answers.classifyIngredients as string) || "";

  async function runClassify() {
    setLoading(true);
    setError(null);
    try {
      const res = await classifyFormulation({
        formulation_name: name || "Untitled product",
        description: desc,
        intended_use: use,
        ingredients: ingredients.split(",").map((s) => s.trim()).filter(Boolean),
      });
      setClassification(res as unknown as Record<string, unknown>, branchForCategory(res.category));
    } catch {
      setError("Could not classify right now. Set the product type manually below to continue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField id="pname" label="Product / formulation name" value={name} onChange={(v) => setAnswers({ classifyName: v })} placeholder="e.g. Ashwagandha-Stress Relief Capsule" />
        <div className="sm:col-span-2">
          <label htmlFor="pdesc" className="block text-[13px] font-semibold text-[#0b3c5d]">Plain description</label>
          <textarea id="pdesc" rows={3} className={inputCls + " mt-1"} value={desc} onChange={(e) => setAnswers({ classifyDesc: e.target.value })} placeholder="What it is, how it is used, and how it is sold." />
        </div>
        <div className="sm:col-span-2">
          <span className="block text-[13px] font-semibold text-[#0b3c5d]">Intended use</span>
          <div className="mt-1 grid sm:grid-cols-3 gap-2">
            {CLASSIFY_INTENDED_USE.map((o) => (
              <label key={o.value} className={`flex items-center gap-2 rounded border px-3 py-2 cursor-pointer ${use === o.value ? "border-[#0b3c5d] bg-[#EEF3F8]" : "border-[#D2D9E2]"}`}>
                <input type="radio" name="use" className="h-4 w-4 accent-[#0b3c5d]" checked={use === o.value} onChange={() => setAnswers({ classifyUse: o.value })} />
                <span className="text-[12.5px] text-slate-800">{o.label}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="sm:col-span-2">
          <TextField id="ping" label="Key ingredients (comma separated)" value={ingredients} onChange={(v) => setAnswers({ classifyIngredients: v })} placeholder="Ashwagandha, Curcumin, Shilajit" />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={runClassify} disabled={loading} className="inline-flex items-center gap-2 rounded bg-[#0b3c5d] px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-[#002855] disabled:opacity-60">
          {loading ? "Classifying…" : "Classify my product"}
        </button>
        <span className="text-[12px] text-slate-400">or set manually:</span>
        <select
          className="rounded border border-[#D2D9E2] px-2 py-1.5 text-[12.5px]"
          value={productType === "UNKNOWN" ? "" : productType}
          onChange={(e) => {
            const v = e.target.value as ProductType | "";
            if (!v) return;
            setClassification({ category: v.toLowerCase(), manual: true }, v);
          }}
        >
          <option value="">Product type…</option>
          <option value="AYUSH">Ayurvedic drug / proprietary medicine (AYUSH)</option>
          <option value="FSSAI">Ayurvedic food / supplement (FSSAI Aahara)</option>
          <option value="COSMETIC">Cosmetic</option>
        </select>
      </div>

      {error ? <p className="text-[12.5px] text-[#E65100]">{error}</p> : null}

      {classification ? (
        <div className="rounded border-l-4 border-[#138808] bg-[#F1F8F4] p-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#138808]">Classification result</div>
          <div className="text-[15px] font-bold text-[#002855]">
            {String((classification as any).description || (classification as any).category)}
          </div>
          {(classification as any).regulatory_pathway ? (
            <p className="mt-1 text-[13px] text-slate-700">
              <strong>Regulatory pathway:</strong> {(classification as any).regulatory_pathway}
            </p>
          ) : null}
          <p className="mt-1 text-[12px] text-slate-500">
            Licence branch selected: <strong>{productType}</strong>. Continue to confirm your licence.
          </p>
        </div>
      ) : null}
    </Card>
  );
}

// ── Step 3: Udyam (real form + auto-classify + generated application) ──

export function UdyamStep() {
  const { answers } = useWizardState();
  const val = (k: string) => String(answers[k] ?? "");
  const msme = classifyMsme(Number(val("udyamInvestment")), Number(val("udyamTurnover")));
  const [copied, setCopied] = useState(false);

  function copyApplication() {
    const text = UDYAM_FIELDS.map((f) => `${f.label}: ${val(f.key) || "—"}`).join("\n") + `\nMSME class: ${msme.category}`;
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  return (
    <Card>
      <p className="text-[14px] text-slate-600">
        Enter your details once — we classify your enterprise and generate a pre-filled Udyam application you
        can carry to the official portal. Everything is self-declared.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {UDYAM_FIELDS.map((f) => {
          if (f.key === "udyamType") {
            return (
              <SelectField key={f.key} id={f.key} label={f.label} hint={f.hint} required={f.required}
                value={val(f.key)} onChange={(v) => setAnswers({ [f.key]: v })}
                options={ENTERPRISE_TYPES.map((t) => ({ value: t, label: t }))} />
            );
          }
          if (f.key === "udyamActivity") {
            return (
              <SelectField key={f.key} id={f.key} label={f.label} hint={f.hint} required={f.required}
                value={val(f.key)} onChange={(v) => setAnswers({ [f.key]: v })}
                options={ENTERPRISE_ACTIVITIES.map((t) => ({ value: t.value, label: t.label }))} />
            );
          }
          const numeric = f.key === "udyamInvestment" || f.key === "udyamTurnover";
          return (
            <TextField key={f.key} id={f.key} label={f.label} hint={f.hint} required={f.required}
              type={numeric ? "number" : "text"}
              value={val(f.key)} onChange={(v) => setAnswers({ [f.key]: v })} />
          );
        })}
      </div>

      {/* Live MSME classification */}
      <div className="flex items-center justify-between gap-3 rounded border border-[#D2D9E2] bg-[#EEF3F8] p-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#0b3c5d]">Auto-classification</div>
          <div className="text-[13px] text-slate-600">{msme.reason}</div>
        </div>
        <span className="shrink-0 rounded-full bg-[#0b3c5d] px-4 py-1.5 text-[13px] font-bold text-white">{msme.category}</span>
      </div>

      <details className="rounded border border-[#D2D9E2]">
        <summary className="cursor-pointer px-4 py-3 text-[13px] font-semibold text-[#0b3c5d]">
          Your pre-filled Udyam application
        </summary>
        <div className="border-t border-[#D2D9E2] p-4">
          <dl className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
            {UDYAM_FIELDS.map((f) => (
              <div key={f.key} className="flex justify-between gap-3 border-b border-dashed border-slate-100 py-1">
                <dt className="text-[12px] text-slate-500">{f.label}</dt>
                <dd className="text-right text-[12.5px] font-medium text-slate-800">{val(f.key) || "—"}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-3 flex flex-wrap gap-3">
            <button type="button" onClick={copyApplication} className="rounded border border-[#0b3c5d] px-3 py-1.5 text-[12.5px] font-semibold text-[#0b3c5d] hover:bg-[#EEF3F8]">
              {copied ? "Copied ✓" : "Copy details"}
            </button>
            <a href={UDYAM_PORTAL_URL} target="_blank" rel="noopener noreferrer" className="rounded bg-[#0b3c5d] px-3 py-1.5 text-[12.5px] font-semibold text-white hover:bg-[#002855]">
              Open Udyam portal ↗
            </a>
          </div>
        </div>
      </details>

      <div className="flex flex-wrap gap-2">
        {UDYAM_BENEFITS.map((b) => (
          <span key={b.id} className="rounded border border-[#138808] bg-[#E8F5E9] px-2.5 py-1 text-[12px] font-medium text-[#14532d]">{b.label}</span>
        ))}
      </div>
      <p className="text-[11.5px] text-slate-400">Reminder: {UDYAM_CHECKLIST[0].label}</p>
    </Card>
  );
}

// ── Step 4: License routing ────────────────────────────────────────

export function LicenseStep({ goTo }: { goTo: (id: StepId) => void }) {
  const { productType, answers } = useWizardState();
  const branch = branchFor(productType);
  const otherLabel = productType === "FSSAI" ? "AYUSH path" : "FSSAI Ayurveda Aahara path";
  const premisesState = String(answers.licensePremisesState ?? "");

  return (
    <Card>
      <div className="rounded border-l-4 border-[#0b3c5d] bg-[#EEF3F8] p-4">
        <p className="text-[14px] font-semibold text-[#002855]">{branch.headline}</p>
        <p className="text-[12.5px] text-slate-600">{branch.authority}</p>
      </div>

      <TextField id="licensePremisesState" label="State where manufacturing will happen"
        hint="Licensing authority is state-specific — this tailors your application."
        value={premisesState} onChange={(v) => setAnswers({ licensePremisesState: v })} required />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border-2 border-[#138808] bg-white p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[13px] font-bold text-[#14532d]">{branch.headline.split("(")[0]}</span>
            <span className="rounded bg-[#E8F5E9] px-2 py-0.5 text-[11px] font-bold text-[#1B5E20]">Selected</span>
          </div>
          <Checklist groupKey="license" items={branch.checklist} />
          <p className="mt-3 text-[12px] text-slate-500">{branch.note}</p>
        </div>

        <div className="rounded-lg border border-[#D2D9E2] bg-slate-50 p-4 opacity-70">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[13px] font-bold text-slate-500">{otherLabel}</span>
            <span className="rounded bg-slate-200 px-2 py-0.5 text-[11px] font-bold text-slate-600">Not applicable</span>
          </div>
          <p className="text-[12.5px] text-slate-500">
            {productType === "FSSAI"
              ? "AYUSH drug licence is not needed for an Ayurvedic food / supplement."
              : "FSSAI does not apply to Ayurvedic drugs or proprietary medicines."}
          </p>
        </div>
      </div>

      <button type="button" onClick={() => goTo("classification")} className="text-[12.5px] font-semibold text-[#0b3c5d] underline">
        Not sure? Re-run classification
      </button>
    </Card>
  );
}

// ── Step 5: GMP ────────────────────────────────────────────────────

export function GmpStep() {
  const { answers } = useWizardState();
  const status = String(answers.gmpStatus ?? "");
  return (
    <Card>
      <p className="text-[14px] text-slate-600">
        Good Manufacturing Practice under Schedule T of the Drugs &amp; Cosmetics Rules is commonly required and
        recommended for manufacturing credibility.
      </p>
      <SelectField id="gmpStatus" label="Where are you on GMP?" required
        value={status} onChange={(v) => setAnswers({ gmpStatus: v })}
        options={[
          { value: "planning", label: "Planning to comply" },
          { value: "certified", label: "Already GMP certified" },
          { value: "third_party", label: "Using a third-party manufacturer (Loan Licence)" },
          { value: "na", label: "Not applicable to me yet" },
        ]} />
      <Checklist groupKey="gmp" items={GMP_CHECKLIST} />
      <span className="inline-flex items-center gap-1.5 rounded bg-[#E8F5E9] px-2.5 py-1 text-[12px] font-semibold text-[#1B5E20]">
        <CheckIcon className="h-3.5 w-3.5" /> Recommended for market credibility
      </span>
    </Card>
  );
}

// ── Step 6: GST (milestone — evaluates the user's turnover) ─────────

export function GstStep() {
  const { answers } = useWizardState();
  const turnover = String(answers.gstTurnover ?? "");
  const activity = String(answers.udyamActivity ?? "manufacturing");
  const reminder = !!answers.gstReminder;
  const evalRes = turnover ? evaluateGst(Number(turnover), activity) : null;

  return (
    <Card>
      <div className="rounded border-2 border-dashed border-[#E65100] bg-[#FFF3E0] p-4">
        <p className="text-[14px] font-semibold text-[#7c2d12]">GST — register when you cross the threshold</p>
        <p className="text-[13px] text-[#9a3412]">
          Mandatory once annual turnover crosses {GST_THRESHOLDS.goods} (goods) or {GST_THRESHOLDS.services}{" "}
          (services). This is a milestone trigger, not a day-one task.
        </p>
      </div>

      <TextField id="gstTurnover" type="number" label="Your expected / current annual turnover (₹ lakh)"
        hint={answers.udyamTurnover ? "Pre-filled from your Udyam entry — adjust if needed." : "Enter a figure so we can check if registration is triggered."}
        value={turnover} onChange={(v) => setAnswers({ gstTurnover: v })} required />

      {evalRes ? (
        <div className={`rounded p-4 ${evalRes.triggered ? "border border-[#E65100] bg-[#FFF3E0]" : "border border-[#1B5E20] bg-[#E8F5E9]"}`}>
          <p className={`text-[13px] font-semibold ${evalRes.triggered ? "text-[#9a3412]" : "text-[#14532d]"}`}>
            {evalRes.triggered ? "GST registration is now required." : "Not required yet — you are below the threshold."}
          </p>
          <p className="text-[12.5px] text-slate-600">{evalRes.message}</p>
        </div>
      ) : null}

      <Checklist groupKey="gst" items={GST_CHECKLIST} />
      <label className="flex items-center gap-3 text-[13px] text-slate-700">
        <input type="checkbox" checked={reminder} className="h-4 w-4 accent-[#0b3c5d]" onChange={(e) => setAnswers({ gstReminder: e.target.checked })} />
        Set a reminder to revisit GST near the threshold
      </label>
      <a href={GST_PORTAL_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded border border-[#0b3c5d] px-4 py-2 text-[13px] font-semibold text-[#0b3c5d] hover:bg-[#EEF3F8]">
        Open GST portal ↗
      </a>
    </Card>
  );
}

// ── Step 7: Dossier ────────────────────────────────────────────────

export function DossierStep() {
  const { statuses, productType, classification, answers } = useWizardState();
  const branch = branchFor(productType);
  const category = (classification as any)?.category as string | undefined;
  const msme = classifyMsme(Number(answers.udyamInvestment), Number(answers.udyamTurnover));
  const activity = String(answers.udyamActivity ?? "manufacturing");
  const gst = answers.gstTurnover ? evaluateGst(Number(answers.gstTurnover), activity) : null;

  const rows = [
    { label: "Product", value: category || (answers.classifyName as string) || "Not classified" },
    { label: "Enterprise", value: (answers.udyamEntity as string) || "—" },
    { label: "MSME class", value: msme.category },
    { label: "Licence", value: `${branch.headline.split("(")[0].trim()} (${productType}) — other path not applicable` },
    { label: "GMP", value: statuses.gmp === "completed" ? "Planned / addressed" : "Recommended" },
    { label: "GST", value: gst ? gst.message : `Milestone at ${GST_THRESHOLDS.goods} / ${GST_THRESHOLDS.services}` },
  ];

  return (
    <Card>
      <p className="text-[14px] text-slate-600">Your personalized registration &amp; compliance summary.</p>
      <ul className="divide-y divide-[#E2E8F0] rounded border border-[#D2D9E2]">
        {rows.map((r) => (
          <li key={r.label} className="flex items-start gap-3 px-4 py-3">
            <CheckIcon className="mt-0.5 h-4 w-4 text-[#138808]" />
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{r.label}</div>
              <div className="text-[13.5px] text-slate-800">{r.value}</div>
            </div>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={() => window.print()} className="rounded bg-[#0b3c5d] px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-[#002855]">
          Download / print dossier
        </button>
      </div>
      <p className="text-[11.5px] text-slate-400">{DISCLAIMER}</p>
    </Card>
  );
}

// ── Icons ──────────────────────────────────────────────────────────

function CheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function InfoIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}
