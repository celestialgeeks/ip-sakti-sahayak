/**
 * TypeScript type definitions for IP-SAKTI Sahayak.
 */

export type Jurisdiction = "india" | "international" | "both";

export type ConfidenceLevel = "high" | "medium" | "low";

export type Language = "en" | "hi" | "ta" | "te" | "kn" | "ml" | "bn" | "mr" | "gu" | "pa" | "or" | "sa";

export interface Citation {
  id: string;
  source: string;
  text: string;
  jurisdiction: string;
  category: string;
  confidence_tier: string;
  url?: string;
}

export interface Message {
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  confidence?: number;
  confidenceLevel?: ConfidenceLevel;
  timestamp?: string;
  statutoryAlert?: { title: string; description: string } | null;
}

export interface ChatRequest {
  query: string;
  jurisdiction: Jurisdiction;
  language: Language;
  session_id?: string;
  stream?: boolean;
}

export interface ChatResponse {
  answer: string;
  citations: Citation[];
  confidence: number;
  confidence_level: ConfidenceLevel;
  jurisdiction: Jurisdiction;
  disclaimer: string;
  session_id?: string;
  statutory_alert?: { title: string; description: string } | null;
}

export interface ClassifyRequest {
  formulation_name: string;
  description: string;
  ingredients: string[];
  is_in_authoritative_text?: boolean;
  intended_use: string;
}

export interface ClassifyResponse {
  category: string;
  description: string;
  ip_protections: string[];
  regulatory_pathway: string;
  abs_obligations: string;
  tkdl_implications: string;
}

// ─── Business Enablement ───────────────────────────────────────────

export type SchemeStatus = "eligible" | "likely" | "locked" | "not_eligible";

export interface FundingMatchRequest {
  stage: "idea" | "new" | "established";
  loan_amount: number;
  project_cost: number;
  turnover: number;
  sector: "manufacturing" | "service" | "trading" | "export";
  location: "urban" | "rural";
  social_category: "general" | "obc" | "sc" | "st";
  is_woman: boolean;
  is_greenfield: boolean;
  wants_collateral_free: boolean;
  udyam_registered: boolean;
}

export interface SchemeMatch {
  id: string;
  name: string;
  aka: string;
  ministry: string;
  status: SchemeStatus;
  band: string;
  amount_hint: string;
  benefit: string;
  docs: string[];
  portal_url: string;
  citation: { source: string; url: string };
  reasons: string[];
}

export interface FundingMatchResponse {
  size_class: string;
  locked_udyam: boolean;
  matches: SchemeMatch[];
  disclaimer: string;
}

export interface Supplier {
  id: string;
  name: string;
  region: string;
  state: string;
  materials: string[];
  gi_tags: string[];
  certifications: string[];
  website: string;
  verified: boolean;
  abs_note: string;
}

export interface SuppliersResponse {
  disclaimer: string;
  total: number;
  items: Supplier[];
}

export interface LabelCheckRequest {
  draft_text: string;
  ruleset?: "ayush" | "fssai" | null;
  product_name?: string;
}

export interface LabelFinding {
  id: string;
  label: string;
  status: "present" | "missing" | "needs_review";
  severity: "critical" | "major" | "minor";
  matched_text: string;
  guidance: string;
  citation: { source: string; url: string };
}

export interface LabelCheckResponse {
  ruleset: string;
  ruleset_label: string;
  authority: string;
  total: number;
  present: number;
  missing: number;
  critical_missing: number;
  score: number;
  findings: LabelFinding[];
  citation: { source: string; url: string };
  disclaimer: string;
}

