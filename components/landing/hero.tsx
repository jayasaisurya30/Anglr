"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";

export function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col justify-center pt-28 pb-16 sm:pt-32 sm:pb-20 overflow-hidden">
      <div className="absolute inset-0 bg-water-grid" />
      <div className="absolute inset-0 bg-grid-fade" />
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-[520px] w-[820px] rounded-full bg-anglr-blue/10 blur-[140px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-muted-foreground"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-anglr-blue animate-pulseGlow" />
            Now in private beta
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05, ease: [0.2, 0.8, 0.2, 1] }}
            className="mt-6 text-5xl sm:text-6xl md:text-7xl font-semibold tracking-[-0.03em] font-display text-balance gradient-text"
          >
            Track every catch.
            <br />
            Remember every spot.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.2, 0.8, 0.2, 1] }}
            className="mt-5 max-w-xl text-base md:text-lg text-muted-foreground"
          >
            ANGLR is the premium tracker for anglers who love the craft. Log
            catches on a live map, review your stats, and share your best days
            with friends.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.2, 0.8, 0.2, 1] }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <Button asChild size="lg" variant="primary">
              <Link href="/signup">
                Sign up
                <ArrowUpRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/login">Log in</Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
