/**
 * Static content for the "Set Up My Business" Registration & Compliance Wizard.
 *
 * The step ORDER, ids, and copy live here so text is editable in one place and
 * tests can assert on stable ids. Only the license branch (AYUSH vs FSSAI) is
 * computed dynamically from the backend /classify response.
 *
 * Compliance figures (fees, thresholds, recipe counts) are surfaced as editable
 * constants and always shown with a "verify current limits" disclaimer.
 */

export type StepId =
  | "eligibility"
  | "classification"
  | "udyam"
  | "license"
  | "gmp"
  | "gst"
  | "dossier";

export type StepStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "not_applicable"
  | "milestone";

export interface WizardStepMeta {
  id: StepId;
  index: number; // 1-based
  navLabel: string; // short label for the sidebar step rail
  title: string; // main heading on the step
  subtitle: string;
  /** GST is a milestone/conditional node, not a day-one task. */
  milestone?: boolean;
}

export const WIZARD_STEPS: WizardStepMeta[] = [
  {
    id: "eligibility",
    index: 1,
    navLabel: "Am I ready?",
    title: "Is this the right time for you?",
    subtitle:
      "This wizard helps innovators and entrepreneurs who are ready to register and commercialize an Ayurvedic product. Two quick questions confirm fit.",
  },
  {
    id: "classification",
    index: 2,
    navLabel: "What are you making?",
    title: "What are you making?",
    subtitle:
      "Tell us about your product. This decides which licence you need — the classification is grounded in the IP-SAKTI knowledge engine.",
  },
  {
    id: "udyam",
    index: 3,
    navLabel: "Register your business",
    title: "Udyam (MSME) Registration",
    subtitle: "Free, online, self-declared. Recommended first — it unlocks funding and IP-fee rebates.",
  },
  {
    id: "license",
    index: 4,
    navLabel: "Get the right licence",
    title: "Get the right licence",
    subtitle: "Routed from your product classification. AYUSH and FSSAI never overlap.",
  },
  {
    id: "gmp",
    index: 5,
    navLabel: "Quality certification",
    title: "GMP Certification",
    subtitle: "Good Manufacturing Practice — commonly required and recommended for manufacturing credibility.",
  },
  {
    id: "gst",
    index: 6,
    navLabel: "GST registration",
    title: "GST Registration",
    subtitle: "A milestone trigger — not a day-one task.",
    milestone: true,
  },
  {
    id: "dossier",
    index: 7,
    navLabel: "Compliance checklist",
    title: "Your compliance dossier",
    subtitle: "A personalized, printable summary of your registration and compliance path.",
  },
];

export const TOTAL_STEPS = WIZARD_STEPS.length;

/** Ordered step ids for forward/back navigation. */
export const STEP_ORDER: StepId[] = WIZARD_STEPS.map((s) => s.id);

export function stepMeta(id: StepId): WizardStepMeta {
  return WIZARD_STEPS.find((s) => s.id === id) ?? WIZARD_STEPS[0];
}

// ── Eligibility gate ────────────────────────────────────────────────

export const STAGE_OPTIONS = [
  { value: "idea", label: "Idea / exploration" },
  { value: "research", label: "Research & formulation" },
  { value: "commercialize", label: "Ready to manufacture & sell" },
] as const;

export type StageValue = (typeof STAGE_OPTIONS)[number]["value"];

/** A user is a good fit when they are ready to commercialize an Ayush product. */
export function isGoodFit(stage: StageValue | "", isAyurvedic: boolean): boolean {
  return stage === "commercialize" && isAyurvedic;
}

// ── Udyam (MSME) ────────────────────────────────────────────────────

export const UDYAM_CHECKLIST = [
  { id: "aadhaar_pan", label: "Keep your Aadhaar and PAN ready (self-declared, no documents upload)" },
  { id: "classify", label: "Classify as Micro / Small / Medium enterprise" },
  { id: "declare", label: "Self-declare business activity and investment" },
  { id: "save_number", label: "Save your Udyam Registration Number" },
];

