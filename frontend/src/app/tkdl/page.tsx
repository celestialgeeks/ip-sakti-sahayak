"use client";

import { useState } from "react";
import { useChat } from "@/hooks/useChat";
import { MessageBubble } from "@/components/chat/MessageBubble";

export default function TKDLPage() {
  const { messages, isLoading, isWaking, send } = useChat();
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;
    // Hardcode jurisdiction to india for TKDL queries
    send(query.trim(), "india");
    setQuery("");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-56px)]">
      <div className="flex-shrink-0 p-6 border-b" style={{ borderColor: "var(--border-hairline)", background: "var(--surface)" }}>
        <h1 className="headline-md mb-2" style={{ color: "var(--saffron)" }}>TKDL Formulation Lookup</h1>
        <p className="body-md" style={{ color: "var(--ink-muted)" }}>Search classical formulations and prior art in the TKDL and Biodiversity databases.</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {messages.length === 0 ? (
          <div className="text-center mt-10" style={{ color: "var(--ink-muted)" }}>
            Enter a formulation name, ingredient, or symptom to search the TKDL database.
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
            Analyzing TKDL archives...
          </div>
        )}
      </div>

      <div className="p-4 border-t" style={{ borderColor: "var(--border-hairline)", background: "var(--surface)" }}>
        <form onSubmit={handleSubmit} className="flex gap-2 max-w-3xl mx-auto">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search formulation (e.g. Triphala Churna)..."
            className="flex-1 px-4 py-2 border rounded-md"
            style={{ borderColor: "var(--border-hairline)", background: "var(--canvas)", color: "var(--ink-primary)" }}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="px-6 py-2 rounded-md font-medium text-white transition-opacity disabled:opacity-50"
            style={{ background: "var(--saffron)" }}
          >
            Search
          </button>
        </form>
      </div>
    </div>
  );
}
