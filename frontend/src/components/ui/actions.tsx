"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * The row of controls under an assistant turn.
 *
 * Provides the tooltip context itself rather than expecting the app shell to:
 * this project has no root `TooltipProvider`, and an action row whose labels
 * silently disappear because someone mounted it on a page without a provider is
 * a worse failure than one extra context object per transcript.
 */
function Actions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <TooltipProvider delayDuration={200}>
      <div
        aria-label="Message actions"
        data-slot="actions"
        role="toolbar"
        className={cn("flex items-center gap-0.5", className)}
        {...props}
      />
    </TooltipProvider>
  );
}

/**
 * One labelled control.
 *
 * `label` drives three things at once — the tooltip, the accessible name, and the
 * state a screen reader announces — so an icon-only button is never a guessing
 * game. Toggle behaviour is the caller's: pass `aria-pressed` and `data-active`
 * (the visual selected state) together, which is what makes a "like" you can undo
 * read as a switch rather than a fire-and-forget button.
 */
function Action({
  className,
  label,
  children,
  ...props
}: React.ComponentProps<"button"> & { label: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          aria-label={label}
          className={cn(
            "inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md",
            "border border-transparent text-muted-foreground",
            "transition-[background-color,border-color,color,transform] duration-150",
            "hover:bg-accent hover:text-foreground active:scale-[0.94]",
            "focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
            "disabled:pointer-events-none disabled:opacity-50",
            "data-[active=true]:border-border data-[active=true]:bg-accent data-[active=true]:text-foreground",
            "[&>svg]:size-4 [&>svg]:shrink-0",
            className,
          )}
          data-slot="action"
          type="button"
          {...props}
        >
          {children}
          <span className="sr-only">{label}</span>
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom">{label}</TooltipContent>
    </Tooltip>
  );
}

export { Action, Actions };
