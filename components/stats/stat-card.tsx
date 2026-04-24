import { cn } from "@/lib/utils/cn";
import { type ReactNode } from "react";

export function StatCard({
  label,
  value,
  unit,
  icon,
  className,
}: {
  label: string;
  value: string | number;
  unit?: string;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025] p-6",
        className
      )}
    >
      <div className="pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full bg-anglr-blue/10 blur-3xl" />
      <div className="relative flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        {icon ? <span className="text-anglr-blue">{icon}</span> : null}
      </div>
      <div className="relative mt-3 flex items-baseline gap-1.5">
        <span className="text-3xl font-semibold tracking-tight font-display">
          {value}
        </span>
        {unit ? (
          <span className="text-sm text-muted-foreground">{unit}</span>
        ) : null}
      </div>
    </div>
  );
}
