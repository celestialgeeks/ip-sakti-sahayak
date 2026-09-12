"use client";

import { useState, FormEvent } from "react";

interface ComposerProps {
  onSend: (message: string) => void;
  jurisdiction: string;
  onJurisdictionChange: (j: string) => void;
  disabled?: boolean;
}

const jurisdictions = [
  { value: "india", label: "IPO" },
  { value: "international", label: "EPO" },
  { value: "both", label: "USPTO" },
];

export function Composer({
  onSend,
  jurisdiction,
  onJurisdictionChange,
  disabled = false,
}: ComposerProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim() || disabled) return;
    onSend(message.trim());
    setMessage("");
  };

  return (
    <div
      className="border-t p-4"
      style={{
        background: "var(--surface)",
        borderColor: "var(--border-hairline)",
      }}
    >
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
        {/* Input Row */}
        <div
          className="flex items-center gap-2 px-4 py-3 rounded-lg border"
          style={{
            background: "var(--canvas)",
            borderColor: "var(--border-hairline)",
          }}
        >
          {/* Attach Button */}
          <button
            type="button"
            className="flex-shrink-0 w-8 h-8 rounded flex items-center justify-center"
            style={{ color: "var(--ink-muted)" }}
            title="Attach document"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
            </svg>
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask regarding Ayush patents, classical formulations, TKDL prior-art, or compliance..."
            className="flex-1 bg-transparent border-none outline-none body-md"
            style={{ color: "var(--ink-primary)" }}
            disabled={disabled}
          />

          {/* Jurisdiction Toggle */}
          <div className="flex-shrink-0 hidden sm:flex items-center gap-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ink-muted)" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
            </svg>
            <span className="label-md" style={{ color: "var(--ink-muted)" }}>
              Patent Jurisdiction
            </span>
            <select
              value={jurisdiction}
              onChange={(e) => onJurisdictionChange(e.target.value)}
              className="bg-transparent border-none outline-none label-md cursor-pointer"
              style={{ color: "var(--saffron)" }}
            >
              <option value="india">IPO</option>
              <option value="international">EPO, USPTO, WIPO</option>
              <option value="both">All</option>
            </select>
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!message.trim() || disabled}
            className="flex-shrink-0 px-5 py-2 rounded font-semibold text-sm transition-all disabled:opacity-40"
            style={{
              background: message.trim() ? "var(--saffron)" : "var(--surface-dim)",
              color: message.trim() ? "white" : "var(--ink-muted)",
            }}
          >
            Analyze →
          </button>
        </div>

        {/* Bottom meta row */}
        <div className="flex items-center justify-between mt-2 px-1">
          <div className="flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--emerald)" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span className="label-md" style={{ color: "var(--ink-muted)" }}>
              Verified against Ministry of Ayush & TKDL digital archives. Validate with registered patent attorneys.
            </span>
          </div>
        </div>
      </form>
    </div>
  );
}
