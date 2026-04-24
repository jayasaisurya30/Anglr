"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MapCanvas } from "@/components/map/map-canvas";
import { Button } from "@/components/ui/button";
import { MapPin, Plus, X } from "lucide-react";
import { AddCatchSheet } from "@/components/map/add-catch-sheet";
import { listMyCatches } from "@/lib/queries/catches";
import { CatchModal } from "@/components/catches/catch-modal";
import { useGeolocation } from "@/hooks/use-geolocation";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import type { CatchWithImages } from "@/lib/supabase/types";
import type { CatchPoint } from "@/lib/mapbox/cluster";

type Mode = "idle" | "placing";

export function MapView() {
  const [mode, setMode] = useState<Mode>("idle");
  const [pendingCoords, setPendingCoords] = useState<
    { lng: number; lat: number } | null
  >(null);
  const [selected, setSelected] = useState<CatchWithImages | null>(null);

  const { coords: geo, error: geoError } = useGeolocation({ enabled: true });

  const { data: catches } = useQuery({
    queryKey: ["my-catches"],
    queryFn: listMyCatches,
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

  function handleAddHere() {
    if (!geo) {
      toast.error(
        geoError
          ? "Location unavailable. You can click the map to place a pin."
          : "Waiting for your location..."
      );
      setMode("placing");
      return;
    }
    setPendingCoords({ lng: geo.lng, lat: geo.lat });
  }

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
              className="pointer-events-auto flex items-center gap-2 glass-strong rounded-full p-1.5 shadow-panel"
            >
              <Button
                variant="primary"
                size="lg"
                onClick={handleAddHere}
                className="rounded-full"
              >
                <MapPin /> Add catch here
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => setMode("placing")}
                className="rounded-full"
              >
                <Plus /> Place on map
              </Button>
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
