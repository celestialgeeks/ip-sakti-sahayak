/**
 * Resolve the surface theme a metal effect should paint against.
 *
 * `metal-fx` only knows the OS preference. The portal (and shadcn-style apps in
 * general) drive their theme with a `dark` / `light` class on <html>, so this
 * hook reads that class first and only then falls back to
 * `prefers-color-scheme`. The resolved value is fed straight into the `theme`
 * prop of `MetalFx`, which accepts `"dark" | "light"` only.
 *
 * SSR note: the server snapshot is the vendor's own fallback (`dark` for
 * `"auto"`), so server HTML and hydration markup agree; React re-reads the real
 * value from the client snapshot after mount.
 */
"use client";

import { useCallback, useSyncExternalStore } from "react";

/** `"auto"` = follow a `.dark`/`.light` class on <html>, then the OS. */
export type SurfaceTheme = "auto" | "dark" | "light";

/** The two modes `MetalFx` can actually paint. */
export type ResolvedSurfaceTheme = "dark" | "light";

function resolve(theme: SurfaceTheme): ResolvedSurfaceTheme {
  if (theme !== "auto") return theme;
  // Server fallback, mirrored by `getServerSnapshot` below.
  if (typeof document === "undefined" || typeof window === "undefined") {
    return "dark";
  }
  const root = document.documentElement;
  if (root.classList.contains("dark")) return "dark";
  if (root.classList.contains("light")) return "light";
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

/**
 * Everything that can flip the surface: the OS media query, and a theme switch
 * performed by an app-level toggle (next-themes,
 * `documentElement.classList.add("dark")`) that the OS never learns about.
 */
function subscribeToSurface(theme: SurfaceTheme, onChange: () => void) {
  if (theme !== "auto" || typeof window === "undefined") return () => {};

  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  media.addEventListener("change", onChange);

  return () => {
    observer.disconnect();
    media.removeEventListener("change", onChange);
  };
}

export function useSurfaceTheme(
  theme: SurfaceTheme = "auto",
): ResolvedSurfaceTheme {
  const subscribe = useCallback(
    (onChange: () => void) => subscribeToSurface(theme, onChange),
    [theme],
  );
  const getSnapshot = useCallback(
    () => resolve(theme),
    // Re-read whenever the requested mode changes; DOM/media changes come via `subscribe`.
    [theme],
  );
  const getServerSnapshot = useCallback(
    () => (theme === "auto" ? "dark" : theme),
    [theme],
  );

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
