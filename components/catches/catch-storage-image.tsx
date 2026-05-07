"use client";

import { useEffect, useState } from "react";
import { Fish } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { resolveCatchImageUrl } from "@/lib/queries/catches";

type Status = "loading" | "ready" | "error";

/**
 * Loads catch bucket images via signed URL (works for private buckets) with
 * public-URL fallback. Parent should be `relative` + sized when using `absolute` fill.
 */
export function CatchStorageImage({
  storagePath,
  alt,
  /** Applied to the img (e.g. object-cover, hover scale). */
  imageClassName,
  /** When true, image fills parent via absolute inset-0 (parent must be relative + overflow-hidden). */
  fill,
}: {
  storagePath: string;
  alt: string;
  imageClassName?: string;
  fill?: boolean;
}) {
  const [src, setSrc] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    setSrc(null);
    void resolveCatchImageUrl(storagePath).then((url) => {
      if (cancelled) return;
      if (url) {
        setSrc(url);
        setStatus("ready");
      } else {
        setStatus("error");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [storagePath]);

  const fillCls = fill ? "absolute inset-0 h-full w-full" : "h-full w-full";

  if (status === "loading") {
    return (
      <div
        className={cn(
          fillCls,
          "animate-pulse bg-white/[0.06]",
          !fill && "min-h-[120px]",
          imageClassName
        )}
        aria-hidden
      />
    );
  }

  if (status === "error" || !src) {
    return (
      <div
        className={cn(
          fillCls,
          "flex flex-col items-center justify-center gap-2 bg-anglr-ink/90 text-muted-foreground",
        )}
      >
        <Fish className="h-8 w-8 opacity-60" aria-hidden />
        <span className="text-xs opacity-80">Photo unavailable</span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- blob/signed Supabase URLs
    <img
      src={src}
      alt={alt}
      className={cn(fillCls, "object-cover", imageClassName)}
      onError={() => setStatus("error")}
    />
  );
}
