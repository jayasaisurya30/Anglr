import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { toSupabaseError } from "@/lib/supabase/to-error";

function baseFromEmail(email: string | null) {
  const raw = email?.split("@")[0]?.trim() || "angler";
  const slug = raw.toLowerCase().replace(/[^a-z0-9_]/g, "");
  return (slug.length >= 2 ? slug : "angler").slice(0, 20);
}

function isUniqueViolation(err: unknown) {
  const e = err as { code?: string; message?: string };
  return e?.code === "23505" || /duplicate key|unique constraint/i.test(e?.message ?? "");
}

type UserMeta = {
  username?: string;
  handle?: string;
  display_name?: string;
  full_name?: string;
  name?: string;
};

function readSignupMeta(user: { user_metadata?: UserMeta } | null): {
  username: string | null;
  handle: string | null;
  displayName: string | null;
} {
  const m = user?.user_metadata;
  if (!m) return { username: null, handle: null, displayName: null };
  const username = typeof m.username === "string" ? m.username.trim() : null;
  const handle =
    typeof m.handle === "string" ? m.handle.toLowerCase().trim() : null;
  const fromDisplay =
    typeof m.display_name === "string" ? m.display_name.trim() : "";
  const fromFull =
    typeof m.full_name === "string" ? m.full_name.trim() : "";
  const fromName = typeof m.name === "string" ? m.name.trim() : "";
  const displayName = (fromDisplay || fromFull || fromName) || null;
  return { username, handle, displayName };
}

/**
 * Creates profiles + settings when the DB trigger did not run.
 * Prefers username / handle from auth signup metadata when present.
 * Uses RPC (security definer) so RLS on `profiles` insert is not required.
 */
export async function bootstrapProfile(userId: string, email: string | null) {
  const supabase = createSupabaseBrowserClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser || authUser.id !== userId) {
    throw new Error("Session mismatch. Sign in again.");
  }

  const meta = readSignupMeta(authUser);
  const emailBase = baseFromEmail(email ?? authUser.email ?? null);

  const tryRpc = async (username: string, handle: string, displayName: string) => {
    const { error } = await (
      supabase as unknown as {
        rpc(
          name: string,
          args: {
            p_username: string;
            p_handle: string;
            p_display_name: string;
          },
        ): Promise<{ error: Error | null }>;
      }
    ).rpc("ensure_my_profile", {
      p_username: username,
      p_handle: handle,
      p_display_name: displayName,
    });
    if (error) throw error;
  };

  const preferredUsername = meta.username?.length ? meta.username : null;
  const preferredHandle = meta.handle?.length ? meta.handle : null;
  const preferredDisplay =
    meta.displayName && meta.displayName.length > 0
      ? meta.displayName
      : preferredUsername && preferredUsername.length > 0
        ? preferredUsername
        : emailBase;

  const baseUsername = preferredUsername ?? emailBase;
  const baseHandle = (preferredHandle ?? emailBase).slice(0, 24);

  for (let i = 0; i < 30; i++) {
    const suffix = i === 0 ? "" : String(Math.floor(Math.random() * 90) + 10);
    const username = `${baseUsername}${suffix}`.slice(0, 32);
    const handle = `${baseHandle}${suffix}`.slice(0, 24).toLowerCase();
    const displayName =
      (preferredDisplay || username).slice(0, 120);

    try {
      await tryRpc(username, handle, displayName);
      return;
    } catch (e) {
      if (isUniqueViolation(e)) continue;
      throw toSupabaseError(e as never, "Could not create profile");
    }
  }

  throw new Error("Could not allocate a unique handle. Try again.");
}
