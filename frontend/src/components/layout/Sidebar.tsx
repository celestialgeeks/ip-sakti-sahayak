"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState, useEffect, useCallback, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { SignInModal } from "@/components/auth/SignInModal";

function SidebarSearchParamWatcher({
  onSessionChange,
}: {
  onSessionChange: (sessionId: string | null) => void;
}) {
  const searchParams = useSearchParams();
  const session = searchParams.get("session");

  useEffect(() => {
    onSessionChange(session);
  }, [session, onSessionChange]);

  return null;
}

// Navigation Tools strictly matching User Screenshot 3 & Stitch Mockups
const navItems = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
    label: "TKDL Registry",
    href: "/tkdl",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 18h8" />
        <path d="M3 22h18" />
        <path d="M14 22a7 7 0 1 0 0-14h-1" />
        <path d="M9 14h2" />
        <path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z" />
        <path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3" />
      </svg>
    ),
    label: "Patent Gazette & Prior Art",
    href: "/patents",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    label: "Latest Rules & Regulations",
    href: "/rules",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1zM2 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1zM7 21h10M12 3v18M3 7h18" />
      </svg>
    ),
    label: "Legal Advisor",
    href: "/chat",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [activeSessionParam, setActiveSessionParam] = useState<string | null>(null);

  const syncSessionFromUrl = useCallback(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      setActiveSessionParam(urlParams.get("session"));
    }
  }, []);

  useEffect(() => {
    syncSessionFromUrl();
  }, [pathname, syncSessionFromUrl]);

  const [sessions, setSessions] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<any>(null);
  const [showSignInModal, setShowSignInModal] = useState(false);

  const loadSessions = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      let loadedList: any[] = [];

      if (user) {
        const { data, error } = await supabase
          .from("chat_sessions")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (data && !error && data.length > 0) {
          loadedList = data.map((s) => ({
            id: s.id,
            title: s.title || "Legal Query Analysis",
            timestamp: s.created_at || new Date().toISOString(),
          }));
        }
      }

      // Merge with localStorage sessions history fallback
      try {
        const localHistoryStr = localStorage.getItem("chat_sessions_history");
        if (localHistoryStr) {
          const localHistory = JSON.parse(localHistoryStr);
          localHistory.forEach((item: any) => {
            if (!loadedList.some((s) => s.id === item.id)) {
              loadedList.push(item);
            }
          });
        }
      } catch (e) {}

      setSessions(loadedList);
    } catch (err) {
      console.error("Error loading sessions in Sidebar:", err);
    }
  }, []);

  useEffect(() => {
    loadSessions();

    const supabase = createClient();
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "TOKEN_REFRESHED") {
          loadSessions();
        }
      }
    );

    const handleSessionsUpdated = () => {
      loadSessions();
      syncSessionFromUrl();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "n") {
        e.preventDefault();
        handleNewSession();
      }
    };

    window.addEventListener("sessions_updated", handleSessionsUpdated);
    window.addEventListener("popstate", syncSessionFromUrl);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      authListener.subscription.unsubscribe();
      window.removeEventListener("sessions_updated", handleSessionsUpdated);
      window.removeEventListener("popstate", syncSessionFromUrl);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [loadSessions, syncSessionFromUrl]);

  // When clicking New session, clear state and return to the default dashboard with recommendations
  const handleNewSession = () => {
    setActiveSessionParam(null);
    localStorage.removeItem("chat_messages");
    localStorage.removeItem("chat_session");
    router.push("/");
  };

  const handleSelectSession = (sessionId: string) => {
    router.push(`/chat?session=${sessionId}`);
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setSessions([]);
    localStorage.removeItem("chat_messages");
    localStorage.removeItem("chat_session");
    router.push("/");
  };

  const categorizeSessions = () => {
    const now = new Date();
    const today: any[] = [];
    const lastWeek: any[] = [];
    const earlier: any[] = [];

    const filtered = sessions.filter((s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    filtered.forEach((s) => {
      const date = new Date(s.timestamp);
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 1) {
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
    <>
      <Suspense fallback={null}>
        <SidebarSearchParamWatcher onSessionChange={setActiveSessionParam} />
      </Suspense>
      <aside
        className="fixed left-0 top-[95px] bottom-0 flex flex-col justify-between z-40 hidden md:flex border-r"
        style={{
          width: "var(--sidebar-width)",
          background: "#0f172a", // slate-900
          color: "#cbd5e1", // slate-300
          borderColor: "#1e293b", // slate-800
          fontSize: "13px",
        }}
      >
        <div className="flex flex-col flex-1 p-3 overflow-y-auto overflow-x-hidden">
          {/* Top Action Item: New Session with ⌘ N badge */}
          <button
            onClick={handleNewSession}
            className={`flex items-center justify-between w-full px-2.5 py-2.5 rounded-xl transition-all group mb-2 text-left cursor-pointer border ${
              pathname === "/"
                ? "bg-slate-800/90 border-slate-700 text-white shadow-sm"
                : "border-transparent hover:bg-slate-800/60 hover:border-slate-700/60 text-slate-200"
            }`}
            title="Start a new session on the dashboard (⌘ N)"
          >
            <div className="flex items-center gap-2.5 font-medium text-slate-200 group-hover:text-white transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 group-hover:text-white">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="12" y1="8" x2="12" y2="16"></line>
                <line x1="8" y1="12" x2="16" y2="12"></line>
              </svg>
              <span className="font-semibold tracking-tight text-[14px]">New session</span>
            </div>
            <div className="flex items-center gap-0.5 text-[10px] text-slate-400 font-mono">
              <span className="px-1.5 py-0.5 rounded border border-slate-700 bg-slate-800/80 font-bold">⌘</span>
              <span className="px-1.5 py-0.5 rounded border border-slate-700 bg-slate-800/80 font-bold">N</span>
            </div>
          </button>

          {/* Feature / Tool Links strictly matching Screenshot 3 */}
          <nav className="flex flex-col gap-1 border-b pb-3 mb-3 border-slate-800/80">
            {navItems.map((item) => {
              // Highlight only if exact match, but for Legal Advisor (/chat) don't highlight if an active session is in view
              const isActive = item.href === "/chat"
                ? pathname === "/chat" && !activeSessionParam
                : pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => {
                    if (item.href === "/chat") {
                      setActiveSessionParam(null);
                    }
                  }}
                  className={`flex items-center gap-3 px-2.5 py-2 rounded-lg transition-all no-underline font-medium text-[13px] ${
                    isActive
                      ? "bg-slate-800 text-white shadow-xs"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/40"
                  }`}
                  title={item.label}
                >
                  <div style={{ color: isActive ? "#38bdf8" : "#94a3b8" }}>{item.icon}</div>
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Search Sessions Input */}
          <div className="relative mb-3 px-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-[8px] pointer-events-none text-slate-500">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sessions..."
              className="w-full rounded-lg pl-8 pr-2.5 py-1.5 text-[12px] bg-slate-800/60 border border-slate-700/60 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-slate-500 transition-colors"
            />
          </div>

          {/* SESSIONS Section */}
          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between px-2 py-1 text-[11px] font-bold tracking-wider uppercase text-slate-400">
              <div className="flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
                <span>Sessions</span>
              </div>
              {sessions.length > 0 && (
                <span className="text-[10px] text-slate-500 font-mono">({sessions.length})</span>
              )}
            </div>

            {/* If no sessions yet */}
            {sessions.length === 0 && (
              <div className="px-2 py-6 text-center text-xs text-slate-500">
                <p>No past sessions recorded.</p>
                <p className="text-[11px] text-slate-600 mt-1">Queries you send will appear here.</p>
              </div>
            )}

            {/* Today Group */}
            {today.length > 0 && (
              <>
                <div className="px-2 pt-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Today
                </div>
                <div className="flex flex-col gap-0.5">
                  {today.map((s, i) => {
                    const isSelected = activeSessionParam === s.id;
                    return (
                      <div
                        key={s.id || i}
                        onClick={() => handleSelectSession(s.id)}
                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer text-[12px] group ${
                          isSelected
                            ? "bg-slate-800 text-white font-medium border-l-2 border-emerald-500 pl-2"
                            : "hover:bg-slate-800/80 text-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-2 overflow-hidden group-hover:text-white">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isSelected ? "bg-emerald-400" : "bg-emerald-500"}`}></span>
                          <span className="truncate" title={s.title}>{s.title}</span>
                        </div>
                        <span className="text-[10px] shrink-0 ml-1 text-slate-500 font-mono">{s.daysStr}</span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* Last Week Group */}
            {lastWeek.length > 0 && (
              <>
                <div className="px-2 pt-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Last Week
                </div>
                <div className="flex flex-col gap-0.5">
                  {lastWeek.map((s, i) => {
                    const isSelected = activeSessionParam === s.id;
                    return (
                      <div
                        key={s.id || i}
                        onClick={() => handleSelectSession(s.id)}
                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer text-[12px] group ${
                          isSelected
                            ? "bg-slate-800 text-white font-medium border-l-2 border-emerald-500 pl-2"
                            : "hover:bg-slate-800/80 text-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-2 overflow-hidden group-hover:text-white">
                          <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-slate-500"></span>
                          <span className="truncate" title={s.title}>{s.title}</span>
                        </div>
                        <span className="text-[10px] shrink-0 ml-1 text-slate-500 font-mono">{s.daysStr}</span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* Earlier Group */}
            {earlier.length > 0 && (
              <>
                <div className="px-2 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Earlier
                </div>
                <div className="flex flex-col gap-0.5 mb-2">
                  {earlier.map((s, i) => {
                    const isSelected = activeSessionParam === s.id;
                    return (
                      <div
                        key={s.id || i}
                        onClick={() => handleSelectSession(s.id)}
                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer text-[12px] group ${
                          isSelected
                            ? "bg-slate-800 text-white font-medium border-l-2 border-emerald-500 pl-2"
                            : "hover:bg-slate-800/80 text-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-2 overflow-hidden group-hover:text-white">
                          <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-slate-600"></span>
                          <span className="truncate" title={s.title}>{s.title}</span>
                        </div>
                        <span className="text-[10px] shrink-0 ml-1 text-slate-500 font-mono">{s.daysStr}</span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer Profile / Auth State — Gateway Online Removed */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
          {!user ? (
            <button
              onClick={() => setShowSignInModal(true)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-[#195280] hover:bg-[#002855] text-white font-medium text-xs transition-all shadow-sm cursor-pointer border border-blue-500/40 hover:border-blue-400"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
              <span>Login / Sign Up</span>
            </button>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-200 shrink-0">
                  {user.email ? user.email.slice(0, 2).toUpperCase() : "IP"}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-xs font-semibold text-slate-200 truncate">
                    {user.email}
                  </span>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                title="Sign Out"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Sign-In Modal from navigation panel */}
      <SignInModal
        isOpen={showSignInModal}
        onClose={() => setShowSignInModal(false)}
        onSuccess={() => loadSessions()}
      />
    </>
  );
}
