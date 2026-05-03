"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Cinematic ocean video backdrop, shared by the landing hero and the auth shell.
 *
 * - Uses `/landing/ocean.jpg` as a `poster` so first paint is instant,
 *   then crossfades to the looping `/landing/ocean.mp4`.
 * - `autoPlay muted playsInline loop preload="auto"` is the modern recipe
 *   for autoplay across desktop browsers.
 * - Subtle mouse parallax (disabled under `prefers-reduced-motion`).
 */
export function OceanBackground({
  /** Slight bias on parallax intensity / fade duration. Defaults are tuned for the landing. */
  parallax = true,
}: {
  parallax?: boolean;
} = {}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  // Aggressively start playback as soon as the browser has anything to show.
  // Tries immediately, on `loadedmetadata`, on `canplay`, and on visibility/focus.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;

    let cancelled = false;

    const tryPlay = () => {
      if (cancelled) return;
      // If the video has at least metadata (HAVE_METADATA = 1) we can start.
      if (v.readyState >= 1 && v.paused) {
        const p = v.play();
        if (p && typeof p.catch === "function") {
          p.catch(() => {
            /* Autoplay blocked — first user interaction / focus will retry below. */
          });
        }
      }
    };

    // Kick off immediately — works for cached / already-buffered video on refresh.
    tryPlay();

    const onMeta = () => tryPlay();
    const onCanPlay = () => {
      tryPlay();
      setReady(true);
    };
    const onLoadedData = () => {
      tryPlay();
      setReady(true);
    };
    const onVisibility = () => {
      if (!document.hidden) tryPlay();
    };

    v.addEventListener("loadedmetadata", onMeta);
    v.addEventListener("canplay", onCanPlay);
    v.addEventListener("loadeddata", onLoadedData);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", tryPlay);

    // If the data is already buffered (BFCache / SPA back-forward), it's ready now.
    if (v.readyState >= 2) setReady(true);

    return () => {
      cancelled = true;
      v.removeEventListener("loadedmetadata", onMeta);
      v.removeEventListener("canplay", onCanPlay);
      v.removeEventListener("loadeddata", onLoadedData);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", tryPlay);
    };
  }, []);

  // Subtle parallax on mouse — translate the video a few px around the cursor.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!parallax) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const wrap = wrapRef.current;
    if (!wrap) return;

    let raf = 0;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;

    const tick = () => {
      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;
      wrap.style.transform = `translate3d(${cx.toFixed(2)}px, ${cy.toFixed(
        2,
      )}px, 0) scale(1.06)`;
      raf = requestAnimationFrame(tick);
    };

    const onMove = (e: MouseEvent) => {
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      // Range ≈ ±10px horizontal, ±6px vertical
      tx = ((e.clientX / w) * 2 - 1) * -10;
      ty = ((e.clientY / h) * 2 - 1) * -6;
    };

    raf = requestAnimationFrame(tick);
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
    };
  }, [parallax]);

  return (
    <div
      className="landing-ocean-bg pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      {/* Poster JPG underneath — guarantees no black flash before the video decodes. */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url(/landing/ocean.jpg)",
          filter: "contrast(1.05) saturate(1.06)",
        }}
      />

      {/* Parallax wrap — `scale(1.06)` so edges never reveal as we translate. */}
      <div
        ref={wrapRef}
        className="absolute inset-0 will-change-transform"
        style={{ transform: "translate3d(0,0,0) scale(1.06)" }}
      >
        <video
          ref={videoRef}
          className={`h-full w-full select-none object-cover object-center transition-opacity duration-[450ms] ease-out ${
            ready ? "opacity-100" : "opacity-0"
          }`}
          src="/landing/ocean.mp4"
          poster="/landing/ocean.jpg"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          disableRemotePlayback
          style={{
            filter: "contrast(1.05) saturate(1.06)",
          }}
        />
      </div>
    </div>
  );
}
