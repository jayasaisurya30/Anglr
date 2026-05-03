"use client";

import type { LockFunc } from "@supabase/auth-js";
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

const processQueues = new Map<string, Promise<unknown>>();

/** In-process auth lock (not exported from newer @supabase/auth-js). Serializes GoTrue work in one tab and avoids Web Locks + Strict Mode issues in dev. */
const processLock: LockFunc = (name, _acquireTimeout, fn) => {
  const prev = processQueues.get(name) ?? Promise.resolve();
  const next = prev.then(fn);
  processQueues.set(name, next.then(() => {}, () => {}));
  return next;
};

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
