"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

/**
 * Premium "Enter ANGLR" → dashboard transition.
 *
 * Phases (drives `data-launch-phase` on <html> for CSS hooks):
 *   idle        → nothing on screen
 *   leaving     → hero content fades / lifts away (CSS-driven)
 *   panel       → glass panel slides up + backdrop blurs (Framer)
 *   navigating  → router.push() called; panel still covering screen
 *   entering    → dashboard mounted; panel fades out, dashboard fade-up plays
 *
 * Usage:
 *   const launch = useLaunchTransition();
 *   <button onClick={() => launch("/catches")}>Enter</button>
 *   launch("/catches", { replace: true, panelLine1: "Welcome aboard" });
 */

export type LaunchOptions = {
  /** Use after auth so “back” doesn’t return to login/signup. */
  replace?: boolean;
  /** Small caps line on the glass panel (default: “Opening dashboard”). */
  panelLine1?: string;
  /** Brand line under it (default: “ANGLR”). */
  panelLine2?: string;
};

type Phase = "idle" | "leaving" | "panel" | "navigating" | "entering";

type LaunchCtxValue = {
  launch: (href: string, options?: LaunchOptions) => void;
  isPlaying: boolean;
};

const LaunchCtx = createContext<LaunchCtxValue | null>(null);

const EASE = [0.22, 1, 0.36, 1] as const;

const LEAVE_TO_PANEL_MS = 220;
const LEAVE_TO_NAV_MS = 760;
const ENTER_TO_IDLE_MS = 700;

export function useLaunchTransition(): (
  href: string,
  options?: LaunchOptions,
) => void {
  const ctx = useContext(LaunchCtx);
  return useCallback(
    (href: string, options?: LaunchOptions) => {
      if (ctx) {
        ctx.launch(href, options);
        return;
      }
      if (typeof window !== "undefined") {
        window.location.href = href;
      }
    },
    [ctx],
  );
}

