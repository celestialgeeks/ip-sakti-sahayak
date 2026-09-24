/**
 * API client for the IP-SAKTI Sahayak backend.
 */

import type { ChatRequest, ChatResponse, ClassifyRequest, ClassifyResponse } from "./types";

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
