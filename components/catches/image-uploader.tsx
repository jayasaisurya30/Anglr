"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface ImageUploaderProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  max?: number;
  className?: string;
}

export function ImageUploader({
  files,
  onFilesChange,
  max = 6,
  className,
}: ImageUploaderProps) {
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);

  const add = useCallback(
    (list: FileList | null) => {
      if (!list) return;
      const incoming = Array.from(list).filter((f) =>
        f.type.startsWith("image/")
      );
      const next = [...files, ...incoming].slice(0, max);
      onFilesChange(next);
    },
    [files, max, onFilesChange]
  );

  const remove = useCallback(
    (index: number) => {
      const next = files.slice();
      next.splice(index, 1);
      onFilesChange(next);
    },
    [files, onFilesChange]
  );

  return (
    <div className={cn("grid grid-cols-3 gap-2", className)}>
      {previews.map((url, i) => (
        <div
          key={url}
          className="relative aspect-square overflow-hidden rounded-xl border border-white/10"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="" className="h-full w-full object-cover" />
          <button
            type="button"
            className="absolute top-1.5 right-1.5 rounded-full bg-black/60 p-1 hover:bg-black/80"
            onClick={() => remove(i)}
            aria-label="Remove image"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      {files.length < max ? (
        <label className="aspect-square flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-white/15 text-muted-foreground hover:border-white/25 hover:text-foreground cursor-pointer transition-colors">
          <Plus className="h-4 w-4" />
          <span className="text-xs">Add photo</span>
          <input
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={(e) => add(e.target.files)}
          />
        </label>
      ) : null}
    </div>
  );
}
