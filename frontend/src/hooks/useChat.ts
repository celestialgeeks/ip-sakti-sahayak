"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Message, Jurisdiction, ChatResponse } from "@/lib/types";
import { getApiUrl } from "@/lib/api";
import {
  addServerStage,
  applyGrounding,
  extractModelThinking,
  failReasoning,
  finishReasoning,
  noteSlowStart,
  openStream,
  receiveChunk,
  recordModelThinking,
  startReasoning,
  toRecord,
  type ChatPhase,
  type ReasoningTracker,
} from "@/lib/reasoning";

/** Cold-start hedge: past this many ms with no bytes, say so on the trace. */
const SLOW_START_MS = 25000;

/**
 * Hook for managing chat state, API communication, and Supabase session persistence.
 *
 * Exposes two distinct loading signals, because the UI used to conflate them:
 * `isLoading` is "a request is in flight" (keeps the composer locked), while
 * `isThinking` is "no content token has arrived yet" and is the ONLY window in
 * which a thinking animation may be visible.
 */
export function useChat(initialSessionId?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isWaking, setIsWaking] = useState(false);
  const [phase, setPhase] = useState<ChatPhase>("idle");
  const [sessionId, setSessionId] = useState<string | undefined>(initialSessionId);
  const isStreamingRef = useRef(false);
  const isThinking = phase === "waiting";

  /**
   * Write the measured trace onto the assistant message that is currently being
   * produced. Called at milestones, never per token, so the log grows without
   * adding a render to every chunk of the answer.
   */
  const attachReasoning = useCallback((tracker: ReasoningTracker) => {
    const record = toRecord(tracker);
    setMessages((prev) => {
      if (prev.length === 0) return prev;
      const lastIndex = prev.length - 1;
      if (prev[lastIndex].role !== "assistant") return prev;
      const next = [...prev];
      next[lastIndex] = { ...next[lastIndex], reasoning: record };
      return next;
    });
  }, []);

  // Load session messages either from Supabase (if authenticated) or localStorage
  const loadSession = useCallback(async (targetSessionId: string) => {
    if (isStreamingRef.current) {
      return;
    }
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data, error } = await supabase
          .from("chat_messages")
          .select("*")
          .eq("session_id", targetSessionId)
          .order("created_at", { ascending: true });

        if (isStreamingRef.current) {
          return;
        }

        if (data && data.length > 0 && !error) {
          const loaded: Message[] = data.map((m: any) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
            citations: m.citations || undefined,
            timestamp: m.created_at,
          }));
          setMessages(loaded);
          setSessionId(targetSessionId);
          localStorage.setItem("chat_session", targetSessionId);
          localStorage.setItem("chat_messages", JSON.stringify(loaded));
          return;
        }
      }

      if (isStreamingRef.current) {
        return;
      }

      // Fallback to localStorage if no DB messages found
      const saved = localStorage.getItem(`chat_messages_${targetSessionId}`);
      if (saved) {
        setMessages(JSON.parse(saved));
        setSessionId(targetSessionId);
        localStorage.setItem("chat_session", targetSessionId);
      }
    } catch (err) {
      console.error("Failed to load session:", err);
    }
  }, []);

  // Initialize from props or local storage on mount
  useEffect(() => {
    if (initialSessionId) {
      // If there is an active query in the URL, don't preemptively load session
      if (typeof window !== "undefined") {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get("q")) {
          return;
        }
      }
      if (!isStreamingRef.current) {
        loadSession(initialSessionId);
      }
    } else {
      const saved = localStorage.getItem("chat_messages");
      const savedSession = localStorage.getItem("chat_session");
      if (saved) {
        try {
          setMessages(JSON.parse(saved));
        } catch (e) {}
      }
      if (savedSession) {
        setSessionId(savedSession);
      }
    }
  }, [initialSessionId, loadSession]);

  // Save to localStorage when messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("chat_messages", JSON.stringify(messages));
      if (sessionId) {
        localStorage.setItem(`chat_messages_${sessionId}`, JSON.stringify(messages));
      }
    }
    if (sessionId) {
      localStorage.setItem("chat_session", sessionId);
    }
  }, [messages, sessionId]);

  const send = useCallback(
    async (query: string, jurisdiction: Jurisdiction = "india") => {
      isStreamingRef.current = true;
      const language = localStorage.getItem("app_language") || "en";
      const userMessage: Message = { 
        role: "user", 
        content: query,
        timestamp: new Date().toISOString(),
      };
      const initialAssistantMessage: Message = { 
        role: "assistant", 
        content: "",
        timestamp: new Date().toISOString(),
      };

      // Atomically append both user message and empty assistant message
      setMessages((prev) => [...prev, userMessage, initialAssistantMessage]);
      setIsLoading(true);
      setIsWaking(false);

      // The trace starts before the request leaves, so every later step is a
      // measured delta from a real send time rather than a mount animation.
      let tracker = startReasoning(Date.now(), { jurisdiction, language });
      setPhase(tracker.phase);
      attachReasoning(tracker);

      const timeoutId = setTimeout(() => {
        setIsWaking(true);
        tracker = noteSlowStart(tracker, Date.now(), SLOW_START_MS);
        attachReasoning(tracker);
      }, SLOW_START_MS);

      // Generate or retrieve session ID
      const activeSessionId = sessionId || (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `session_${Date.now()}`);
      if (!sessionId) {
        setSessionId(activeSessionId);
        localStorage.setItem("chat_session", activeSessionId);
      }

      // Sync active session ID to URL without page reload
      if (typeof window !== "undefined" && window.history?.replaceState) {
        const currentUrl = new URL(window.location.href);
        if (currentUrl.searchParams.get("session") !== activeSessionId) {
          currentUrl.searchParams.set("session", activeSessionId);
          currentUrl.searchParams.delete("q");
          window.history.replaceState(null, "", currentUrl.pathname + currentUrl.search);
        }
      }

      // Immediately register in local history for instant sidebar responsiveness
      try {
        const historyStr = localStorage.getItem("chat_sessions_history");
        const history = historyStr ? JSON.parse(historyStr) : [];
        if (!history.find((s: any) => s.id === activeSessionId)) {
          history.unshift({
            id: activeSessionId,
            title: query.length > 55 ? query.slice(0, 52) + "..." : query,
            timestamp: new Date().toISOString()
          });
          localStorage.setItem("chat_sessions_history", JSON.stringify(history));
          window.dispatchEvent(new Event("sessions_updated"));
        }
      } catch (e) {}

      // 1. Safe Supabase lookup in isolated try-catch so auth checks never block the query
      let session: any = null;
      let user: any = null;
      let supabaseClient: any = null;
      try {
        const { createClient } = await import("@/lib/supabase/client");
        supabaseClient = createClient();
        const { data } = await supabaseClient.auth.getSession();
        session = data?.session;
        user = session?.user;

        // Persist session & user message to Supabase if authenticated
        if (user) {
          try {
            await supabaseClient.from("chat_sessions").upsert({
              id: activeSessionId,
              user_id: user.id,
              title: query.length > 55 ? query.slice(0, 52) + "..." : query,
            });

            await supabaseClient.from("chat_messages").insert({
              session_id: activeSessionId,
              role: "user",
              content: query,
            });

            // Notify Sidebar to refresh list
            window.dispatchEvent(new Event("sessions_updated"));
          } catch (dbErr) {
            console.warn("Supabase user message persistence error:", dbErr);
          }
        }
      } catch (authErr) {
        console.warn("Non-fatal Supabase session error:", authErr);
      }

      try {
        const headers: Record<string, string> = { 
          "Content-Type": "application/json" 
        };
        
        if (session?.access_token) {
          headers["Authorization"] = `Bearer ${session.access_token}`;
        }

        const apiUrl = getApiUrl();
        const res = await fetch(`${apiUrl}/api/chat`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            query,
            jurisdiction,
            language,
            session_id: activeSessionId,
            stream: true,
          }),
        });

        clearTimeout(timeoutId);
        setIsWaking(false);

        if (!res.ok) {
          let errorDetail = `Status ${res.status}`;
          try {
            const errData = await res.json();
            if (errData?.detail) {
              errorDetail = errData.detail;
            }
          } catch (e) {}
          throw new Error(`Chat API error: ${errorDetail}`);
        }

        // Headers are back but no content yet: the gap from here to the first
        // chunk is the backend's language detect → classify → embed → search →
        // prompt assembly window, which is exactly what the trace should show.
        tracker = openStream(tracker, Date.now(), res.status);
        attachReasoning(tracker);

        if (!res.body) throw new Error("No response body");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let done = false;
        let currentContent = "";
        let finalMetadata: any = null;

        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          if (value) {
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n\n");
            
            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") {
                  break;
                }
                try {
                  const parsed = JSON.parse(data);
                  if (parsed.chunk) {
                    currentContent += parsed.chunk;
                    const wasThinking = tracker.phase === "waiting";
                    const previousDraft = tracker.modelThinking;
                    tracker = receiveChunk(tracker, Date.now(), parsed.chunk);

                    // Sanitize any residual thinking process on the client, and
                    // salvage it into the trace rather than dropping it unseen.
                    let displayContent = currentContent;
                    const draft = extractModelThinking(currentContent);
                    if (draft) {
                      tracker = recordModelThinking(tracker, draft);
                    }
                    if (displayContent.includes("Here's a thinking process:") || displayContent.includes("<think>")) {
                      displayContent = displayContent
                        .replace(/<think>[\s\S]*?<\/think>/gi, "")
                        .replace(/^Here's a thinking process:[\s\S]*?(?=\n\n(?:###|[A-Z]|\d+\.\s+\*\*)|$)/i, "")
                        .replace(/^\s*1\.\s+\*\*Analyze User Request:\*\*[\s\S]*?(?=\n\n(?:###|[A-Z])|$)/i, "")
                        .trimStart();
                    }

                    // Safely update the assistant message in state
                    setMessages((prev) => {
                      const newMsgs = [...prev];
                      if (newMsgs.length === 0) {
                        return [{ role: "assistant", content: displayContent, timestamp: new Date().toISOString() }];
                      }
                      const lastIndex = newMsgs.length - 1;
                      const lastMsg = newMsgs[lastIndex];

                      if (lastMsg.role === "assistant") {
                        newMsgs[lastIndex] = {
                          ...lastMsg,
                          content: displayContent,
                        };
                      } else {
                        // Crucial safety check: if last message is a user message, NEVER overwrite it! Append!
                        newMsgs.push({
                          role: "assistant",
                          content: displayContent,
                          timestamp: new Date().toISOString(),
                        });
                      }
                      return newMsgs;
                    });

                    // Milestones only: the phase flip that hides the indicator, or
                    // new chain-of-thought text. Ordinary tokens skip this write.
                    if (wasThinking || tracker.modelThinking !== previousDraft) {
                      setPhase(tracker.phase);
                      attachReasoning(tracker);
                    }
                  } else if (parsed.reasoning || parsed.stage) {
                    // Forward-compatible milestone: when the pipeline reports its own
                    // stages over SSE they join the same log, flagged `server` so the
                    // UI can tell a reported fact from a locally measured one.
                    const payload = parsed.reasoning ?? parsed.stage;
                    const label = typeof payload === "string" ? payload : payload?.label;
                    if (label) {
                      tracker = addServerStage(
                        tracker,
                        { label, detail: typeof payload === "string" ? undefined : payload?.detail },
                        Date.now(),
                      );
                      attachReasoning(tracker);
                    }
                  } else if (parsed.metadata) {
                    finalMetadata = parsed.metadata;
                    const returnedSessionId = parsed.metadata.session_id || activeSessionId;
                    setSessionId(returnedSessionId);
                    
                    // Save to history list for the sidebar fallback
                    try {
                      const historyStr = localStorage.getItem("chat_sessions_history");
                      const history = historyStr ? JSON.parse(historyStr) : [];
                      if (!history.find((s: any) => s.id === returnedSessionId)) {
                        history.unshift({
                          id: returnedSessionId,
                          title: query,
                          timestamp: new Date().toISOString()
                        });
                        localStorage.setItem("chat_sessions_history", JSON.stringify(history));
                      }
                      window.dispatchEvent(new Event("sessions_updated"));
                    } catch (e) {}

                    setMessages((prev) => {
                      const newMsgs = [...prev];
                      if (newMsgs.length === 0) return newMsgs;
                      const lastIndex = newMsgs.length - 1;
                      const lastMsg = newMsgs[lastIndex];

                      if (lastMsg.role === "assistant") {
                        newMsgs[lastIndex] = {
                          ...lastMsg,
                          citations: parsed.metadata.citations,
                          confidence: parsed.metadata.confidence,
                          confidenceLevel: parsed.metadata.confidence_level,
                          statutoryAlert: parsed.metadata.statutory_alert,
                        };
                      } else {
                        newMsgs.push({
                          role: "assistant",
                          content: currentContent,
                          citations: parsed.metadata.citations,
                          confidence: parsed.metadata.confidence,
                          confidenceLevel: parsed.metadata.confidence_level,
                          statutoryAlert: parsed.metadata.statutory_alert,
                          timestamp: new Date().toISOString(),
                        });
                      }
                      return newMsgs;
                    });

                    // Verification is a real milestone with real numbers, so the
                    // trace ends with what the answer was actually grounded in.
                    tracker = applyGrounding(tracker, parsed.metadata, Date.now());
                    attachReasoning(tracker);
                  }
                } catch (e) {
                  // Incomplete chunk, ignore
                }
              }
            }
          }
        }

        // Close the log before persistence, so the stored trace ends with a
        // measured total rather than the last chunk it happened to see.
        tracker = finishReasoning(tracker, Date.now());
        setPhase(tracker.phase);
        attachReasoning(tracker);

        // Persist assistant response to Supabase after stream completes
        if (supabaseClient && user && currentContent) {
          try {
            await supabaseClient.from("chat_messages").insert({
              session_id: activeSessionId,
              role: "assistant",
              content: currentContent,
              citations: finalMetadata?.citations || null,
            });
            window.dispatchEvent(new Event("sessions_updated"));
          } catch (dbErr) {
            console.warn("Failed saving assistant message to Supabase:", dbErr);
          }
        }

      } catch (error: any) {
        clearTimeout(timeoutId);
        setIsWaking(false);
        console.error("useChat fatal send error:", error);
        setMessages((prev) => {
          const newMsgs = [...prev];
          const lastIndex = newMsgs.length - 1;
          const errorMsg: Message = {
            role: "assistant",
            content: `I apologize, but I encountered an error: ${error?.message || "unable to connect to backend service"}. Please ensure the service is online and try again.`,
            confidenceLevel: "low",
            timestamp: new Date().toISOString(),
          };
          if (lastIndex >= 0 && newMsgs[lastIndex].role === "assistant") {
            newMsgs[lastIndex] = errorMsg;
          } else {
            newMsgs.push(errorMsg);
          }
          return newMsgs;
        });
        // A failed stream still gets a truthful last line: where it stopped and why.
        tracker = failReasoning(tracker, Date.now(), error?.message || "unable to connect to backend service");
        setPhase(tracker.phase);
        attachReasoning(tracker);
      } finally {
        isStreamingRef.current = false;
        setIsLoading(false);
      }
    },
    [sessionId, attachReasoning]
  );

  const clear = useCallback(() => {
    setMessages([]);
    setSessionId(undefined);
    setPhase("idle");
    localStorage.removeItem("chat_messages");
    localStorage.removeItem("chat_session");
  }, []);

  return { messages, isLoading, isWaking, isThinking, phase, send, clear, sessionId, loadSession };
}
