"use client";

import { Marker } from "react-map-gl";

export function ClusterMarker({
  lng,
  lat,
  count,
  onClick,
}: {
  lng: number;
  lat: number;
  count: number;
  onClick?: () => void;
}) {
  const size = Math.min(64, 28 + Math.log10(count) * 14);
  return (
    <Marker longitude={lng} latitude={lat} anchor="center">
      <button
        type="button"
        onClick={onClick}
        className="relative flex items-center justify-center rounded-full bg-anglr-blue/20 backdrop-blur-md text-white ring-1 ring-anglr-blue/40 hover:bg-anglr-blue/30 transition"
        style={{ width: size, height: size }}
      >
        <span className="absolute inset-0 rounded-full bg-anglr-blue/15 animate-pulseGlow" />
        <span className="relative text-xs font-semibold">{count}</span>
      </button>
    </Marker>
  );
}
