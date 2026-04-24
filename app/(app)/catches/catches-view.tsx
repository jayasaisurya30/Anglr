"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listMyCatches } from "@/lib/queries/catches";
import {
  CatchFilters,
  INITIAL_FILTERS,
  applyFilters,
  type FilterState,
} from "@/components/catches/catch-filters";
import { CatchCard } from "@/components/catches/catch-card";
import { CatchModal } from "@/components/catches/catch-modal";
import { EmptyState } from "@/components/common/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Fish } from "lucide-react";
import { StaggerItem, StaggerList } from "@/components/common/motion";
import type { CatchWithImages } from "@/lib/supabase/types";

export function CatchesView() {
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [selected, setSelected] = useState<CatchWithImages | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["my-catches"],
    queryFn: listMyCatches,
  });

  const species = useMemo(() => {
    const set = new Set<string>();
    (data ?? []).forEach((c) => c.species && set.add(c.species));
    return Array.from(set).sort();
  }, [data]);

  const filtered = useMemo(
    () => applyFilters(data ?? [], filters),
    [data, filters]
  );

  return (
    <div className="space-y-6">
      <CatchFilters
        speciesList={species}
        value={filters}
        onChange={setFilters}
      />

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/5] rounded-3xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Fish className="h-6 w-6" />}
          title="No catches yet"
          description="Head to the map and drop your first pin. It only takes a few seconds."
        />
      ) : (
        <StaggerList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((c) => (
            <StaggerItem key={c.id}>
              <CatchCard catchRow={c} onClick={() => setSelected(c)} />
            </StaggerItem>
          ))}
        </StaggerList>
      )}

      <CatchModal
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
        catchRow={selected}
      />
    </div>
  );
}
