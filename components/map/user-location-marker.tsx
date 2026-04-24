"use client";

import { Marker } from "react-map-gl";

export function UserLocationMarker({
  lng,
  lat,
}: {
  lng: number;
  lat: number;
}) {
  return (
    <Marker longitude={lng} latitude={lat} anchor="center">
      <div className="relative flex items-center justify-center" aria-hidden>
        <span className="absolute inline-flex h-6 w-6 rounded-full bg-anglr-blue/30 blur-md" />
        <span className="absolute inline-flex h-6 w-6 animate-ping rounded-full bg-anglr-blue/40" />
        <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-anglr-blue ring-[3px] ring-anglr-blue/40 shadow-glow" />
      </div>
    </Marker>
  );
}
