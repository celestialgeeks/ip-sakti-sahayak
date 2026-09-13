"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export function Header() {
  const [showSettings, setShowSettings] = useState(false);
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    const saved = localStorage.getItem("app_language");
    if (saved) setLanguage(saved);
  }, []);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setLanguage(val);
    localStorage.setItem("app_language", val);
  };

  const handleDownload = () => {
    window.print();
  };

  return (
    <header className="fixed top-[2px] left-0 right-0 z-50 h-[54px] flex items-center justify-between px-4 border-b"
      style={{ background: "var(--surface)", borderColor: "var(--border-hairline)" }}>
      
      {/* Left: Logo + Brand */}
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          {/* Emblem */}
          <div className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "var(--saffron-light)", border: "1.5px solid var(--saffron)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                fill="var(--saffron)" />
            </svg>
          </div>
          <span className="label-lg" style={{ color: "var(--ink-primary)" }}>
            IP-SAKTI Sahayak
          </span>
        </Link>

        {/* Ministry Badge */}
        <span className="badge-emerald hidden sm:inline-block">
          Ministry of Ayush
        </span>
      </div>

      {/* Center: Engine Version */}
      <div className="hidden md:flex items-center gap-2">
        <div className="w-2 h-2 rounded-full" style={{ background: "var(--emerald)" }} />
        <span className="body-sm" style={{ color: "var(--ink-muted)" }}>
          Ayush Knowledge Engine v2.1
        </span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 relative">
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className="w-8 h-8 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
          style={{ background: "var(--canvas)", color: showSettings ? "var(--saffron)" : "var(--ink-muted)" }}
          title="Settings">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
        </button>

        {showSettings && (
          <div className="absolute top-10 right-10 w-48 rounded-md shadow-lg border p-3" 
               style={{ background: "var(--surface)", borderColor: "var(--border-hairline)" }}>
            <h4 className="label-sm mb-2" style={{ color: "var(--ink-muted)" }}>Settings</h4>
            <div className="flex flex-col gap-2">
              <label className="body-sm flex justify-between items-center" style={{ color: "var(--ink-primary)" }}>
                Language
                <select 
                  className="border rounded bg-transparent p-1"
                  value={language}
                  onChange={handleLanguageChange}
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                </select>
              </label>
            </div>
          </div>
        )}

        <button 
          onClick={handleDownload}
          className="w-8 h-8 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
          style={{ background: "var(--canvas)" }}
          title="Download Transcript">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ink-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
          </svg>
        </button>
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white"
          style={{ background: "var(--saffron)" }}>
          U
        </div>
      </div>
    </header>
  );
}
