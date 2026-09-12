"use client";

import Link from "next/link";

const bottomNavItems = [
  { label: "Assistant", icon: "💬", href: "/" },
  { label: "TKDL", icon: "📖", href: "#" },
  { label: "Patents", icon: "📋", href: "#" },
  { label: "Citations", icon: "📌", href: "#" },
  { label: "Dossier", icon: "📁", href: "#" },
];

export function MobileNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 border-t flex items-center justify-around py-2 md:hidden z-50"
      style={{
        background: "var(--surface)",
        borderColor: "var(--border-hairline)",
      }}
    >
      {bottomNavItems.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className="flex flex-col items-center gap-0.5 no-underline"
        >
          <span className="text-lg">{item.icon}</span>
          <span className="label-md" style={{ color: "var(--ink-muted)" }}>
            {item.label}
          </span>
        </Link>
      ))}
    </nav>
  );
}
