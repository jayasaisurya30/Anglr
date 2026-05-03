"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { useLaunchTransition } from "@/components/common/launch-transition";
import { FishMarquee } from "@/components/landing/fish-marquee";

export function Hero() {
  const { user, loading } = useUser();

  return (
    <section className="relative flex min-h-[100svh] flex-col justify-center px-6 pt-28 pb-20 sm:pt-32">
      <div className="relative z-10 mx-auto w-full max-w-6xl">
        <div className="flex flex-col items-center text-center">
          <div
            className="landing-hero-badge inline-flex max-w-[min(92vw,28rem)] items-center rounded-full border border-white/12 bg-white/[0.04] px-3.5 py-1.5 text-foreground/85 backdrop-blur-sm shadow-[0_0_24px_-8px_rgba(127,196,255,0.45)]"
          >
            <span className="sr-only">
              The word fish in many languages, scrolling
            </span>
            <FishMarquee />
          </div>

          <h1
            className="landing-hero-title hero-headline-glow mt-8 font-display font-semibold leading-[1.08] tracking-[-0.04em] text-balance text-[clamp(2.6rem,7vw,6.25rem)]"
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
          </h1>

          <div
            className="landing-hero-ctas mt-12 flex min-h-[3rem] flex-wrap items-center justify-center gap-3.5"
          >
            {loading ? (
              <div
                className="h-[3.25rem] w-[min(100%,22rem)] rounded-full bg-white/[0.05] animate-pulse"
                aria-hidden
              />
            ) : user ? (
              <PremiumEnterCta href="/catches" />
            ) : (
              <>
                <PremiumSignUpCta href="/signup" />
                <PremiumLogInCta href="/login" />
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

const premiumCtaMotion =
  "outline-none ring-offset-2 ring-offset-[#020611] transition-[transform,box-shadow,border-color] duration-500 ease-smooth-out motion-safe:hover:scale-[1.04] motion-safe:hover:-translate-y-px motion-safe:active:scale-[0.985] motion-safe:active:translate-y-0 focus-visible:ring-2 focus-visible:ring-anglr-blue/70";

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
          className="size-[1.05rem] shrink-0 opacity-95 transition-transform duration-500 ease-smooth-out motion-safe:group-hover:translate-x-1 motion-safe:group-hover:-translate-y-0.5"
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
          className="size-[1.05rem] shrink-0 opacity-90 transition-transform duration-500 ease-smooth-out motion-safe:group-hover:translate-x-1.5"
          strokeWidth={2.35}
          aria-hidden
        />
      </span>
    </Link>
  );
}

/** Logged-in hero CTA: frosted glass (matches Log In). */
function PremiumEnterCta({ href }: { href: string }) {
  const launch = useLaunchTransition();

  return (
    <Link
      href={href}
      onClick={(e) => {
        // Allow modifier-clicks (open in new tab, etc.) to bypass the transition.
        if (
          e.metaKey ||
          e.ctrlKey ||
          e.shiftKey ||
          e.altKey ||
          e.button !== 0
        ) {
          return;
        }
        e.preventDefault();
        launch(href);
      }}
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
          className="size-[1.05rem] shrink-0 opacity-95 transition-transform duration-500 ease-smooth-out motion-safe:group-hover:translate-x-1.5"
          strokeWidth={2.35}
          aria-hidden
        />
      </span>
    </Link>
  );
}

