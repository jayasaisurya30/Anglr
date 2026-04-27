"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useUser } from "@/hooks/use-user";

const ease = [0.2, 0.8, 0.2, 1] as const;

export function Hero() {
  const { user, loading } = useUser();

  return (
    <section className="relative flex min-h-[100svh] flex-col justify-center px-6 pt-28 pb-20 sm:pt-32">
      <div className="relative z-10 mx-auto w-full max-w-6xl">
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease }}
            className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-foreground/85 backdrop-blur-md shadow-[0_0_24px_-8px_rgba(127,196,255,0.45)]"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inset-0 rounded-full bg-anglr-blue opacity-60 animate-ping" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-anglr-blue" />
            </span>
            Now in private beta
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.08, ease }}
            className="hero-headline-glow mt-8 font-display font-semibold leading-[1.08] tracking-[-0.04em] text-balance text-[clamp(2.6rem,7vw,6.25rem)]"
          >
            <span
              className="block bg-clip-text pb-[0.08em] text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(180deg,#ffffff 0%,#cfe1ff 55%,#7fb6ec 100%)",
              }}
            >
              Track every catch.
            </span>
            <span
              className="block bg-clip-text pb-[0.08em] text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(180deg,#ffffff 0%,#cfe1ff 55%,#7fb6ec 100%)",
              }}
            >
              Remember every spot.
            </span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.22, ease }}
            className="mt-12 flex min-h-[3rem] flex-wrap items-center justify-center gap-3.5"
          >
            {loading ? (
              <div
                className="h-[3.25rem] w-[min(100%,22rem)] rounded-full bg-white/[0.05] animate-pulse"
                aria-hidden
              />
            ) : user ? (
              <PremiumEnterCta href="/map" />
            ) : (
              <>
                <PremiumSignUpCta href="/signup" />
                <PremiumLogInCta href="/login" />
              </>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

const premiumCtaMotion =
  "outline-none ring-offset-2 ring-offset-[#020611] transition-[transform,box-shadow,border-color,filter] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:hover:scale-[1.04] motion-safe:hover:-translate-y-px motion-safe:active:scale-[0.985] motion-safe:active:translate-y-0 focus-visible:ring-2 focus-visible:ring-anglr-blue/70";

/** Sign up — same premium stack as Enter ANGLR, slightly brighter gradient. */
function PremiumSignUpCta({ href }: { href: string }) {
  return (
    <Link
      href={href}
      aria-label="Sign up for ANGLR"
      className={`cta-hero-signup group relative inline-flex h-[3.25rem] items-center justify-center gap-2.5 overflow-hidden rounded-full px-8 text-[0.9375rem] font-semibold tracking-[0.04em] text-[#f4f9ff] no-underline ${premiumCtaMotion}`}
    >
      <span className="cta-hero-signup__bloom" aria-hidden />
      <span className="cta-hero-signup__base" aria-hidden />
      <span className="cta-hero-signup__glass" aria-hidden />
      <span className="cta-hero-signup__shine-edge" aria-hidden />
      <span className="cta-hero-signup__shimmer" aria-hidden />
      <span className="relative z-10 inline-flex items-center gap-2.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]">
        Sign Up
        <ArrowUpRight
          className="size-[1.05rem] shrink-0 opacity-95 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:group-hover:translate-x-1 motion-safe:group-hover:-translate-y-0.5"
          strokeWidth={2.35}
          aria-hidden
        />
      </span>
    </Link>
  );
}

/** Log in — glass pill, cool border glow, subtle shimmer. */
function PremiumLogInCta({ href }: { href: string }) {
  return (
    <Link
      href={href}
      aria-label="Log in to ANGLR"
      className={`cta-hero-login group relative inline-flex h-[3.25rem] items-center justify-center gap-2.5 overflow-hidden rounded-full px-8 text-[0.9375rem] font-semibold tracking-[0.04em] text-[#e8f2fc] no-underline ${premiumCtaMotion}`}
    >
      <span className="cta-hero-login__bloom" aria-hidden />
      <span className="cta-hero-login__base" aria-hidden />
      <span className="cta-hero-login__glass" aria-hidden />
      <span className="cta-hero-login__shine-edge" aria-hidden />
      <span className="cta-hero-login__shimmer" aria-hidden />
      <span className="relative z-10 inline-flex items-center gap-2.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]">
        Log In
        <ArrowRight
          className="size-[1.05rem] shrink-0 opacity-90 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:group-hover:translate-x-1.5"
          strokeWidth={2.35}
          aria-hidden
        />
      </span>
    </Link>
  );
}

/** Logged-in hero CTA: frosted glass (matches Log In). */
function PremiumEnterCta({ href }: { href: string }) {
  return (
    <Link
      href={href}
      aria-label="Enter ANGLR — open dashboard"
      className={`cta-enter-anglr group relative inline-flex h-[3.25rem] items-center justify-center gap-2.5 overflow-hidden rounded-full px-8 text-[0.9375rem] font-semibold tracking-[0.04em] text-[#e8f2fc] no-underline ${premiumCtaMotion}`}
    >
      <span className="cta-enter-anglr__bloom" aria-hidden />
      <span className="cta-enter-anglr__base" aria-hidden />
      <span className="cta-enter-anglr__glass" aria-hidden />
      <span className="cta-enter-anglr__shine-edge" aria-hidden />
      <span className="cta-enter-anglr__shimmer" aria-hidden />
      <span className="relative z-10 inline-flex items-center gap-2.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]">
        Enter ANGLR
        <ArrowRight
          className="size-[1.05rem] shrink-0 opacity-95 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:group-hover:translate-x-1.5"
          strokeWidth={2.35}
          aria-hidden
        />
      </span>
    </Link>
  );
}

