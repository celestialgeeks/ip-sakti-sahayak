"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export type MessageFrom = "user" | "assistant";

/**
 * One turn of a conversation.
 *
 * `from` is a prop, not a class: alignment, bubble shape, and the side the avatar
 * sits on all follow from who spoke, and the caller should not have to restate
 * that styling on every message. It is stripped before spreading so it never
 * reaches the DOM as an unknown attribute.
 */
function Message({
  className,
  from = "assistant",
  ...props
}: React.ComponentProps<"div"> & { from?: MessageFrom }) {
  return (
    <div
      data-from={from}
      data-slot="message"
      className={cn(
        "flex w-full flex-col gap-2",
        from === "user" ? "items-end" : "items-start",
        className,
      )}
      {...props}
    />
  );
}

/**
 * The spoken text of a turn.
 *
 * Assistant turns are wide and left-aligned because a legal answer is read, not
 * glanced at; user turns stay narrow so a question is recognisable at a scroll.
 */
function MessageContent({
  className,
  from = "assistant",
  ...props
}: React.ComponentProps<"div"> & { from?: MessageFrom }) {
  return (
    <div
      data-from={from}
      data-slot="message-content"
      className={cn(
        "max-w-full break-words rounded-xl px-4 py-3 text-sm leading-relaxed",
        from === "user"
          ? "bg-primary text-primary-foreground"
          : "border border-border bg-card text-foreground",
        className,
      )}
      {...props}
    />
  );
}

/** The speaker's mark, sitting on the leading edge of the turn. */
function MessageAvatar({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="message-avatar"
      className={cn("flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full", className)}
      {...props}
    />
  );
}

export { Message, MessageAvatar, MessageContent };
