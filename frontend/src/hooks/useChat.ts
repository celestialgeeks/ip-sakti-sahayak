"use client";

import { useState, useCallback, useEffect } from "react";
import { Message, Jurisdiction, ChatResponse } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Hook for managing chat state, API communication, and Supabase session persistence.
 */
export function useChat(initialSessionId?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isWaking, setIsWaking] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>(initialSessionId);

  // Load session messages either from Supabase (if authenticated) or localStorage
  const loadSession = useCallback(async (targetSessionId: string) => {
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
      loadSession(initialSessionId);
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
      const userMessage: Message = { role: "user", content: query };
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setIsWaking(false);

      // Add a temporary empty assistant message to stream into
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      const timeoutId = setTimeout(() => {
        setIsWaking(true);
      }, 25000);

      // Generate or retrieve session ID
      const activeSessionId = sessionId || (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `session_${Date.now()}`);
      if (!sessionId) {
        setSessionId(activeSessionId);
        localStorage.setItem("chat_session", activeSessionId);
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

      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;

        // Persist session & user message to Supabase if authenticated
        if (user) {
          try {
            await supabase.from("chat_sessions").upsert({
              id: activeSessionId,
              user_id: user.id,
              title: query.length > 55 ? query.slice(0, 52) + "..." : query,
            });

            await supabase.from("chat_messages").insert({
              session_id: activeSessionId,
              role: "user",
              content: query,
            });

            // Notify Sidebar to refresh list
            window.dispatchEvent(new Event("sessions_updated"));
          } catch (dbErr) {
            console.warn("Supabase direct insert error (offline or RLS):", dbErr);
          }
        }

        const headers: Record<string, string> = { 
          "Content-Type": "application/json" 
        };
        
        if (session?.access_token) {
          headers["Authorization"] = `Bearer ${session.access_token}`;
        }

        const res = await fetch(`${API_URL}/api/chat`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            query,
            jurisdiction,
            language: localStorage.getItem("app_language") || "en",
            session_id: activeSessionId,
            stream: true,
          }),
        });

        clearTimeout(timeoutId);
        setIsWaking(false);

        if (!res.ok) {
          throw new Error(`Chat API error: ${res.status}`);
        }

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
                    // Sanitize any residual thinking process on the client
                    let displayContent = currentContent;
                    if (displayContent.includes("Here's a thinking process:") || displayContent.includes("<think>")) {
                      displayContent = displayContent
                        .replace(/<think>[\s\S]*?<\/think>/gi, "")
                        .replace(/^Here's a thinking process:[\s\S]*?(?=\n\n(?:###|[A-Z]|\d+\.\s+\*\*)|$)/i, "")
                        .replace(/^\s*1\.\s+\*\*Analyze User Request:\*\*[\s\S]*?(?=\n\n(?:###|[A-Z])|$)/i, "")
                        .trimStart();
                    }

                    // Update the last message in state
                    setMessages((prev) => {
                      const newMsgs = [...prev];
                      newMsgs[newMsgs.length - 1] = {
                        ...newMsgs[newMsgs.length - 1],
                        content: displayContent,
                      };
                      return newMsgs;
                    });
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
                      newMsgs[newMsgs.length - 1] = {
                        ...newMsgs[newMsgs.length - 1],
                        citations: parsed.metadata.citations,
                        confidence: parsed.metadata.confidence,
                        confidenceLevel: parsed.metadata.confidence_level,
                        statutoryAlert: parsed.metadata.statutory_alert,
                      };
                      return newMsgs;
                    });
                  }
                } catch (e) {
                  // Incomplete chunk, ignore
                }
              }
            }
          }
        }

        // Persist assistant response to Supabase after stream completes
        if (user && currentContent) {
          try {
            await supabase.from("chat_messages").insert({
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

      } catch (error) {
        clearTimeout(timeoutId);
        setIsWaking(false);
        setMessages((prev) => {
          const newMsgs = [...prev];
          newMsgs[newMsgs.length - 1] = {
            role: "assistant",
            content: "I apologize, but I'm unable to process your query at the moment. Please ensure the backend service is running and try again.",
            confidenceLevel: "low",
          };
          return newMsgs;
        });
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId]
  );

  const clear = useCallback(() => {
    setMessages([]);
    setSessionId(undefined);
    localStorage.removeItem("chat_messages");
    localStorage.removeItem("chat_session");
  }, []);

  return { messages, isLoading, isWaking, send, clear, sessionId, loadSession };
}
