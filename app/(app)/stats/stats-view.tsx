"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/stats/stat-card";
import { MonthlyCatches } from "@/components/stats/monthly-catches";
import { SpeciesPie } from "@/components/stats/species-pie";
import { listMyCatches } from "@/lib/queries/catches";
import {
  monthlyCatches,
  speciesBreakdown,
  summarize,
} from "@/lib/queries/stats";
import { Fish, Scale, Trophy } from "lucide-react";

const PersonalHeatmap = dynamic(
  () => import("@/components/stats/personal-heatmap").then((m) => m.PersonalHeatmap),
  { ssr: false, loading: () => <Skeleton className="h-[440px] rounded-3xl" /> }
);

export function StatsView() {
  const { data, isLoading } = useQuery({
    queryKey: ["my-catches"],
    queryFn: listMyCatches,
  });

  const summary = useMemo(() => summarize(data ?? []), [data]);
  const months = useMemo(() => monthlyCatches(data ?? []), [data]);
  const species = useMemo(() => speciesBreakdown(data ?? []), [data]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-28 rounded-3xl" />
          <Skeleton className="h-28 rounded-3xl" />
          <Skeleton className="h-28 rounded-3xl" />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <Skeleton className="h-80 rounded-3xl" />
          <Skeleton className="h-80 rounded-3xl" />
        </div>
        <Skeleton className="h-[440px] rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Total catches"
          value={summary.total}
          icon={<Fish className="h-4 w-4" />}
        />
        <StatCard
          label="Biggest fish"
          value={summary.biggest ? summary.biggest.toFixed(2) : "—"}
          unit={summary.biggest ? "lbs" : undefined}
          icon={<Trophy className="h-4 w-4" />}
        />
        <StatCard
          label="Total weight"
          value={summary.totalWeight ? summary.totalWeight.toFixed(1) : "—"}
          unit={summary.totalWeight ? "lbs" : undefined}
          icon={<Scale className="h-4 w-4" />}
        />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <MonthlyCatches data={months} />
        <SpeciesPie data={species} />
      </div>
      <PersonalHeatmap catches={data ?? []} />
    </div>
  );
}
