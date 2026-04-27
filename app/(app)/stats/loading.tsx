import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-8 space-y-6">
      <Skeleton className="h-10 w-40" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Skeleton className="h-28 rounded-3xl" />
        <Skeleton className="h-28 rounded-3xl" />
        <Skeleton className="h-28 rounded-3xl" />
      </div>
      <Skeleton className="h-[22rem] md:h-[26rem] rounded-3xl" />
      <Skeleton className="h-[440px] rounded-3xl" />
    </div>
  );
}
