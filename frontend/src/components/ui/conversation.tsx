"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Scroll rail for a message list.
 *
 * `overscroll-behavior-contain` keeps a flick at the end of the transcript from
 * chaining to the page behind it — the chat reads as its own surface, the way a
 * terminal does, instead of the whole document jumping.
 */
function Conversation({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="conversation"
      className={cn(
        "flex-1 overscroll-behavior-contain overflow-y-auto",
        className,
      )}
      {...props}
    />
  );
}

/**
 * The column of turns inside a `Conversation`.
 *
 * Announced as a live log so a streamed answer is read out by screen readers as
 * it lands, without re-announcing the turns above it.
 */
function ConversationContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      aria-live="polite"
      data-slot="conversation-content"
      role="log"
      className={cn("flex flex-col gap-5", className)}
      {...props}
    />
  );
}

/**
 * Placeholder for a transcript with nothing in it.
 *
 * Rendered by the caller rather than decided inside `Conversation`: only the page
 * knows whether an empty thread means "ask your first question" or "this session
 * has no saved messages".
 */
function ConversationEmptyState({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="conversation-empty-state"
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-12 text-center text-sm text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

export { Conversation, ConversationContent, ConversationEmptyState };
