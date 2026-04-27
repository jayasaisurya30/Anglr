import { createSupabaseBrowserClient } from "@/lib/supabase/client";

/**
 * `profiles.avatar_url` stores either a storage path (`{userId}/avatar_….jpg`)
 * or a legacy full `https://…` URL. This returns a browser-loadable URL.
 */
export function resolveProfileAvatarSrc(
  avatarUrlOrPath: string | null | undefined,
): string | undefined {
  if (!avatarUrlOrPath?.trim()) return undefined;
  const v = avatarUrlOrPath.trim();
  if (/^https?:\/\//i.test(v)) return v;
  const supabase = createSupabaseBrowserClient();
  const { data } = supabase.storage.from("avatars").getPublicUrl(v);
  return data.publicUrl;
}

/** Extract `avatars` object path for delete/replace (null if not our bucket / invalid). */
export function parseAvatarsStoragePath(
  avatarUrlOrPath: string | null | undefined,
): string | null {
  if (!avatarUrlOrPath?.trim()) return null;
  const v = avatarUrlOrPath.trim();
  if (/^https?:\/\//i.test(v)) {
    try {
      const u = new URL(v);
      const segments = u.pathname.split("/").filter(Boolean);
      const idx = segments.indexOf("avatars");
      if (idx === -1 || idx >= segments.length - 1) return null;
      return segments.slice(idx + 1).join("/");
    } catch {
      return null;
    }
  }
  if (v.includes("..") || v.startsWith("/")) return null;
  return v;
}
