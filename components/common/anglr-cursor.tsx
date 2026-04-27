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

/**
 * Claude-style cursor: snappy inner dot + lagging outer ring, hover expand/glow,
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
      if (!dot || !ring) return;

      dot.classList.remove("landing-cursor-dot--pulse");
      ring.classList.remove("landing-cursor-ring--pulse");
      void (dot as HTMLElement).offsetWidth;

      if (!reduceMotion) {
        dot.classList.add("landing-cursor-dot--pulse");
        ring.classList.add("landing-cursor-ring--pulse");
      }

      if (pulseTimerRef.current) clearTimeout(pulseTimerRef.current);
      pulseTimerRef.current = setTimeout(() => {
        dot.classList.remove("landing-cursor-dot--pulse");
        ring.classList.remove("landing-cursor-ring--pulse");
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
          />
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
