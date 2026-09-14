"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    ),
    label: "Assistant",
    href: "/",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
      </svg>
    ),
    label: "TKDL Registry",
    href: "/tkdl",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    label: "Patent Gazette",
    href: "/patents",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 12 2" />
      </svg>
    ),
    label: "Classify",
    href: "/classify",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    label: "Analytics",
    href: "/analytics",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [sessions, setSessions] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    const checkUserAndLoadSessions = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data, error } = await supabase
          .from("chat_sessions")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (data && !error) {
          setSessions(
            data.map((s) => ({
              id: s.id,
              title: s.title,
              timestamp: s.created_at,
            }))
          );
        }
      } else {
        setSessions([]);
      }
    };

    checkUserAndLoadSessions();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
          checkUserAndLoadSessions();
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const categorizeSessions = () => {
    const now = new Date();
    const today: any[] = [];
    const lastWeek: any[] = [];
    const earlier: any[] = [];

    sessions.forEach((s) => {
      const date = new Date(s.timestamp);
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 1) {
        today.push({ ...s, daysStr: "today" });
      } else if (diffDays <= 7) {
        lastWeek.push({ ...s, daysStr: `${diffDays}d` });
      } else {
        earlier.push({ ...s, daysStr: `${diffDays}d` });
      }
    });

    return { today, lastWeek, earlier };
  };

  const { today, lastWeek, earlier } = categorizeSessions();

  return (
    <aside
      className="fixed left-0 top-[95px] bottom-0 flex flex-col justify-between z-40 hidden md:flex border-r"
      style={{
        width: "var(--sidebar-width)",
        background: "#0f172a", // slate-900 equivalent
        color: "#cbd5e1", // slate-300 equivalent
        borderColor: "#1e293b", // slate-800 equivalent
        fontSize: "13px",
      }}
    >
      <div className="flex flex-col flex-1 p-3 overflow-y-auto overflow-x-hidden">
        {/* Top Action Item: New Session */}
        <Link
          href="/"
          className="flex items-center justify-between w-full px-2.5 py-2 rounded-lg transition-colors group mb-1 no-underline"
          style={{ color: "#e2e8f0" }}
        >
          <div className="flex items-center gap-2.5 font-medium hover:text-white transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 group-hover:text-white">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              <line x1="12" y1="7" x2="12" y2="13"></line>
              <line x1="9" y1="10" x2="15" y2="10"></line>
            </svg>
            <span>New session</span>
          </div>
          <div className="flex items-center gap-0.5 text-[10px] text-slate-400 font-mono">
            <span className="px-1 py-0.5 rounded border" style={{ borderColor: "#334155", background: "rgba(30, 41, 59, 0.8)" }}>⌘</span>
            <span className="px-1 py-0.5 rounded border" style={{ borderColor: "#334155", background: "rgba(30, 41, 59, 0.8)" }}>N</span>
          </div>
        </Link>

        {/* Tool Links */}
        <nav className="flex flex-col gap-0.5 border-b pb-3 mb-3" style={{ borderColor: "rgba(30, 41, 59, 0.8)" }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg transition-colors no-underline"
                style={{
                  color: isActive ? "#ffffff" : "#cbd5e1",
                  background: isActive ? "rgba(30, 41, 59, 0.7)" : "transparent",
                }}
                title={item.label}
              >
                <div style={{ color: isActive ? "#ffffff" : "#94a3b8" }}>{item.icon}</div>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Search Sessions Input */}
        <div className="relative mb-3 px-1">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-[7px] pointer-events-none" style={{ color: "#64748b" }}>
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            placeholder="Search sessions..."
            className="w-full rounded-lg pl-8 pr-2.5 py-1.5 text-[12px] focus:outline-none focus:border-slate-500"
            style={{
              background: "rgba(30, 41, 59, 0.6)",
              borderColor: "rgba(51, 65, 85, 0.6)",
              color: "#e2e8f0",
              borderWidth: "1px",
            }}
          />
        </div>

        {/* PINNED Section */}
        <div className="mb-3">
          <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-semibold tracking-wider uppercase" style={{ color: "#94a3b8" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            <span>Pinned</span>
          </div>
        </div>

        {/* SESSIONS Section */}
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between px-2 py-1 text-[11px] font-semibold tracking-wider uppercase" style={{ color: "#94a3b8" }}>
            <div className="flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
              <span>Sessions</span>
            </div>
          </div>

          {today.length > 0 && (
            <>
              <div className="px-2 pt-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#64748b" }}>
                Today
              </div>
              <div className="flex flex-col gap-0.5">
                {today.map((s, i) => (
                  <div key={i} className="flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer text-[12px] hover:bg-[rgba(30,41,59,0.6)]" style={{ color: "#94a3b8" }}>
                    <div className="flex items-center gap-2 overflow-hidden hover:text-[#e2e8f0]">
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "#64748b" }}></span>
                      <span className="truncate" title={s.title}>{s.title}</span>
                    </div>
                    <span className="text-[11px] shrink-0 ml-1" style={{ color: "#64748b" }}>{s.daysStr}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {lastWeek.length > 0 && (
            <>
              <div className="px-2 pt-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#64748b" }}>
                Last Week
              </div>
              <div className="flex flex-col gap-0.5">
                {lastWeek.map((s, i) => (
                  <div key={i} className="flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer text-[12px] hover:bg-[rgba(30,41,59,0.6)]" style={{ color: "#94a3b8" }}>
                    <div className="flex items-center gap-2 overflow-hidden hover:text-[#e2e8f0]">
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "#64748b" }}></span>
                      <span className="truncate" title={s.title}>{s.title}</span>
                    </div>
                    <span className="text-[11px] shrink-0 ml-1" style={{ color: "#64748b" }}>{s.daysStr}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {earlier.length > 0 && (
            <>
              <div className="px-2 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#64748b" }}>
                Earlier this month
              </div>
              <div className="flex flex-col gap-0.5 mb-2">
                {earlier.map((s, i) => (
                  <div key={i} className="flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer text-[12px] hover:bg-[rgba(30,41,59,0.6)]" style={{ color: "#94a3b8" }}>
                    <div className="flex items-center gap-2 overflow-hidden hover:text-[#e2e8f0]">
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "#64748b" }}></span>
                      <span className="truncate" title={s.title}>{s.title}</span>
                    </div>
                    <span className="text-[11px] shrink-0 ml-1" style={{ color: "#64748b" }}>{s.daysStr}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {sessions.length === 0 && (
            <div className="px-2 py-4 text-[11px] text-center italic" style={{ color: "#64748b" }}>
              No recent sessions
            </div>
          )}
        </div>
      </div>

      {/* Bottom System Settings Footer */}
      <div className="p-3 border-t flex flex-col gap-2" style={{ borderColor: "rgba(30, 41, 59, 0.8)", background: "rgba(15, 23, 42, 0.9)" }}>
        {!user ? (
          <Link
            href="/login"
            className="flex w-full items-center justify-center gap-2 px-2 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white transition-colors text-[12px] font-medium"
          >
            Sign in
          </Link>
        ) : (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full text-white flex items-center justify-center text-[11px] font-bold" style={{ background: "#0b3c5d" }}>
                {user.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex flex-col">
                <span className="text-[12px] font-medium leading-none truncate w-24" style={{ color: "#e2e8f0" }}>{user.email?.split('@')[0]}</span>
                <span className="text-[10px] leading-tight mt-0.5 cursor-pointer hover:text-white" style={{ color: "#94a3b8" }} onClick={() => supabase.auth.signOut()}>Sign out</span>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between w-full mt-1">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full text-white flex items-center justify-center text-[9px] font-bold" style={{ background: "#0f766e" }}>
              GOI
            </div>
            <span className="text-[10px] font-medium" style={{ color: "#94a3b8" }}>IP-SAKTI 2.0</span>
          </div>
          
          <button
            type="button"
            className="p-1.5 rounded-lg transition-colors hover:bg-[rgba(30,41,59,1)] hover:text-white"
            style={{ color: "#94a3b8" }}
            title="Portal Preferences"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
