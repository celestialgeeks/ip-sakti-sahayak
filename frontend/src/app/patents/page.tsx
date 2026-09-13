"use client";

import { useState } from "react";
import { useChat } from "@/hooks/useChat";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { SUGGESTED_QUERIES } from "@/lib/constants";

export default function PatentsPage() {
  const { messages, isLoading, isWaking, send } = useChat();
  
  // Use the first suggested query as the demo query
  const demoQuery = SUGGESTED_QUERIES[0]?.description || "Check novelty of a turmeric-based anti-inflammatory formulation.";
  const [query, setQuery] = useState(demoQuery);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;
    send(query.trim(), "both"); // Check both IPO and International
  };

  return (
    <div className="flex flex-col h-[calc(100vh-56px)]">
      <div className="flex-shrink-0 p-6 border-b" style={{ borderColor: "var(--border-hairline)", background: "var(--surface)" }}>
        <h1 className="headline-md mb-2" style={{ color: "var(--emerald)" }}>Novelty-Check Workbench</h1>
        <p className="body-md" style={{ color: "var(--ink-muted)" }}>Evaluate patentability, identify §3(p) objections, and cross-reference international patent databases.</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {messages.length === 0 ? (
          <div className="text-center mt-10" style={{ color: "var(--ink-muted)" }}>
            <p className="mb-4">Enter your formulation details or patent claims below.</p>
          </div>
        ) : (
          messages.map((m, i) => (
            <MessageBubble key={i} message={m} />
          ))
        )}
        {isWaking && (
          <div className="text-center p-4 label-sm italic" style={{ color: "var(--saffron)" }}>
            Waking the knowledge engine...
          </div>
        )}
        {isLoading && !isWaking && messages[messages.length - 1]?.role === "user" && (
          <div className="text-center p-4 label-sm animate-pulse" style={{ color: "var(--ink-muted)" }}>
            Scanning patent gazettes and prior art...
          </div>
        )}
      </div>

      <div className="p-4 border-t" style={{ borderColor: "var(--border-hairline)", background: "var(--surface)" }}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-4xl mx-auto">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Describe the invention claims..."
            className="w-full px-4 py-3 border rounded-md resize-none"
            rows={3}
            style={{ borderColor: "var(--border-hairline)", background: "var(--canvas)", color: "var(--ink-primary)" }}
            disabled={isLoading}
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="px-6 py-2 rounded-md font-medium text-white transition-opacity disabled:opacity-50"
              style={{ background: "var(--emerald)" }}
            >
              Check Novelty
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
