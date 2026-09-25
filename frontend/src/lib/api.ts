/**
 * API client for the IP-SAKTI Sahayak backend.
 */

import type {
  ChatRequest,
  ChatResponse,
  ClassifyRequest,
  ClassifyResponse,
  FundingMatchRequest,
  FundingMatchResponse,
  SuppliersResponse,
  LabelCheckRequest,
  LabelCheckResponse,
} from "./types";
export function getApiUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "");
  }
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (hostname !== "localhost" && hostname !== "127.0.0.1") {
      return "https://ipsakti-api.onrender.com";
    }
  }
  return "http://localhost:8000";
}

function getHeaders(): HeadersInit {
  return { "Content-Type": "application/json" };
}

/**
 * Send a chat query to the RAG backend.
 */
export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  const res = await fetch(`${getApiUrl()}/api/chat`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    throw new Error(`Chat API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

/**
 * Classify an Ayurvedic formulation.
 */
export async function classifyFormulation(request: ClassifyRequest): Promise<ClassifyResponse> {
  const res = await fetch(`${getApiUrl()}/api/classify`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    throw new Error(`Classify API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

/**
 * Get a specific source document by ID.
 */
export async function getSource(sourceId: string) {
  const res = await fetch(`${getApiUrl()}/api/sources/${sourceId}`);
  if (!res.ok) {
    throw new Error(`Source API error: ${res.status}`);
  }
  return res.json();
}

/**
 * Submit user feedback on an answer.
 */
export async function submitFeedback(messageId: string, rating: string, comment?: string) {
  const res = await fetch(`${getApiUrl()}/api/feedback`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ message_id: messageId, rating, comment }),
  });
  return res.json();
}

/**
 * Check backend health.
 */
export async function checkHealth() {
  const res = await fetch(`${getApiUrl()}/api/health`);
  return res.json();
}

// ── Registration & Compliance Wizard ───────────────────────────────

async function authHeaders(): Promise<HeadersInit> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  try {
    const { createClient } = await import("@/lib/supabase/client");
    const { data } = await createClient().auth.getSession();
    if (data.session?.access_token) {
      headers["Authorization"] = `Bearer ${data.session.access_token}`;
    }
  } catch {
    /* no session — request will be rejected by auth-guarded route */
  }
  return headers;
}

/** Fetch the signed-in user's saved wizard progress. Throws if not authed. */
export async function getWizardState() {
  const res = await fetch(`${getApiUrl()}/api/wizard/state`, {
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error(`Wizard state error: ${res.status}`);
  return res.json();
}

/** Persist the signed-in user's wizard progress. Throws if not authed. */
export async function saveWizardState(payload: Record<string, unknown>) {
  const res = await fetch(`${getApiUrl()}/api/wizard/state`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Wizard save error: ${res.status}`);
  return res.json();
}

// ── Business Enablement ────────────────────────────────────────────

/** Match funding & loan schemes to an enterprise profile. */
export async function matchFunding(
  request: FundingMatchRequest
): Promise<FundingMatchResponse> {
  const res = await fetch(`${getApiUrl()}/api/business/funding/match`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(request),
  });
  if (!res.ok) throw new Error(`Funding match error: ${res.status}`);
  return res.json();
}

/** Filterable raw-material supplier directory. */
export async function fetchSuppliers(params: {
  q?: string;
  state?: string;
  gi_only?: boolean;
  certification?: string;
} = {}): Promise<SuppliersResponse> {
  const qs = new URLSearchParams();
  if (params.q) qs.set("q", params.q);
  if (params.state) qs.set("state", params.state);
  if (params.gi_only) qs.set("gi_only", "true");
  if (params.certification) qs.set("certification", params.certification);
  const res = await fetch(`${getApiUrl()}/api/business/suppliers?${qs.toString()}`);
  if (!res.ok) throw new Error(`Suppliers error: ${res.status}`);
  return res.json();
}

/** Validate a draft label against the AYUSH / FSSAI labeling ruleset. */
export async function checkLabel(
  request: LabelCheckRequest
): Promise<LabelCheckResponse> {
  const res = await fetch(`${getApiUrl()}/api/business/label/check`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(request),
  });
  if (!res.ok) throw new Error(`Label check error: ${res.status}`);
  return res.json();
}
