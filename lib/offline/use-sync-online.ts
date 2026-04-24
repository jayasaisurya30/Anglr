"use client";

import { useEffect, useRef } from "react";
import { listQueued, removeQueued } from "./queue";
import { createCatch } from "@/lib/queries/catches";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Flushes queued offline catches the moment we're back online.
 * Also runs once on mount if anything is already queued.
 */
export function useSyncOnline() {
  const running = useRef(false);
  const qc = useQueryClient();

  useEffect(() => {
    async function flush() {
      if (running.current) return;
      if (typeof navigator !== "undefined" && !navigator.onLine) return;
      running.current = true;
      try {
        const queued = await listQueued();
        if (queued.length === 0) return;

        let ok = 0;
        for (const entry of queued) {
          try {
            const files = entry.files.map(
              (f) => new File([f.blob], f.name, { type: f.type })
            );
            await createCatch(entry.values, files);
            await removeQueued(entry.id);
            ok++;
          } catch {
            // Stop on first error; likely auth/network. Retry later.
            break;
          }
        }
        if (ok > 0) {
          toast.success(`Synced ${ok} queued catch${ok === 1 ? "" : "es"}`);
          qc.invalidateQueries({ queryKey: ["my-catches"] });
          qc.invalidateQueries({ queryKey: ["stats"] });
        }
      } finally {
        running.current = false;
      }
    }

    flush();
    window.addEventListener("online", flush);
    return () => window.removeEventListener("online", flush);
  }, [qc]);
}
