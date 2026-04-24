"use client";

import { useQuery } from "@tanstack/react-query";
import { listPublicCatches } from "@/lib/queries/catches";
import { FeedItem } from "@/components/feed/feed-item";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/empty-state";
import { StaggerList, StaggerItem } from "@/components/common/motion";

export function FeedView() {
  const { data, isLoading } = useQuery({
    queryKey: ["public-feed"],
    queryFn: () => listPublicCatches(60),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-80 rounded-3xl" />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        title="No public catches yet"
        description="Be the first to post one from the map tab."
      />
    );
  }

  return (
    <StaggerList className="space-y-4">
      {data.map((c) => (
        <StaggerItem key={c.id}>
          <FeedItem catchRow={c} />
        </StaggerItem>
      ))}
    </StaggerList>
  );
}
