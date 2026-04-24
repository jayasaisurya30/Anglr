/**
 * Age-based color fade for catch pins.
 * Fresh catches render in saturated ANGLR blue; older pins drift toward
 * a lighter, desaturated blue over ~120 days.
 */
export function fadeByAge(days: number): {
  fill: string;
  stroke: string;
  glow: string;
} {
  const MAX = 120; // full fade after ~4 months
  const t = Math.min(1, Math.max(0, days / MAX));

  // Saturation drops 95 -> 45; Lightness lifts 60 -> 78
  const s = 95 - 50 * t;
  const l = 60 + 18 * t;

  const fill = `hsl(211, ${s.toFixed(0)}%, ${l.toFixed(0)}%)`;
  const stroke = `hsl(211, ${(s * 0.6).toFixed(0)}%, ${(l + 8).toFixed(0)}%)`;
  const glow = `hsla(211, ${s.toFixed(0)}%, ${l.toFixed(0)}%, ${(0.55 - 0.4 * t).toFixed(2)})`;

  return { fill, stroke, glow };
}
