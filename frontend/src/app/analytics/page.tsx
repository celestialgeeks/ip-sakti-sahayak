"use client";

import { useState, useEffect } from "react";
import { Message } from "@/lib/types";

export default function AnalyticsPage() {
  const [stats, setStats] = useState({
    queriesAsked: 0,
    avgConfidence: 0,
    citationCount: 0,
    sessions: 1,
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem("chat_messages");
      if (saved) {
        const messages: Message[] = JSON.parse(saved);
        const userMessages = messages.filter(m => m.role === "user");
        const assistantMessages = messages.filter(m => m.role === "assistant" && m.confidence);
        
        const queriesAsked = userMessages.length;
        
        let totalConfidence = 0;
        let citationCount = 0;
        
        assistantMessages.forEach(m => {
          if (m.confidence) totalConfidence += m.confidence;
          if (m.citations) citationCount += m.citations.length;
        });

        const avgConfidence = assistantMessages.length > 0 
          ? totalConfidence / assistantMessages.length 
          : 0;

        setStats({
          queriesAsked,
          avgConfidence,
          citationCount,
          sessions: localStorage.getItem("chat_session") ? 1 : 0,
        });
      }
    } catch (e) {}
  }, []);

  return (
    <div className="flex flex-col min-h-[calc(100vh-56px)]">
      <div className="flex-shrink-0 p-6 border-b" style={{ borderColor: "var(--border-hairline)", background: "var(--surface)" }}>
        <h1 className="headline-md mb-2" style={{ color: "var(--ink-primary)" }}>Session Analytics</h1>
        <p className="body-md" style={{ color: "var(--ink-muted)" }}>Insights from your current knowledge engine session.</p>
      </div>

      <div className="flex-1 p-8 bg-transparent">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {/* Stat Cards */}
          <div className="p-6 rounded-lg border" style={{ background: "var(--surface)", borderColor: "var(--border-hairline)" }}>
            <h3 className="label-md mb-2" style={{ color: "var(--ink-muted)" }}>Total Queries</h3>
            <p className="headline-lg" style={{ color: "var(--saffron)" }}>{stats.queriesAsked}</p>
          </div>
          
          <div className="p-6 rounded-lg border" style={{ background: "var(--surface)", borderColor: "var(--border-hairline)" }}>
            <h3 className="label-md mb-2" style={{ color: "var(--ink-muted)" }}>Avg. Confidence</h3>
            <p className="headline-lg" style={{ color: "var(--emerald)" }}>{(stats.avgConfidence * 100).toFixed(1)}%</p>
          </div>

          <div className="p-6 rounded-lg border" style={{ background: "var(--surface)", borderColor: "var(--border-hairline)" }}>
            <h3 className="label-md mb-2" style={{ color: "var(--ink-muted)" }}>Citations Extracted</h3>
            <p className="headline-lg" style={{ color: "var(--ink-primary)" }}>{stats.citationCount}</p>
          </div>
          
          <div className="p-6 rounded-lg border" style={{ background: "var(--surface)", borderColor: "var(--border-hairline)" }}>
            <h3 className="label-md mb-2" style={{ color: "var(--ink-muted)" }}>Active Sessions</h3>
            <p className="headline-lg" style={{ color: "var(--ink-primary)" }}>{stats.sessions}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
