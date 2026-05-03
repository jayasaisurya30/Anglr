"use client";

import { cn } from "@/lib/utils/cn";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

const LERP_INNER = 0.62;
const LERP_OUTER = 0.11;

const CURSOR_ATTR = "data-anglr-cursor";

function targetIsInteractive(el: Element | null): boolean {
  if (!el) return false;
  return !!el.closest(
    [
      'a[href]',
      "button:not([disabled])",
      '[role="button"]',
      '[role="link"]',
      '[role="tab"]',
      '[role="menuitem"]',
      '[role="option"]',
      '[role="switch"]',
      "label",
      "summary",
      'input:not([disabled]):not([type="hidden"])',
      "textarea:not([disabled])",
      "select:not([disabled])",
      "[data-anglr-cursor-target], [data-landing-cursor-target]",
    ].join(", "),
  );
}

/** Concave 4-point sparkle frame (outer − inner), viewBox 0 0 64 64. N/S tips extended. */
const CURSOR_SPARKLE_D =
  "M 32 0.1 C 33.5 26.5 50.5 31.2 62.5 32 C 50.5 32.8 33.5 37.5 32 63.9 C 30.5 37.5 13.5 32.8 1.5 32 C 13.5 31.2 30.5 26.5 32 0.1 Z M 32 17 C 33 29.6 43.5 31.6 46 32 C 43.5 32.4 33 35.2 32 47 C 31 35.2 20.5 32.4 18 32 C 20.5 31.6 31 29.6 32 17 Z";

/**
 * Custom cursor: white inner dot + lagging outer sparkle frame, hover expand/glow,
 * click pulse. Desktop only. Sets `data-anglr-cursor` on `<html>` to hide the
 * system cursor app-wide.
 */
export function AnglrCursor() {
  const [active, setActive] = useState(false);
  const [visible, setVisible] = useState(false);
  const [hovering, setHovering] = useState(false);

  const innerWrapRef = useRef<HTMLDivElement>(null);
  const outerWrapRef = useRef<HTMLDivElement>(null);
  const innerPos = useRef({ x: 0, y: 0 });
  const outerPos = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });
  const rafId = useRef(0);
  const hoveringRef = useRef(false);
  const visibleRef = useRef(false);
  const pulseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    setActive(true);
  }, []);

  useLayoutEffect(() => {
    if (!active) return;

    document.documentElement.setAttribute(CURSOR_ATTR, "");

    const innerEl = innerWrapRef.current;
    const outerEl = outerWrapRef.current;
    if (!innerEl || !outerEl) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const innerLerp = reduceMotion ? 1 : LERP_INNER;
    const outerLerp = reduceMotion ? 1 : LERP_OUTER;

    const tick = () => {
      const tt = target.current;
      const ip = innerPos.current;
      const op = outerPos.current;

      ip.x += (tt.x - ip.x) * innerLerp;
      ip.y += (tt.y - ip.y) * innerLerp;
      op.x += (ip.x - op.x) * outerLerp;
      op.y += (ip.y - op.y) * outerLerp;

      innerEl.style.left = `${ip.x}px`;
      innerEl.style.top = `${ip.y}px`;
      outerEl.style.left = `${op.x}px`;
      outerEl.style.top = `${op.y}px`;

      rafId.current = requestAnimationFrame(tick);
    };

    const onMove = (e: MouseEvent) => {
      target.current = { x: e.clientX, y: e.clientY };

      if (!visibleRef.current) {
        visibleRef.current = true;
        setVisible(true);
        innerPos.current = { x: e.clientX, y: e.clientY };
        outerPos.current = { x: e.clientX, y: e.clientY };
        innerEl.style.left = `${e.clientX}px`;
        innerEl.style.top = `${e.clientY}px`;
        outerEl.style.left = `${e.clientX}px`;
        outerEl.style.top = `${e.clientY}px`;
      }

      const under = document.elementFromPoint(e.clientX, e.clientY);
      const h = targetIsInteractive(under);
      if (h !== hoveringRef.current) {
        hoveringRef.current = h;
        setHovering(h);
      }
    };

    const onLeave = () => {
      visibleRef.current = false;
      setVisible(false);
    };

    const onDown = () => {
      const dot = innerEl.querySelector(".landing-cursor-dot");
      const ring = outerEl.querySelector(".landing-cursor-ring");
      const sparkle = ring?.querySelector(".landing-cursor-sparkle-svg");
      if (!dot || !ring || !sparkle) return;

      dot.classList.remove("landing-cursor-dot--pulse");
      sparkle.classList.remove("landing-cursor-sparkle-svg--pulse");
      void (dot as HTMLElement).offsetWidth;

      if (!reduceMotion) {
        dot.classList.add("landing-cursor-dot--pulse");
        sparkle.classList.add("landing-cursor-sparkle-svg--pulse");
      }

      if (pulseTimerRef.current) clearTimeout(pulseTimerRef.current);
      pulseTimerRef.current = setTimeout(() => {
        dot.classList.remove("landing-cursor-dot--pulse");
        sparkle.classList.remove("landing-cursor-sparkle-svg--pulse");
        pulseTimerRef.current = null;
      }, 480);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    window.addEventListener("mousedown", onDown);

    rafId.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId.current);
      if (pulseTimerRef.current) clearTimeout(pulseTimerRef.current);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("mousedown", onDown);
      document.documentElement.removeAttribute(CURSOR_ATTR);
    };
  }, [active]);

  if (!active) return null;

  return (
    <>
      <div
        ref={outerWrapRef}
        className={cn(
          "pointer-events-none fixed left-0 top-0 z-[10000] will-change-[left,top]",
          visible ? "opacity-100" : "opacity-0",
        )}
        style={{ transition: "opacity 0.18s ease" }}
        aria-hidden
      >
        <div className="-translate-x-1/2 -translate-y-1/2">
          <div
            className={cn(
              "landing-cursor-ring",
              hovering && "landing-cursor-ring--hover",
            )}
          >
            <svg
              className="landing-cursor-sparkle-svg"
              viewBox="0 0 64 64"
              width="64"
              height="64"
              aria-hidden
            >
              <path
                className="landing-cursor-sparkle-path"
                d={CURSOR_SPARKLE_D}
                fillRule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>
      <div
        ref={innerWrapRef}
        className={cn(
          "pointer-events-none fixed left-0 top-0 z-[10001] will-change-[left,top]",
          visible ? "opacity-100" : "opacity-0",
        )}
        style={{ transition: "opacity 0.18s ease" }}
        aria-hidden
      >
        <div className="-translate-x-1/2 -translate-y-1/2">
          <div
            className={cn(
              "landing-cursor-dot",
              hovering && "landing-cursor-dot--hover",
            )}
          />
        </div>
      </div>
    </>
  );
}
