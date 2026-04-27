"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MapCanvas } from "@/components/map/map-canvas";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { AddCatchSheet } from "@/components/map/add-catch-sheet";
import { listMyCatches } from "@/lib/queries/catches";
import { CatchModal } from "@/components/catches/catch-modal";
import { useGeolocation } from "@/hooks/use-geolocation";
import { AnimatePresence, motion } from "framer-motion";
import type { CatchWithImages } from "@/lib/supabase/types";
import type { CatchPoint } from "@/lib/mapbox/cluster";

type Mode = "idle" | "placing";

const placeOnMapCtaMotion =
  "outline-none ring-offset-2 ring-offset-[#020611] transition-[transform,box-shadow,border-color,filter] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:hover:scale-[1.04] motion-safe:hover:-translate-y-px motion-safe:active:scale-[0.985] motion-safe:active:translate-y-0 focus-visible:ring-2 focus-visible:ring-anglr-blue/70";

export function MapView() {
  const [mode, setMode] = useState<Mode>("idle");
  const [pendingCoords, setPendingCoords] = useState<
    { lng: number; lat: number } | null
  >(null);
  const [selected, setSelected] = useState<CatchWithImages | null>(null);

  const { coords: geo } = useGeolocation({ enabled: true });

  const { data: catches } = useQuery({
    queryKey: ["my-catches"],
    queryFn: listMyCatches,
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
  });

  const points = useMemo<CatchPoint[]>(
    () =>
      (catches ?? []).map((c) => ({
        id: c.id,
        lng: c.lng,
        lat: c.lat,
        species: c.species,
        weight_lbs: c.weight_lbs,
        caught_at: c.caught_at,
      })),
    [catches]
  );

  function handlePlacement(lng: number, lat: number) {
    setPendingCoords({ lng, lat });
    setMode("idle");
  }

  function handlePinClick(p: CatchPoint) {
    const full = (catches ?? []).find((c) => c.id === p.id) ?? null;
    setSelected(full);
  }

  return (
    <>
      <MapCanvas
        points={points}
        userLocation={geo ? { lng: geo.lng, lat: geo.lat } : null}
        placementMode={mode === "placing"}
        onPlacement={handlePlacement}
        onPinClick={handlePinClick}
      />

      {/* Floating add-catch controls */}
      <div className="pointer-events-none absolute left-1/2 bottom-8 -translate-x-1/2 flex items-center gap-2 z-20">
        <AnimatePresence mode="popLayout">
          {mode === "placing" ? (
            <motion.div
              key="placing"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="pointer-events-auto"
            >
              <Button
                variant="secondary"
                size="lg"
                onClick={() => setMode("idle")}
              >
                <X /> Cancel placement
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="pointer-events-auto"
            >
              <button
                type="button"
                onClick={() => setMode("placing")}
                className={`cta-hero-login group relative inline-flex h-[3.25rem] items-center justify-center gap-2.5 overflow-hidden rounded-full px-8 text-[0.9375rem] font-semibold tracking-[0.04em] text-[#e8f2fc] ${placeOnMapCtaMotion}`}
              >
                <span className="cta-hero-login__bloom" aria-hidden />
                <span className="cta-hero-login__base" aria-hidden />
                <span className="cta-hero-login__glass" aria-hidden />
                <span className="cta-hero-login__shine-edge" aria-hidden />
                <span className="cta-hero-login__shimmer" aria-hidden />
                <span className="relative z-10 inline-flex items-center gap-2.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]">
                  <Plus
                    className="size-[1.05rem] shrink-0 opacity-90 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:group-hover:translate-x-0.5"
                    strokeWidth={2.35}
                    aria-hidden
                  />
                  Place on map
                </span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AddCatchSheet
        open={pendingCoords !== null}
        onOpenChange={(o) => !o && setPendingCoords(null)}
        initialCoords={pendingCoords}
      />

      <CatchModal
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
        catchRow={selected}
      />
    </>
  );
}
