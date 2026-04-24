"use client";

import { Marker } from "react-map-gl";
import { fadeByAge } from "@/lib/utils/fade-color";
import { daysSince } from "@/lib/utils/dates";

export function CatchPin({
  lng,
  lat,
  caughtAt,
  onClick,
  size = 28,
}: {
  lng: number;
  lat: number;
  caughtAt: string;
  onClick?: () => void;
  size?: number;
}) {
  const { fill, stroke, glow } = fadeByAge(daysSince(caughtAt));
  return (
    <Marker
      longitude={lng}
      latitude={lat}
      anchor="bottom"
      onClick={(e) => {
        e.originalEvent.stopPropagation();
        onClick?.();
      }}
    >
      <button
        type="button"
        aria-label="Catch pin"
        className="group relative transition-transform duration-200 hover:-translate-y-0.5 focus:outline-none"
        style={{ width: size, height: size }}
      >
        <span
          className="absolute inset-0 rounded-full blur-md"
          style={{ background: glow }}
        />
        <svg
          viewBox="0 0 32 32"
          width={size}
          height={size}
          className="relative drop-shadow-[0_4px_10px_rgba(0,0,0,0.4)]"
        >
          <defs>
            <linearGradient id={`pg-${fill}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} />
              <stop offset="100%" stopColor={fill} />
            </linearGradient>
          </defs>
          <path
            d={[
              "M16 2",
              "C 22 2 27 7 27 13",
              "C 27 20 16 30 16 30",
              "C 16 30 5 20 5 13",
              "C 5 7 10 2 16 2",
              "Z",
            ].join(" ")}
            fill={`url(#pg-${fill})`}
            stroke={stroke}
            strokeWidth="1"
          />
          {/* Tiny fish silhouette inside */}
          <g transform="translate(9,9)" fill="#0a1220" opacity="0.85">
            <path d="M2 4c2 0 4-2 6-2s4 2 5 2-1 2-1 2 1 2 1 2-3 0-5 2-4 0-6 0c1-1 2-1 2-2s-1-1-2-4z" />
            <circle cx="10.5" cy="3.6" r="0.6" fill="#fff" opacity="0.9" />
          </g>
        </svg>
      </button>
    </Marker>
  );
}
