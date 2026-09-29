"use client";

import { useRef, useEffect } from "react";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { Message } from "@/lib/types";
import { userQueryFor } from "@/lib/chat";

interface ChatCanvasProps {
  messages: Message[];
  /** A request is in flight; marks the bubble that is currently streaming. */
  isLoading?: boolean;
  /**
   * No content token has arrived yet. This is the only window in which the
   * thinking state may be visible — the answer's own bubble takes over the
   * moment it flips false, and carries the reasoning trace from then on.
   */
  isThinking?: boolean;
  /**
   * Re-run a question from the transcript, fired by an answer's Retry action.
   * Absent on canvases with no way to ask again (a read-only review, for
   * instance), and the control is not rendered at all.
   */
  onRetry?: (query: string) => void;
}

export function ChatCanvas({
  messages,
  isLoading = false,
  isThinking = false,
  onRetry,
}: ChatCanvasProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, isThinking]);

  const lastMessage = messages[messages.length - 1];
  const pendingTrace = isThinking ? lastMessage?.reasoning : undefined;

  return (
    <div
      className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 py-6 w-full max-w-4xl xl:max-w-5xl 2xl:max-w-6xl mx-auto"
    >
      {messages.map((msg, i) => {
        // An assistant turn with no text has nothing to frame: the waiting state
        // is carried by the trace below, and a settled-but-empty bubble (an
        // interrupted or duplicated send) would otherwise render as a blank card.
        if (msg.role === "assistant" && !msg.content) {
          return null;
        }
        // Retry belongs to an answer, and only to one whose question is still in
        // the transcript — a user turn has nothing above it to replay.
        const question = msg.role === "assistant" ? userQueryFor(messages, i) : undefined;
        return (
          <MessageBubble
            busy={isLoading}
            key={i}
            live={isLoading && i === messages.length - 1}
            message={msg}
            onRetry={onRetry && question ? () => onRetry(question) : undefined}
          />
        );
      })}

      {isThinking && <TypingIndicator record={pendingTrace} />}

      <div ref={bottomRef} />
    </div>
  );
}
