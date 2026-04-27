"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/common/logo";

/**
 * Header for /public/feed and /public/map so signed-in users can return to the app shell (/map).
 */
export function PublicExploreHeader() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-white/[0.08] bg-anglr-ink/80 backdrop-blur-xl">
      <div className="relative mx-auto max-w-7xl px-4 h-14 flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          className="shrink-0 -ml-2 gap-1.5 text-muted-foreground hover:text-foreground"
          asChild
        >
          <Link href="/map">
            <ArrowLeft className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>
        </Button>
        <Link
          href="/"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg p-1 hover:bg-white/[0.04] transition-colors"
          aria-label="ANGLR home"
        >
          <Logo />
        </Link>
        <div className="w-[5.5rem] shrink-0 sm:w-28" aria-hidden />
      </div>
    </header>
  );
}
