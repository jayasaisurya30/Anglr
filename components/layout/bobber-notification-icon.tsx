"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useId } from "react";
import { cn } from "@/lib/utils/cn";

/** Premium fishing bobber for the notifications trigger — SVG + subtle motion */
export function BobberNotificationIcon({
  hasUnread,
  menuOpen,
  className,
}: {
  /** Stronger bobbing when there are unread notifications */
  hasUnread: boolean;
  /** Pause motion while the popover is open */
  menuOpen: boolean;
  className?: string;
}) {
  const gid = useId().replace(/:/g, "");
  const reduce = useReducedMotion();
  const paused = menuOpen || reduce;

  const bobberMotion = paused
    ? { y: 0, rotate: 0 }
    : hasUnread
      ? {
          y: [0, -4, 0, -3, 0],
          rotate: [-2.2, 2, -1.5, 1.8, -2.2],
        }
      : {
          y: [0, -0.6, 0],
          rotate: 0,
        };

  const transition = paused
    ? { duration: 0.2 }
    : hasUnread
      ? {
          duration: 2.6,
          repeat: Infinity,
          ease: [0.45, 0, 0.55, 1] as const,
        }
      : {
          duration: 4.2,
          repeat: Infinity,
          ease: "easeInOut" as const,
        };

  return (
    <div className={cn("relative flex h-9 w-9 items-center justify-center", className)}>
      {/* Ripple rings — only when unread + not paused */}
      {!paused && hasUnread ? (
        <span className="pointer-events-none absolute bottom-1 left-1/2 z-0 -translate-x-1/2">
          <span className="bobber-ripple bobber-ripple--a" />
          <span className="bobber-ripple bobber-ripple--b" />
          <span className="bobber-ripple bobber-ripple--c" />
        </span>
      ) : null}

      <motion.div
        className="relative z-10"
        animate={bobberMotion}
        transition={transition}
      >
        <svg
          width="26"
          height="34"
          viewBox="0 0 40 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="bobber-svg-glow transition-[filter] duration-300"
          aria-hidden
        >
          <defs>
            <linearGradient id={`bobber-top-${gid}`} x1="10" y1="14" x2="28" y2="32" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ffffff" />
              <stop offset="0.4" stopColor="#e8f4ff" />
              <stop offset="1" stopColor="#9ec5ea" />
            </linearGradient>
            <linearGradient id={`bobber-bottom-${gid}`} x1="10" y1="32" x2="30" y2="44" gradientUnits="userSpaceOnUse">
              <stop stopColor="#1a3048" />
              <stop offset="0.45" stopColor="#0a1018" />
              <stop offset="1" stopColor="#1e3550" />
            </linearGradient>
            <linearGradient id={`bobber-stem-${gid}`} x1="17" y1="2" x2="23" y2="18" gradientUnits="userSpaceOnUse">
              <stop stopColor="#3d4e62" />
              <stop offset="0.55" stopColor="#121820" />
              <stop offset="1" stopColor="#080c12" />
            </linearGradient>
            <radialGradient
              id={`bobber-spec-${gid}`}
              cx="0"
              cy="0"
              r="1"
              gradientUnits="userSpaceOnUse"
              gradientTransform="translate(13 21) rotate(52) scale(15 19)"
            >
              <stop stopColor="#ffffff" stopOpacity="0.5" />
              <stop offset="0.4" stopColor="#ffffff" stopOpacity="0.1" />
              <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>
            <filter id={`bobber-soft-${gid}`} x="-25%" y="-25%" width="150%" height="150%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="0.45" result="blur" />
              <feOffset dy="0.6" result="off" />
              <feMerge>
                <feMergeNode in="off" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Stem — meets top of sphere at y=18 */}
          <rect
            x="17"
            y="2"
            width="6"
            height="16"
            rx="1.5"
            fill={`url(#bobber-stem-${gid})`}
            stroke="rgba(255,255,255,0.16)"
            strokeWidth="0.45"
          />
          <rect x="18" y="3.5" width="2.2" height="6" rx="0.5" fill="rgba(255,255,255,0.14)" />

          {/* Sphere center (20,30), r=12 — top 18, seam 30, bottom 42 */}
          <circle cx="20" cy="30" r="12.6" stroke="rgba(127,196,255,0.42)" strokeWidth="0.65" fill="none" />

          {/* Lower hemisphere */}
          <path
            d="M 8 30 A 12 12 0 0 0 32 30"
            fill={`url(#bobber-bottom-${gid})`}
            filter={`url(#bobber-soft-${gid})`}
          />
          {/* Upper hemisphere */}
          <path d="M 8 30 A 12 12 0 0 1 32 30" fill={`url(#bobber-top-${gid})`} />

          <line
            x1="8"
            y1="30.22"
            x2="32"
            y2="30.22"
            stroke="rgba(255,255,255,0.38)"
            strokeWidth="0.38"
            strokeLinecap="round"
          />
          <rect x="6.25" y="29" width="2" height="2.35" rx="0.35" fill="rgba(230,243,255,0.4)" stroke="rgba(127,196,255,0.35)" strokeWidth="0.25" />
          <rect x="31.75" y="29" width="2" height="2.35" rx="0.35" fill="rgba(230,243,255,0.4)" stroke="rgba(127,196,255,0.35)" strokeWidth="0.25" />

          <ellipse cx="13.5" cy="22" rx="6.5" ry="9" fill={`url(#bobber-spec-${gid})`} />
          <ellipse cx="25" cy="35.5" rx="5" ry="3.8" fill="rgba(77,163,255,0.13)" />

          <ellipse cx="20" cy="43.5" rx="11" ry="2.5" fill="rgba(127,196,255,0.07)" />
        </svg>
      </motion.div>
    </div>
  );
}
