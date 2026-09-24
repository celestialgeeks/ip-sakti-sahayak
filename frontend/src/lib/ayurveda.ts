/**
 * Typed client for the Ayurvedic Library API (/api/ayurveda/*).
 */
import { getApiUrl } from "./api";

export interface Plant {
  id: string;
  sanskrit_name: string;
  botanical_name: string;
  family: string;
  english_name: string;
  vernacular_names: Record<string, string>;
  rasa: string[];
  virya: string;
  vipaka: string;
  guna: string[];
  doshas_balanced: string[];
  prabhava: string;
  parts_used: string[];
  traditional_uses: string[];
  formulations: string[];
  active_constituents: string[];
  typical_dosage: string;
  safety_notes: string;
  contraindications: string[];
  interactions: string[];
  gi_status: string | null;
  ip_notes: string;
}

export interface Formulation {
  id: string;
  name: string;
  sanskrit_name: string;
  type: string;
  category: string;
  ingredients: string[];
  preparation_method: string;
  therapeutic_uses: string[];
  dosage: string;
  shelf_life: string;
  regulatory_notes: string;
  schedule_t_ref: string;
  ip_notes: string;
  safety_notes: string;
}

export interface Condition {
  id: string;
  name: string;
  sanskrit_name: string;
  description: string;
  modern_equivalents: string[];
  related_plants: string[];
  related_formulations: string[];
  ip_notes: string;
}

export interface RelatedEntry {
  type: "plant" | "formulation" | "condition";
  id: string;
  title: string;
  relation: string;
}

export interface SearchHit {
  type: "plant" | "formulation" | "condition";
  id: string;
  score: number;
  title: string;
  subtitle: string;
  doshas_balanced?: string[];
  category?: string;
  safety_flag?: boolean;
}

export interface LibraryStats {
  plants: number;
  formulations: number;
  conditions: number;
  families: number;
  gi_tagged_plants: number;
  plants_with_safety_flags: number;
  updated_at: string;
  disclaimer: string;
}

async function request<T>(path: string, params?: Record<string, string | number | string[] | undefined>): Promise<T> {
  const url = new URL(`${getApiUrl()}${path}`);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v === undefined || v === "" || v === null) continue;
      if (Array.isArray(v)) v.forEach((x) => url.searchParams.append(k, x));
      else url.searchParams.set(k, String(v));
    }
  }
  const res = await fetch(url.toString());
  if (!res.ok) {
    let detail = `${res.status} ${res.statusText}`;
    try {
      const body = await res.json();
      if (body?.detail) detail = typeof body.detail === "string" ? body.detail : JSON.stringify(body.detail);
    } catch { /* keep status text */ }
    throw new Error(detail);
  }
  return res.json() as Promise<T>;
}

export const ayurvedaApi = {
  stats: () => request<LibraryStats>("/api/ayurveda/stats"),

  search: (q: string, opts?: { types?: string[]; dosha?: string; page?: number }) =>
    request<{ results: SearchHit[]; total: number; disclaimer: string }>("/api/ayurveda/search", {
      q, type: opts?.types, dosha: opts?.dosha, page: opts?.page ?? 1, page_size: 30,
    }),

  listPlants: (opts?: { dosha?: string; rasa?: string; virya?: string; family?: string; page?: number }) =>
    request<{ items: { id: string; sanskrit_name: string; botanical_name: string; english_name: string; doshas_balanced: string[] }[]; total: number }>(
      "/api/ayurveda/plants", { ...opts, page_size: 50 }),

  getPlant: (id: string) =>
    request<{ plant: Plant; related: RelatedEntry[]; disclaimer: string }>(`/api/ayurveda/plants/${encodeURIComponent(id)}`),

  listFormulations: (opts?: { type?: string; category?: string }) =>
    request<{ items: { id: string; name: string; type: string; category: string }[]; total: number }>(
      "/api/ayurveda/formulations", opts),

  getFormulation: (id: string) =>
    request<{ formulation: Formulation; ingredient_details: Plant[]; related: RelatedEntry[]; disclaimer: string }>(
      `/api/ayurveda/formulations/${encodeURIComponent(id)}`),

  listConditions: () =>
    request<{ items: { id: string; name: string; sanskrit_name: string; modern_equivalents: string[] }[]; total: number }>(
      "/api/ayurveda/conditions"),

  getCondition: (id: string) =>
    request<{ condition: Condition; related: RelatedEntry[]; disclaimer: string }>(
      `/api/ayurveda/conditions/${encodeURIComponent(id)}`),
};
