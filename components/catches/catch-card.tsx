"use client";

import { motion } from "framer-motion";
import { Fish } from "lucide-react";
import { publicImageUrl } from "@/lib/queries/catches";
import { fmtDate } from "@/lib/utils/dates";
import { Badge } from "@/components/ui/badge";
import type { CatchWithImages } from "@/lib/supabase/types";

export function CatchCard({
  catchRow,
  onClick,
}: {
  catchRow: CatchWithImages;
  onClick?: () => void;
}) {
  const cover = [...(catchRow.catch_images ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order
  )[0];

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
      className="group relative w-full text-left rounded-3xl overflow-hidden border border-white/10 bg-white/[0.025] hover:bg-white/[0.04] transition-colors shadow-panel focus:outline-none focus-visible:ring-2 focus-visible:ring-anglr-blue/40"
    >
      <div className="aspect-[4/5] w-full bg-anglr-ink relative overflow-hidden">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={publicImageUrl(cover.storage_path)}
            alt={catchRow.species ?? "Catch"}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Fish className="h-8 w-8" />
              <span className="text-xs">No photo</span>
            </div>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute left-3 top-3">
          <Badge
            variant={catchRow.visibility === "public" ? "primary" : "default"}
          >
            {catchRow.visibility}
          </Badge>
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 p-4">
        <div className="text-base font-semibold truncate">
          {catchRow.species ?? "Untitled catch"}
        </div>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
          {catchRow.weight_lbs != null ? (
            <span>{catchRow.weight_lbs} lbs</span>
          ) : null}
          <span>·</span>
          <span>{fmtDate(catchRow.caught_at, "MMM d, yyyy")}</span>
        </div>
      </div>
    </motion.button>
  );
}