export const UDYAM_BENEFITS = [
  { id: "cgtmse", label: "Collateral-free credit via CGTMSE" },
  { id: "psl", label: "Priority-sector lending" },
  { id: "procurement", label: "Government procurement preference" },
  { id: "ip_fees", label: "Reduced trademark & patent official fees" },
];

export const UDYAM_PORTAL_URL = "https://udyamregistration.gov.in";

// ── License routing (branch content) ────────────────────────────────

export type ProductType = "AYUSH" | "FSSAI" | "COSMETIC" | "UNKNOWN";

export interface LicenseBranch {
  productType: ProductType;
  headline: string;
  authority: string;
  checklist: { id: string; label: string }[];
  note: string;
}

export const AYUSH_BRANCH: LicenseBranch = {
  productType: "AYUSH",
  headline: "AYUSH Manufacturing Licence (Ayurvedic drug / proprietary medicine)",
  authority: "State Licensing Authority under the Drugs & Cosmetics Act",
  checklist: [
    { id: "ml_form", label: "Manufacturing Licence application form" },
    { id: "schedule_t", label: "Schedule T compliant premises" },
    { id: "sla_submit", label: "State Licensing Authority submission" },
    { id: "loan_licence", label: "Loan Licence for third-party manufacture (if applicable)" },
  ],
  note: "FSSAI does not apply to Ayurvedic drugs or proprietary medicines.",
};

export const FSSAI_BRANCH: LicenseBranch = {
  productType: "FSSAI",
  headline: 'FSSAI "Ayurveda Aahara" Central Licence (Ayurvedic food / supplement)',
  authority: "FSSAI — new Kind of Business on FoSCoS (effective 1 Sep 2025)",
  checklist: [
    { id: "kob", label: 'Select the "Ayurveda Aahara" Kind of Business on FoSCoS' },
    { id: "recipe", label: "Match your product to an approved Ayurveda Aahara recipe" },
    { id: "central", label: "Apply for the Central Licence (annual fee ₹7,500 + GST)" },
    { id: "labeling", label: "Comply with labelling & claims rules" },
  ],
  note: "Explicitly excludes Ayurvedic drugs, proprietary medicines, and narcotic/psychotropic substances — so it never overlaps with the AYUSH path.",
};

export const COSMETIC_NOTE: LicenseBranch = {
  productType: "COSMETIC",
  headline: "Cosmetic Licence (for Ayurvedic cosmetics / personal care)",
  authority: "State Licensing Authority — cosmetics route under the Drugs & Cosmetics Act",
  checklist: [
    { id: "cl_form", label: "Cosmetic manufacturing licence application" },
    { id: "gmp", label: "GMP for cosmetics" },
    { id: "labeling", label: "Labelling & ingredient declaration" },
  ],
  note: "Cosmetics are a distinct pathway — confirm classification if your product also makes therapeutic claims.",
};

/** Map a /classify FormulationCategory to the licence branch. */
export function branchForCategory(category: string | undefined | null): ProductType {
  switch (category) {
    case "ayurveda_aahar":
      return "FSSAI";
    case "cosmetic":
      return "COSMETIC";
    case "classical":
    case "proprietary":
    case "new_drug":
    case "phytopharmaceutical":
      return "AYUSH";
    default:
      return "UNKNOWN";
  }
}

export function branchFor(productType: ProductType): LicenseBranch {
  if (productType === "FSSAI") return FSSAI_BRANCH;
  if (productType === "COSMETIC") return COSMETIC_NOTE;
  return AYUSH_BRANCH;
}

// ── GMP ─────────────────────────────────────────────────────────────

export const GMP_CHECKLIST = [
  { id: "premises", label: "Premises & layout per Schedule T" },
  { id: "qc_lab", label: "Quality control lab & documentation" },
  { id: "self_inspection", label: "Self-inspection affidavit" },
  { id: "apply", label: "Apply for GMP certificate via State AYUSH authority" },
];

