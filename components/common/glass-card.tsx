import { cn } from "@/lib/utils/cn";
import { type HTMLAttributes, forwardRef } from "react";

export const GlassCard = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-panel",
      className
    )}
    {...props}
  />
));
GlassCard.displayName = "GlassCard";
