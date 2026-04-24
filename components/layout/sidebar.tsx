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
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Logo } from "@/components/common/logo";
import { motion } from "framer-motion";

const NAV = [
  { href: "/map", label: "Map", icon: MapIcon },
  { href: "/catches", label: "My Catches", icon: Fish },
  { href: "/stats", label: "Stats", icon: BarChart3 },
  { href: "/friends", label: "Friends", icon: Users },
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
                "relative group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                active
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/[0.03]"
              )}
            >
              {active ? (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-xl bg-white/[0.06] border border-white/10"
                  transition={{ type: "spring", stiffness: 400, damping: 40 }}
                />
              ) : null}
              <item.icon className="relative z-10 h-4 w-4" />
              <span className="relative z-10">{item.label}</span>
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
