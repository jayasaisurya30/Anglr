import { cn } from "@/lib/utils/cn";
import { type ReactNode } from "react";

export function PageHeader({
  title,
  description,
  action,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-8",
        className
      )}
    >
      <div className="space-y-1.5">
        <h1 className="text-3xl font-semibold tracking-tight font-display text-balance">
          {title}
        </h1>
        {description ? (
          <p className="text-sm text-muted-foreground max-w-2xl">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="flex items-center gap-2">{action}</div> : null}
    </div>
  );
}
