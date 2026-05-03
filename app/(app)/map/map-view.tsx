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
import {
  PremiumGlassCtaLayers,
  premiumGlassButtonClassName,
} from "@/components/common/premium-glass-cta";
import type { CatchWithImages } from "@/lib/supabase/types";
import type { CatchPoint } from "@/lib/mapbox/cluster";

type Mode = "idle" | "placing";

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
    <div className="relative flex h-full min-h-0 min-w-0 w-full flex-1 flex-col">
      <MapCanvas
        points={points}
        userLocation={geo ? { lng: geo.lng, lat: geo.lat } : null}
        placementMode={mode === "placing"}
        onPlacement={handlePlacement}
        onPinClick={handlePinClick}
        className="min-h-0 flex-1"
      />

      {/* Floating add-catch controls */}
      <div className="pointer-events-none absolute left-1/2 bottom-8 z-20 flex -translate-x-1/2 items-center gap-2">
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
                className={premiumGlassButtonClassName()}
              >
                <PremiumGlassCtaLayers />
                <span className="relative z-10 inline-flex items-center gap-2.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]">
                  <Plus
                    className="size-[1.05rem] shrink-0 opacity-90 transition-transform duration-500 ease-smooth-out motion-safe:group-hover:translate-x-0.5"
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
    </div>
  );
}
