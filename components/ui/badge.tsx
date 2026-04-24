import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default:
          "bg-white/[0.06] text-foreground border-white/10",
        primary:
          "bg-anglr-blue/15 text-anglr-blue border-anglr-blue/30",
        success: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
        warn: "bg-amber-500/15 text-amber-300 border-amber-500/25",
        outline: "text-foreground border-white/15",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