export function LaunchTransitionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();

  const [phase, setPhase] = useState<Phase>("idle");
  const [panelCopy, setPanelCopy] = useState({
    line1: "Opening dashboard",
    line2: "ANGLR",
  });
  const startedFromRef = useRef<string | null>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const pendingNavRef = useRef<LaunchOptions | undefined>(undefined);

  const clearTimers = () => {
    for (const t of timersRef.current) clearTimeout(t);
    timersRef.current = [];
  };

  // Mirror the phase to <html> so CSS can target leaving / entering states.
  useEffect(() => {
    if (typeof document === "undefined") return;
    const html = document.documentElement;
    if (phase === "idle") html.removeAttribute("data-launch-phase");
    else html.setAttribute("data-launch-phase", phase);
  }, [phase]);

  // Once the new route is mounted (pathname changed), drop into "entering".
  useEffect(() => {
    if (
      (phase === "navigating" || phase === "panel") &&
      startedFromRef.current &&
      pathname !== startedFromRef.current
    ) {
      const t = setTimeout(() => setPhase("entering"), 60);
      timersRef.current.push(t);
    }
  }, [pathname, phase]);

  // Auto-clear "entering" after the dashboard fade-in plays.
  useEffect(() => {
    if (phase !== "entering") return;
    const t = setTimeout(() => {
      setPhase("idle");
      startedFromRef.current = null;
    }, ENTER_TO_IDLE_MS);
    timersRef.current.push(t);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => clearTimers, []);

  const launch = useCallback(
    (href: string, options?: LaunchOptions) => {
      if (phase !== "idle") return;

      // Same destination → no transition needed.
      if (typeof window !== "undefined" && href === pathname) return;

      setPanelCopy({
        line1: options?.panelLine1 ?? "Opening dashboard",
        line2: options?.panelLine2 ?? "ANGLR",
      });
      pendingNavRef.current = options;

      if (prefersReducedMotion) {
        if (options?.replace) router.replace(href);
        else router.push(href);
        return;
      }

      startedFromRef.current = pathname ?? null;
      setPhase("leaving");
      router.prefetch(href);

      const t1 = setTimeout(() => setPhase("panel"), LEAVE_TO_PANEL_MS);
      const t2 = setTimeout(() => {
        setPhase("navigating");
        const opts = pendingNavRef.current;
        pendingNavRef.current = undefined;
        if (opts?.replace) router.replace(href);
        else router.push(href);
      }, LEAVE_TO_NAV_MS);

      timersRef.current.push(t1, t2);
    },
    [phase, pathname, prefersReducedMotion, router],
  );

  const showOverlay =
    phase === "leaving" ||
    phase === "panel" ||
    phase === "navigating" ||
    phase === "entering";

  return (
    <LaunchCtx.Provider value={{ launch, isPlaying: phase !== "idle" }}>
      {children}
      <AnimatePresence>
        {showOverlay && (
          <motion.div
            key="launch-overlay"
            className="pointer-events-none fixed inset-0 z-[9050]"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
            aria-hidden
          >
            {/* Backdrop — dim + blur over the landing video */}
            <motion.div
              className="absolute inset-0"
              initial={{
                backgroundColor: "rgba(2,6,17,0)",
                backdropFilter: "blur(0px)",
                WebkitBackdropFilter: "blur(0px)",
              }}
              animate={
                phase === "entering"
                  ? {
                      backgroundColor: "rgba(2,6,17,0)",
                      backdropFilter: "blur(0px)",
                      WebkitBackdropFilter: "blur(0px)",
                    }
                  : {
                      backgroundColor: "rgba(2,6,17,0.55)",
                      backdropFilter: "blur(14px)",
                      WebkitBackdropFilter: "blur(14px)",
                    }
              }
              transition={{ duration: 0.55, ease: EASE }}
            />

            {/* Glass panel — slides up from the bottom */}
            <motion.div
              className="absolute inset-x-0 bottom-0 h-full origin-bottom"
              initial={{ y: "100%", scale: 0.96, opacity: 0.85 }}
              animate={
                phase === "entering"
                  ? { y: 0, scale: 1.01, opacity: 0 }
                  : { y: 0, scale: 1, opacity: 1 }
              }
              transition={
                phase === "entering"
                  ? { duration: 0.5, ease: EASE }
                  : { duration: 0.85, ease: EASE }
              }
            >
              <LaunchPanel
                showMark={phase !== "entering"}
                line1={panelCopy.line1}
                line2={panelCopy.line2}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </LaunchCtx.Provider>
  );
}

function LaunchPanel({
  showMark,
  line1,
  line2,
}: {
  showMark: boolean;
  line1: string;
  line2: string;
}) {
  return (
    <div
      className="relative h-full w-full overflow-hidden border-t border-white/12 bg-[rgba(8,12,22,0.78)] shadow-[0_-30px_80px_-12px_rgba(0,0,0,0.6)]"
      style={{
        backdropFilter: "blur(28px) saturate(160%)",
        WebkitBackdropFilter: "blur(28px) saturate(160%)",
        borderTopLeftRadius: 36,
        borderTopRightRadius: 36,
      }}
    >
      <span
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)",
        }}
      />
      <span
        className="pointer-events-none absolute inset-x-0 -top-32 h-72"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(127,196,255,0.22), transparent 62%)",
        }}
      />
      <span
        className="pointer-events-none absolute inset-x-12 top-0 h-24"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0))",
        }}
      />

      <AnimatePresence>
        {showMark && (
          <motion.div
            key="mark"
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.55, ease: EASE, delay: 0.18 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="flex flex-col items-center gap-3">
              <span className="text-[0.625rem] font-medium uppercase tracking-[0.42em] text-white/55">
                {line1}
              </span>
              <span className="font-display text-2xl font-semibold tracking-[0.18em] text-white/90">
                {line2}
              </span>
              <span className="relative mt-1 block h-px w-28 overflow-hidden rounded-full bg-white/10">
                <span className="launch-shimmer-bar absolute inset-y-0 left-0 block w-1/3" />
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
