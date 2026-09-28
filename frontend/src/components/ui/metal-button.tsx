/**
 * Spectrum UI — MetalButton
 *
 * A rectangular button framed by a real-time liquid-metal ring. The ring is painted by
 * `metal-fx` (Jakub Antalík, MIT, https://metal.jakubantalik.com): one shared WebGL shader drives
 * every instance on the page, pauses offscreen and renders a plain fallback where WebGL2 is
 * unavailable. This wrapper adds the button surface, sizes, and class-based dark/light detection so
 * the ring matches a shadcn-style `.dark` theme instead of only the OS preference.
 *
 * Deliberate deviations from the vendor snippet, all driven by portal requirements:
 *  - `rounded-md` rectangle instead of a pill. `MetalFx` derives the ring silhouette from the
 *    child's computed `border-radius`, and `borderRadius` pins it explicitly so a CSS reset can
 *    never round the ring back.
 *  - `href` renders the same surface as a real anchor (Next `Link`), so navigation CTAs keep
 *    middle-click / ⌘-click / open-in-new-tab and a crawlable href.
 *  - `metal-fx` normalises the host (`background/border/outline/box-shadow` become `!important`
 *    transparent) once the ring paints. The surface classes below are therefore also the
 *    *fallback* appearance for browsers without WebGL2, where that normalisation does not apply.
 *  - brand semantic tokens instead of `neutral-*`; no `dark:` text colour, because this portal has
 *    no `.dark` class strategy — `dark:` resolves to `prefers-color-scheme` and would paint a white
 *    label on the white header.
 *  - the ring is mounted only after hydration. `MetalFx` picks between its WebGL root and its plain
 *    fallback from `isMetalFxSupported()` *during render*, which reports `false` on the server, so
 *    rendering it directly produces two different trees and a hydration error that discards the
 *    server HTML for the nav CTA. The pre-mount render uses the same markup on both sides.
 *
 * Dependencies: metal-fx, @/lib/utils, @/components/ui/metal-button-utils/use-surface-theme
 *
 * @example
 * <MetalButton preset="gold" href="/wizard">Get Registered</MetalButton>
 */

"use client";

import * as React from "react";
import Link from "next/link";
import { MetalFx, type MetalFxPreset } from "metal-fx";

import { cn } from "@/lib/utils";
import {
  useSurfaceTheme,
  type SurfaceTheme,
} from "@/components/ui/metal-button-utils/use-surface-theme";

// Snapshot trio for "has the client taken over yet?". `useSyncExternalStore` answers it without an
// effect: `false` through SSR and hydration, `true` on every client render after.
const subscribeNothing = () => () => {};
const isClient = () => true;
const isServer = () => false;

function useHydrated() {
  return React.useSyncExternalStore(subscribeNothing, isClient, isServer);
}

type MetalButtonSize = "sm" | "md" | "lg";

/** Surface options shared by both render modes. */
interface MetalButtonBaseProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "className"> {
  /** Metal palette. Default "chromatic" */
  preset?: MetalFxPreset;
  /** "auto" follows a `.dark`/`.light` class on <html>, then the OS. Default "auto" */
  theme?: SurfaceTheme;
  /** Ring intensity 0–1. Default 1 */
  strength?: number;
  /** Button height and type size. Default "md" */
  size?: MetalButtonSize;
  /** Freeze the shader on its current frame */
  paused?: boolean;
  /** Classes for the inner button or link */
  className?: string;
  /** Classes for the MetalFx wrapper */
  wrapperClassName?: string;
}

/**
 * Defaults to the vendor contract — a real `<button>`. Passing `href` renders the same surface as a
 * Next `Link`; `type`/`disabled` are then ignored, and attributes are typed at the `HTMLElement`
 * level so they stay assignable to either element.
 */
export interface MetalButtonProps extends MetalButtonBaseProps {
  /** Renders the surface as a Next `<Link>` instead of a `<button>` */
  href?: string;
  target?: React.HTMLAttributeAnchorTarget;
  rel?: string;
  type?: "submit" | "reset" | "button";
  disabled?: boolean;
}

const SIZE = {
  sm: "h-9 px-4 text-[13px]",
  md: "h-11 px-5 text-[15px]",
  lg: "h-13 px-7 text-base",
} as const;

/** `rounded-md` in px, handed to the shader so the ring matches the rectangle. */
const RADIUS_PX = 6;

export function MetalButton({
  preset = "chromatic",
  theme = "auto",
  strength = 1,
  size = "md",
  paused = false,
  href,
  target,
  rel,
  type = "button",
  disabled,
  className,
  wrapperClassName,
  children,
  ...attrs
}: MetalButtonProps) {
  const resolved = useSurfaceTheme(theme);
  const hydrated = useHydrated();

  // metal-fx paints the ring on top and zeroes the host's own border/background while it runs, so
  // these classes carry the label plus the whole surface on browsers without WebGL2, where the
  // normalisation above never applies and the ring falls back to the plain child.
  const surface = cn(
    "inline-flex items-center justify-center gap-1.5 rounded-md border border-portal-border bg-muted/60 font-medium tracking-[-0.01em] text-gov-blue transition-[transform,background-color] duration-200 ease-out",
    "hover:bg-accent active:scale-[0.97]",
    "focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-60",
    SIZE[size],
    className,
  );

  const wrapperClass = cn(
    "inline-flex rounded-md",
    // The host outline is zeroed by metal-fx, so keyboard focus is drawn on the wrapper instead;
    // the engine pins this radius, so the outline tracks the rectangle.
    "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring",
    wrapperClassName,
  );

  const child = href ? (
    <Link
      href={href}
      target={target}
      rel={rel}
      className={cn(surface, "no-underline")}
      {...attrs}
    >
      {children}
    </Link>
  ) : (
    <button type={type} disabled={disabled} className={surface} {...attrs}>
      {children}
    </button>
  );

  // No shader can run before the client takes over, so the CTA ships as its plain surface —
  // identical markup on both sides, which is what keeps hydration intact.
  if (!hydrated) {
    return <span className={wrapperClass}>{child}</span>;
  }

  return (
    <MetalFx
      variant="button"
      preset={preset}
      theme={resolved}
      strength={strength}
      paused={paused}
      borderRadius={RADIUS_PX}
      className={wrapperClass}
    >
      {child}
    </MetalFx>
  );
}

export default MetalButton;
