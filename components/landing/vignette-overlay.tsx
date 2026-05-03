/**
 * Cinematic darkening: heavy on left/right edges, slightly lighter in center,
 * with a soft top-center glow so the heading "lifts" off the water.
 */
export function VignetteOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.24) 18%, rgba(0,0,0,0.04) 32%, rgba(0,0,0,0.04) 68%, rgba(0,0,0,0.24) 82%, rgba(0,0,0,0.62) 100%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.04) 22%, rgba(0,0,0,0.04) 68%, rgba(0,0,0,0.62) 100%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          /* Center scrim — keeps headline punchy without crushing the water */
          background:
            "radial-gradient(ellipse 80% 60% at 50% 45%, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0) 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute left-1/2 top-[38%] h-[min(92vw,820px)] w-[min(140vw,980px)] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          /* Soft bloom without `filter: blur` — avoids large offscreen repaints */
          background:
            "radial-gradient(closest-side, rgba(77,163,255,0.16) 0%, rgba(77,163,255,0.07) 42%, rgba(77,163,255,0.02) 62%, rgba(77,163,255,0) 78%)",
        }}
      />
    </div>
  );
}
