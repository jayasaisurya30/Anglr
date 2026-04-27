"use client";

import { Marker } from "react-map-gl";
import { fmtDate } from "@/lib/utils/dates";

export function CatchPin({
  lng,
  lat,
  caughtAt,
  species,
  weight_lbs,
  onClick,
}: {
  lng: number;
  lat: number;
  caughtAt: string;
  species: string | null;
  weight_lbs: number | null;
  onClick?: () => void;
}) {
  const title = species?.trim() || "Catch";
  const weightLine =
    weight_lbs != null && !Number.isNaN(weight_lbs)
      ? `${weight_lbs.toFixed(1)} lbs`
      : null;

  return (
    <Marker longitude={lng} latitude={lat} anchor="center">
      <div className="group relative flex justify-center px-3 pb-1 pt-10">
        <div
          className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 w-max max-w-[220px] -translate-x-1/2 rounded-xl border border-white/[0.1] bg-[rgba(6,8,12,0.94)] px-3 py-2 text-left shadow-[0_8px_30px_-6px_rgba(0,0,0,0.65)] backdrop-blur-md opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          role="tooltip"
        >
          <p className="text-xs font-semibold leading-tight text-foreground">
            {title}
          </p>
          <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-[11px] leading-snug text-muted-foreground">
            {weightLine ? <span>{weightLine}</span> : null}
            <span>{fmtDate(caughtAt, "MMM d, yyyy")}</span>
          </div>
        </div>
        <span className="relative z-10 inline-flex h-3 w-3 shrink-0 items-center justify-center">
          <span
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 h-[200%] w-[200%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(127,196,255,0.44)_0%,rgba(77,163,255,0.16)_36%,transparent_70%)] blur-[7px] opacity-90 transition-[opacity,filter] duration-200 group-hover:opacity-100 group-hover:blur-[9px]"
          />
          <button
            type="button"
            aria-label={`${title}, ${fmtDate(caughtAt, "MMM d, yyyy")}`}
            className="relative h-full w-full rounded-full border border-white/[0.24] transition-[transform,filter] duration-200 motion-safe:group-hover:scale-[1.14] motion-safe:group-hover:brightness-[1.07] focus:outline-none focus-visible:ring-2 focus-visible:ring-anglr-blue/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#05070a]"
            style={{
              background: `
                radial-gradient(circle at 30% 26%, rgba(255,255,255,0.58) 0%, rgba(255,255,255,0.1) 17%, transparent 41%),
                radial-gradient(circle at 74% 76%, rgba(0,0,0,0.72) 0%, transparent 50%),
                linear-gradient(148deg, #3d4450 0%, #101216 46%, #282e38 100%)
              `,
              boxShadow: `
                0 0 14px -2px rgba(127, 196, 255, 0.42),
                0 0 6px -1px rgba(220, 235, 255, 0.14),
                inset 0 2px 3px rgba(255, 255, 255, 0.36),
                inset 0 -3px 5px rgba(0, 0, 0, 0.84)
              `,
            }}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onClick?.();
            }}
          />
        </span>
      </div>
    </Marker>
  );
}