// ── GST (milestone) ─────────────────────────────────────────────────

export const GST_THRESHOLDS = { goods: "₹40 lakh", services: "₹20 lakh" };

export const GST_CHECKLIST = [
  { id: "track", label: "Track your annual turnover" },
  { id: "register", label: `Register on the GST portal once you cross the limit` },
  { id: "scheme", label: "Choose composition vs regular scheme" },
];

export const GST_PORTAL_URL = "https://gst.gov.in";

// ── Classification result copy ──────────────────────────────────────

export const CLASSIFY_INTENDED_USE = [
  { value: "therapeutic", label: "Therapeutic / medicinal (drug)" },
  { value: "food", label: "Food or supplement" },
  { value: "cosmetic", label: "Cosmetic / personal care" },
] as const;

export const DISCLAIMER =
  "Information only, not legal advice. Verify current fees and thresholds on the official portals.";

// ── Udyam data entry + MSME auto-classification ─────────────────────

export const ENTERPRISE_TYPES = [
  "Sole Proprietorship",
  "Partnership Firm",
  "LLP",
  "Private Limited Company",
  "Public Limited Company",
  "Co-operative Society",
] as const;

export const ENTERPRISE_ACTIVITIES = [
  { value: "manufacturing", label: "Manufacturing / Processing" },
  { value: "services", label: "Services" },
  { value: "both", label: "Both" },
] as const;

export type MsmeCategory = "Micro" | "Small" | "Medium" | "Unknown";

/**
 * Composite MSME classification (revised 2020 criteria): a unit is the highest
 * bracket that BOTH its investment and turnover fit within. Amounts in ₹ lakh.
 */
export function classifyMsme(
  investmentLakh: number,
  turnoverLakh: number
): { category: MsmeCategory; reason: string } {
  const inv = Number(investmentLakh) || 0;
  const turn = Number(turnoverLakh) || 0;
  if (!inv && !turn) return { category: "Unknown", reason: "Enter investment and turnover to classify." };
  const byInvestment = inv <= 100 ? "Micro" : inv <= 1000 ? "Small" : "Medium";
  const byTurnover = turn <= 500 ? "Micro" : turn <= 5000 ? "Small" : "Medium";
  const rank: Record<string, number> = { Micro: 1, Small: 2, Medium: 3 };
  const category = (rank[byInvestment] >= rank[byTurnover] ? byInvestment : byTurnover) as MsmeCategory;
  return {
    category,
    reason: `Investment ₹${inv} lakh → ${byInvestment}; turnover ₹${turn} lakh → ${byTurnover}. Composite: ${category}.`,
  };
}

/** Udyam form field metadata (drives the generated application preview). */
export const UDYAM_FIELDS = [
  { key: "udyamAadhaar", label: "Aadhaar number", hint: "Self-declared; used to fetch PAN. 12 digits.", required: true },
  { key: "udyamPan", label: "PAN", hint: "Mandatory. 10 characters.", required: true },
  { key: "udyamEntity", label: "Enterprise name", hint: "As it should appear on the registry.", required: true },
  { key: "udyamType", label: "Type of enterprise", hint: "Proprietorship / Partnership / Company, etc.", required: true },
  { key: "udyamActivity", label: "Nature of business", hint: "Manufacturing, Services, or Both.", required: true },
  { key: "udyamState", label: "State", hint: "Where the enterprise is located.", required: true },
  { key: "udyamDistrict", label: "District", hint: "District of operation.", required: true },
  { key: "udyamPincode", label: "PIN code", hint: "6 digits.", required: true },
  { key: "udyamInvestment", label: "Total investment in Plant & Equipment (₹ lakh)", hint: "Self-declared. Drives Micro/Small/Medium class.", required: true },
  { key: "udyamTurnover", label: "Annual turnover (₹ lakh)", hint: "Self-declared estimate. Drives class + GST milestone.", required: true },
] as const;

// ── GST milestone evaluation ────────────────────────────────────────

