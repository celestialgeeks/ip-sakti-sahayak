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
