"use client";

import { useState, useCallback } from "react";
import { Message, Jurisdiction, ChatResponse } from "@/lib/types";
import { sendChatMessage } from "@/lib/api";

/**
 * Hook for managing chat state and API communication.
 */
export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>();

  const send = useCallback(
    async (query: string, jurisdiction: Jurisdiction = "india") => {
      // Add user message
      const userMessage: Message = { role: "user", content: query };
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        const response: ChatResponse = await sendChatMessage({
          query,
          jurisdiction,
          language: "en",
          session_id: sessionId,
        });

        // Add assistant message
        const assistantMessage: Message = {
          role: "assistant",
          content: response.answer,
          citations: response.citations,
          confidence: response.confidence,
          confidenceLevel: response.confidence_level,
        };

        setMessages((prev) => [...prev, assistantMessage]);
        setSessionId(response.session_id);
      } catch (error) {
        // Add error message
        const errorMessage: Message = {
          role: "assistant",
          content:
            "I apologize, but I'm unable to process your query at the moment. Please ensure the backend service is running and try again.",
          confidenceLevel: "low",
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId]
  );

  const clear = useCallback(() => {
    setMessages([]);
    setSessionId(undefined);
  }, []);

  return { messages, isLoading, send, clear, sessionId };
}
