"use client";

import { useEffect, useRef, useState } from "react";
import {
  CheckIcon,
  CopyIcon,
  LinkIcon,
  RefreshCcwIcon,
  ShareIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from "lucide-react";

import { Action, Actions } from "@/components/ui/actions";
import {
  copyLabelFor,
  ratingLabelFor,
  ratingLocked,
  shareLabelFor,
  threadLink,
  type ActionFeedback,
  type Rating,
} from "@/lib/chat";
import { submitFeedback } from "@/lib/api";

export interface MessageActionsProps {
  /**
   * The answer exactly as it was produced. Copied verbatim — a legal answer's
   * markdown emphasis and citation markers are part of the record, so stripping
   * them into "clean" text would hand the user a different document than the one
   * the model stood behind.
   */
  content: string;
  /** Key the rating is filed against in the backend audit store. */
  messageId: string;
  /** Re-run the question that produced this answer. Hidden when unavailable. */
  onRetry?: () => void;
  /**
   * A request is in flight. Retry and copy lock while one is running: the stream
   * writes to the last turn, so starting a second would corrupt the first.
   */
  disabled?: boolean;
}

/** How long a "copied" mark stays before the button returns to its resting icon. */
const CONFIRM_MS = 1600;

/**
 * The row under a finished answer: ask it again, take it away, send it on, and
 * tell us whether it worked.
 *
 * Every control here does something the product can already honour — a retry
 * re-runs the original question, a rating reaches `/api/feedback`, a copy writes
 * the answer as it was produced. The labels come from `lib/chat`, and a control
 * with nothing to do (retry with no question above it) is not rendered at all.
 */
export function MessageActions({
  content,
  messageId,
  onRetry,
  disabled = false,
}: MessageActionsProps) {
  const [rating, setRating] = useState<Rating>(null);
  const [copy, setCopy] = useState<ActionFeedback>("idle");
  const [share, setShare] = useState<ActionFeedback>("idle");
  const timers = useRef<number[]>([]);

  // The confirmations are transient, so their clocks must die with the row: a
  // bubble unmounted mid-timeout would otherwise call setState on nothing.
  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const flash = (setter: (value: ActionFeedback) => void, value: ActionFeedback) => {
    setter(value);
    timers.current.push(window.setTimeout(() => setter("idle"), CONFIRM_MS));
  };

  const writeClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Clipboard access is refused outright outside a secure context or when the
      // browser withholds focus. A textarea copy is the fallback that still works
      // on a plain http:// host, which the dev server is.
      try {
        const box = document.createElement("textarea");
        box.value = text;
        box.setAttribute("readonly", "");
        box.style.position = "fixed";
        box.style.opacity = "0";
        document.body.appendChild(box);
        box.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(box);
        return ok;
      } catch {
        return false;
      }
    }
  };

  const handleCopy = async () => {
    // A success is allowed to fade — the clipboard already holds the text. A
    // failure stays until the next attempt: an error that dismisses itself looks
    // exactly like a copy that worked.
    if (await writeClipboard(content)) flash(setCopy, "done");
    else setCopy("failed");
  };

  const handleShare = async () => {
    const link = threadLink(window.location.href, localStorage.getItem("chat_session"));
    if (!link) {
      setShare("failed");
      return;
    }
    if (navigator.share) {
      try {
        await navigator.share({ title: "IP-SAKTI Sahayak", url: link });
        return;
      } catch {
        // The user opened the sheet and closed it. That is a decision, not a fault.
        return;
      }
    }
    if (await writeClipboard(link)) flash(setShare, "done");
    else setShare("failed");
  };

  const rate = async (value: "helpful" | "not_helpful") => {
    if (rating || disabled) return;
    setRating(value);
    try {
      await submitFeedback(messageId, value);
    } catch (err) {
      // A rating that never reached the audit store was never recorded, so the
      // control must not keep its selected look.
      console.error("Feedback submission failed:", err);
      setRating(null);
    }
  };

  const copyLabel = copyLabelFor(copy);
  const shareLabel = shareLabelFor(share);
  // Once one thumb is recorded the other stops being an offer: the audit store
  // holds a rating for this turn, and a second click would contradict it.
  const locked = ratingLocked(rating);

  return (
    <div className="flex items-center gap-2">
      <Actions>
        {onRetry && (
          <Action disabled={disabled} label="Retry — ask this again" onClick={onRetry}>
            <RefreshCcwIcon />
          </Action>
        )}
        <Action
          data-active={copy === "done"}
          disabled={disabled}
          label={copyLabel}
          onClick={handleCopy}
        >
          {copy === "done" ? <CheckIcon /> : <CopyIcon />}
        </Action>
        <Action
          data-active={rating === "helpful"}
          disabled={disabled || locked}
          label={ratingLabelFor(rating, "helpful")}
          onClick={() => rate("helpful")}
        >
          <ThumbsUpIcon />
        </Action>
        <Action
          data-active={rating === "not_helpful"}
          disabled={disabled || locked}
          label={ratingLabelFor(rating, "not_helpful")}
          onClick={() => rate("not_helpful")}
        >
          <ThumbsDownIcon />
        </Action>
        <Action
          data-active={share === "done"}
          disabled={disabled}
          label={shareLabel}
          onClick={handleShare}
        >
          {share === "done" ? <LinkIcon /> : <ShareIcon />}
        </Action>
      </Actions>
      {/* Outside the toolbar on purpose: a `role="toolbar"` is a list of controls,
          and this is a status, not something to operate. */}
      {rating && (
        <span
          className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground"
          data-slot="message-actions-recorded"
        >
          recorded
        </span>
      )}
    </div>
  );
}
