"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listPublicCatches } from "@/lib/queries/catches";
import { MapCanvas } from "@/components/map/map-canvas";
import { CatchModal } from "@/components/catches/catch-modal";
import type { CatchPoint } from "@/lib/mapbox/cluster";
import type { CatchWithAuthor, CatchWithImages } from "@/lib/supabase/types";

export function PublicMapView() {
  const [selected, setSelected] = useState<CatchWithImages | null>(null);

  const { data } = useQuery({
    queryKey: ["public-catches"],
    queryFn: () => listPublicCatches(500),
  });

  const points = useMemo<CatchPoint[]>(
    () =>
      (data ?? []).map((c: CatchWithAuthor) => ({
        id: c.id,
        lng: c.lng,
        lat: c.lat,
        species: c.species,
        weight_lbs: c.weight_lbs,
        caught_at: c.caught_at,
      })),
    [data]
  );

  return (
    <div className="relative h-full w-full">
      <MapCanvas
        points={points}
        onPinClick={(p) => {
          const full = (data ?? []).find((c) => c.id === p.id) as
            | CatchWithImages
            | undefined;
          if (full) setSelected(full);
        }}
      />
      <CatchModal
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
        catchRow={selected}
        readOnly
      />
    </div>
  );
}
