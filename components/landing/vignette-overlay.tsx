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
            "linear-gradient(90deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.18) 18%, rgba(0,0,0,0) 32%, rgba(0,0,0,0) 68%, rgba(0,0,0,0.18) 82%, rgba(0,0,0,0.55) 100%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 70%, rgba(0,0,0,0.55) 100%)",
        }}
      />
      <div
        className="absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2 h-[520px] w-[820px] rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, rgba(77,163,255,0.18) 0%, rgba(77,163,255,0) 70%)",
          filter: "blur(40px)",
        }}
      />
    </div>
  );
}
