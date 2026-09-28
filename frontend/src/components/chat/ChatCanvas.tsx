"use client";

import { useRef, useEffect } from "react";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { Message } from "@/lib/types";

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
}

export function ChatCanvas({ messages, isLoading = false, isThinking = false }: ChatCanvasProps) {
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
        return (
          <MessageBubble
            key={i}
            live={isLoading && i === messages.length - 1}
            message={msg}
          />
        );
      })}

      {isThinking && <TypingIndicator record={pendingTrace} />}

      <div ref={bottomRef} />
    </div>
  );
}
