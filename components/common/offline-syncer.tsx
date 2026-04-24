"use client";

import { useSyncOnline } from "@/lib/offline/use-sync-online";

/**
 * Mount point for the offline-queue syncer. Renders nothing; side-effects only.
 */
export function OfflineSyncer() {
  useSyncOnline();
  return null;
}
