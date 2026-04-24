"use client";

import { processLock } from "@supabase/auth-js";
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

/**
 * Browser auth uses the Web Locks API by default. In Next.js dev that interacts
 * badly with Strict Mode, Fast Refresh, and cross-tab BroadcastChannel — other
 * clients can "steal" the lock and GoTrue throws. `processLock` serializes auth
 * work in-process only, which is enough for a single-tab app and avoids those
 * crashes. (Multi-tab refresh races are a minor tradeoff.)
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        lock: processLock,
      },
    }
  );
}
