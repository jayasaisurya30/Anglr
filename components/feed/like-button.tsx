"use client";

import { Heart } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getLikeInfo, toggleLike } from "@/lib/queries/social";
import { cn } from "@/lib/utils/cn";
import { motion } from "framer-motion";
import { toast } from "sonner";

export function LikeButton({ catchId }: { catchId: string }) {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["like", catchId],
    queryFn: () => getLikeInfo(catchId),
  });

  const mut = useMutation({
    mutationFn: () => toggleLike(catchId),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: ["like", catchId] });
      const prev = qc.getQueryData<{ count: number; liked: boolean }>([
        "like",
        catchId,
      ]);
      if (prev) {
        qc.setQueryData(["like", catchId], {
          count: prev.count + (prev.liked ? -1 : 1),
          liked: !prev.liked,
        });
      }
      return { prev };
    },
    onError: (e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(["like", catchId], ctx.prev);
      toast.error(e instanceof Error ? e.message : "Could not like");
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["like", catchId] }),
  });

  const liked = data?.liked ?? false;

  return (
    <button
      type="button"
      onClick={() => mut.mutate()}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors",
        liked
          ? "text-rose-400 bg-rose-400/10"
          : "text-muted-foreground hover:text-foreground hover:bg-white/[0.05]"
      )}
    >
      <motion.span animate={{ scale: liked ? [1, 1.3, 1] : 1 }}>
        <Heart className={cn("h-4 w-4", liked && "fill-rose-400")} />
      </motion.span>
      {data?.count ?? 0}
    </button>
  );
}
