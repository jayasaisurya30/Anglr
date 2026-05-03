import Link from "next/link";
import { Logo } from "@/components/common/logo";
import { FadeIn, smoothEase } from "@/components/common/motion";
import { OceanBackground } from "@/components/landing/ocean-background";
import { VignetteOverlay } from "@/components/landing/vignette-overlay";

/**
 * Premium auth surface — same cinematic ocean backdrop as the landing,
 * with a slightly stronger scrim so form text stays crisp.
 *
 * Note: a `<link rel="preload" as="video">` is emitted into the initial
 * HTML so playback starts the moment the document streams to the browser,
 * even on a hard refresh of /signup or /login.
 */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-[#020611] text-foreground">
      {/* Hoisted into <head> by React — kicks off the video fetch ASAP. */}
      <link
        rel="preload"
        as="video"
        href="/landing/ocean.mp4"
        type="video/mp4"
      />
      <link rel="preload" as="image" href="/landing/ocean.jpg" />

      <OceanBackground parallax={false} />
      <VignetteOverlay />

      {/* Extra readability scrim — auth forms need a touch more contrast than the hero */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 55%, rgba(2,6,17,0.55) 0%, rgba(2,6,17,0.25) 55%, rgba(2,6,17,0) 80%)",
        }}
        aria-hidden
      />

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="px-8 py-6">
          <Link href="/" className="inline-flex">
            <Logo />
          </Link>
        </header>

        <main className="flex-1 flex items-center justify-center px-6 pb-20">
          <FadeIn
            className="w-full max-w-md"
            y={20}
            delay={0.12}
            duration={0.82}
            ease={smoothEase}
            scale={0.986}
          >
            <div className="glass-strong rounded-3xl p-8 shadow-panel">
              <div className="mb-6">
                <h1 className="text-2xl font-semibold tracking-tight font-display">
                  {title}
                </h1>
                {subtitle ? (
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    {subtitle}
                  </p>
                ) : null}
              </div>
              {children}
            </div>
            {footer ? (
              <div className="mt-6 text-center text-sm text-muted-foreground">
                {footer}
              </div>
            ) : null}
          </FadeIn>
        </main>
      </div>
    </div>
  );
}
