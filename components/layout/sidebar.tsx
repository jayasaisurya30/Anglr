"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Map as MapIcon,
  Fish,
  BarChart3,
  Users,
  User,
  Settings,
  Newspaper,
  Globe2,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Logo } from "@/components/common/logo";
import { motion } from "framer-motion";

const NAV = [
  { href: "/catches", label: "My Catches", icon: Fish },
  { href: "/map", label: "Map", icon: MapIcon },
  { href: "/stats", label: "Stats", icon: BarChart3 },
  { href: "/friends", label: "Friends", icon: Users },
  { href: "/public/feed", label: "Feed", icon: Newspaper },
  { href: "/public/map", label: "Global map", icon: Globe2 },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-[240px] shrink-0 flex-col border-r border-white/5 bg-anglr-ink/60 backdrop-blur-2xl">
      <div className="px-6 py-5 border-b border-white/5">
        <Link href="/" className="block rounded-lg -m-1 p-1 hover:bg-white/[0.04] transition-colors">
          <Logo />
        </Link>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch
              className={cn(
                "relative group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors duration-300",
                active ? "" : "hover:bg-white/[0.035]",
              )}
            >
              {active ? (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-xl border border-white/[0.12] bg-gradient-to-b from-white/[0.09] to-white/[0.02] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]"
                  transition={{ type: "spring", stiffness: 400, damping: 40 }}
                />
              ) : null}
              <item.icon
                className={cn(
                  "relative z-10 h-4 w-4 shrink-0 transition-[color,filter] duration-300",
                  active
                    ? "text-[#f2f5fa] drop-shadow-[0_0_10px_rgba(255,255,255,0.22)]"
                    : "text-[#8b95a8] group-hover:text-[#d8dee9]",
                )}
                strokeWidth={1.65}
              />
              <span
                className={cn(
                  "relative z-10 bg-clip-text text-[13px] font-semibold tracking-wide text-transparent",
                  "bg-[linear-gradient(180deg,#ffffff_0%,#e8edf6_42%,#9ca8ba_100%)]",
                  active
                    ? "opacity-100 drop-shadow-[0_1px_12px_rgba(255,255,255,0.12)]"
                    : "opacity-[0.7] group-hover:opacity-[0.95]",
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
      <div className="px-6 py-5 border-t border-white/5 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulseGlow" />
          All systems online
        </div>
      </div>
    </aside>
  );
}
