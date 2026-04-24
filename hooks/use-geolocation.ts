"use client";

import { useEffect, useRef, useState } from "react";

export interface Coords {
  lat: number;
  lng: number;
  accuracy?: number;
  heading?: number | null;
  updatedAt: number;
}

export interface UseGeolocationOptions {
  enabled?: boolean;
  throttleMs?: number;
}

export function useGeolocation({
  enabled = true,
  throttleMs = 1500,
}: UseGeolocationOptions = {}) {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [permission, setPermission] = useState<"granted" | "denied" | "prompt" | "unknown">(
    "unknown"
  );
  const lastUpdateRef = useRef(0);

  useEffect(() => {
    if (!enabled || typeof window === "undefined" || !navigator.geolocation) {
      return;
    }

    if (navigator.permissions) {
      navigator.permissions
        .query({ name: "geolocation" as PermissionName })
        .then((p) => {
          setPermission(p.state as typeof permission);
          p.onchange = () => setPermission(p.state as typeof permission);
        })
        .catch(() => {});
    }

    const applyPosition = (
      pos: GeolocationPosition,
      opts?: { force?: boolean }
    ) => {
      const now = Date.now();
      if (
        !opts?.force &&
        now - lastUpdateRef.current < throttleMs
      ) {
        return;
      }
      lastUpdateRef.current = now;
      setCoords({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        heading: pos.coords.heading,
        updatedAt: now,
      });
      setError(null);
    };

    // Fast first fix (cached / network); watch refines with high accuracy.
    navigator.geolocation.getCurrentPosition(
      (pos) => applyPosition(pos, { force: true }),
      () => undefined,
      {
        enableHighAccuracy: false,
        maximumAge: 120_000,
        timeout: 12_000,
      }
    );

    const id = navigator.geolocation.watchPosition(
      (pos) => applyPosition(pos),
      (err) => setError(err.message),
      { enableHighAccuracy: true, maximumAge: 10_000, timeout: 25_000 }
    );

    return () => navigator.geolocation.clearWatch(id);
  }, [enabled, throttleMs]);

  return { coords, error, permission };
}
