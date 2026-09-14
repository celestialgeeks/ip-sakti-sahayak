"use client";

import { useEffect, useState } from "react";
import { getApiUrl } from "@/lib/api";

export function StatsBar() {
  const [stats, setStats] = useState([
    {
      label: "Indexed TKDL Sheets",
      value: "Loading...",
      color: "var(--saffron)",
    },
    {
      label: "Patent Gazettes",
      value: "Loading...",
      color: "var(--emerald)",
    },
    {
      label: "Corpus Confidence",
      value: "Loading...",
      color: "var(--saffron)",
    },
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${getApiUrl()}/api/stats`);
        if (res.ok) {
          const data = await res.json();
          setStats([
            {
              label: "Indexed DB Points",
              value: data.indexed_points?.toLocaleString() || "0",
              color: "var(--saffron)",
            },
            {
              label: "Prototype Corpus Docs",
              value: data.estimated_documents?.toLocaleString() || "0",
              color: "var(--emerald)",
            },
            {
              label: "Corpus Confidence",
              value: data.confidence || "N/A",
              color: "var(--saffron)",
            },
          ]);
        }
      } catch (err) {
        console.error("Failed to load stats", err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="flex items-center justify-center gap-8 mb-10 flex-wrap">
      {stats.map((stat) => (
        <div key={stat.label} className="text-center">
          <div
            className="headline-sm mb-0.5"
            style={{ color: stat.color }}
          >
            {stat.value}
          </div>
          <div className="label-md" style={{ color: "var(--ink-muted)" }}>
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}
