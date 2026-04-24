"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "@/components/common/logo";
import { cn } from "@/lib/utils/cn";

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-[background,border-color,backdrop-filter] duration-300",
        scrolled
          ? "border-b border-white/[0.08] bg-anglr-ink/70 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <div className="relative mx-auto max-w-7xl px-6 h-16 flex items-center">
        <Link href="/" className="relative z-10">
          <Logo />
        </Link>
        <nav
          className={cn(
            "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
            "hidden md:flex items-center gap-8 text-sm text-muted-foreground"
          )}
        >
          <Link href="/public/feed" className="hover:text-foreground transition">
            Feed
          </Link>
          <Link href="/public/map" className="hover:text-foreground transition">
            Map
          </Link>
        </nav>
      </div>
    </header>
  );
}
