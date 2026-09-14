"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const bottomNavItems = [
  { label: "Advisor", icon: "⚖️", href: "/chat" },
  { label: "TKDL", icon: "📖", href: "/tkdl" },
  { label: "Patents", icon: "🔬", href: "/patents" },
  { label: "Rules", icon: "📜", href: "/classify" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 border-t flex items-center justify-around py-2 md:hidden z-50 bg-slate-900 border-slate-800 text-slate-300"
    >
      {bottomNavItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.label}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 no-underline transition-colors ${
              isActive ? "text-white font-bold" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <span className="text-base">{item.icon}</span>
            <span className="text-[11px]">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
