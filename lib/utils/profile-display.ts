import type { Profile } from "@/lib/supabase/types";

/** Display name shown in feed, comments, etc. */
export function profilePrimaryName(
  p:
    | Pick<Profile, "display_name" | "username">
    | null
    | undefined
): string {
  if (!p) return "Angler";
  const d = p.display_name?.trim();
  if (d) return d;
  return p.username?.trim() || "Angler";
}

export function profileInitials(
  p: Pick<Profile, "display_name" | "username" | "handle"> | null | undefined
): string {
  const base = profilePrimaryName(p);
  return base.slice(0, 2).toUpperCase();
}