export function evaluateGst(turnoverLakh: number, activity: string): { triggered: boolean; message: string } {
  const turn = Number(turnoverLakh) || 0;
  const servicesOnly = activity === "services";
  const thresholdLakh = servicesOnly ? 20 : 40;
  const triggered = turn >= thresholdLakh;
  return {
    triggered,
    message: triggered
      ? `Your turnover (₹${turn} lakh) is at or above the ₹${thresholdLakh} lakh threshold — GST registration is now required.`
      : `Your turnover (₹${turn} lakh) is below the ₹${thresholdLakh} lakh threshold. No GST registration needed yet — revisit once you cross it.`,
  };
}

// ── Step completion + gating ────────────────────────────────────────

export interface CompletionInput {
  answers: Record<string, unknown>;
  classification: Record<string, unknown> | null;
  productType: ProductType;
}

/** Whether a step's required data has been provided (drives gating). */
export function isStepComplete(id: StepId, s: CompletionInput): boolean {
  const a = s.answers || {};
  const str = (k: string) => String(a[k] ?? "").trim();
  switch (id) {
    case "eligibility":
      return !!str("stage") && a.isAyurvedic !== undefined;
    case "classification":
      return !!s.classification || s.productType !== "UNKNOWN";
    case "udyam":
      return UDYAM_FIELDS.every((f) => !f.required || str(f.key).length > 0);
    case "license":
      return s.productType !== "UNKNOWN" && !!str("licensePremisesState");
    case "gmp":
      return !!str("gmpStatus");
    case "gst":
      return str("gstTurnover").length > 0;
    case "dossier":
      return true;
    default:
      return false;
  }
}

export const STEP_HINTS: Record<StepId, string> = {
  eligibility: "Answer both questions to continue.",
  classification: "Run the classifier (or pick your product type) to continue.",
  udyam: "Fill the required Udyam details to generate your application.",
  license: "Confirm your product type and enter your manufacturing state.",
  gmp: "Choose your GMP status to continue.",
  gst: "Enter your annual turnover so we can check the threshold.",
  dossier: "",
};

export const GUIDANCE: Record<StepId, { title: string; points: string[] }> = {
  eligibility: { title: "Who this is for", points: [
    "Built for innovators ready to commercialize an Ayurvedic product.",
    "Still exploring? Use the Library, Patent Database, or Legal Advisor chat.",
    "Nothing is hard-blocked — you can continue anyway.",
  ]},
  classification: { title: "Why we classify first", points: [
    "The licence you need depends entirely on how your product is classified.",
    "We run your details through the IP-SAKTI knowledge engine.",
    "You can also set the product type manually if you already know it.",
  ]},
  udyam: { title: "About Udyam (MSME)", points: [
    "100% free, online, self-declared — no documents or fees.",
    "Aadhaar and PAN are the only inputs; we auto-classify Micro/Small/Medium.",
    "Unlocks CGTMSE collateral-free credit, priority-sector lending, and reduced IP fees.",
    "We generate a pre-filled application you can carry to the portal.",
  ]},
  license: { title: "Getting the right licence", points: [
    "AYUSH drug/proprietary → State AYUSH Manufacturing Licence (Schedule T).",
    "Ayurvedic food/supplement → FSSAI 'Ayurveda Aahara' Central Licence.",
    "These two paths never overlap — classification decides it.",
  ]},
  gmp: { title: "GMP & credibility", points: [
    "Schedule T GMP is commonly required and expected by buyers.",
    "Third-party manufacturers may use a Loan Licence arrangement.",
  ]},
  gst: { title: "GST is a milestone", points: [
    "Not needed on day one — it triggers at ₹40L (goods) / ₹20L (services).",
    "Enter your turnover and we'll tell you if you've crossed it.",
  ]},
  dossier: { title: "Your dossier", points: [
    "A single, printable summary of everything you entered.",
    "Share it with your CA, patent agent, or the State Licensing Authority.",
  ]},
};

export const BUTTON_LABEL = "Get Registered";
