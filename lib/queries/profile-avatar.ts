import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { toSupabaseError } from "@/lib/supabase/to-error";
import { parseAvatarsStoragePath } from "@/lib/utils/profile-avatar";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export function validateAvatarFile(file: File): void {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Please choose a JPG, PNG, or WebP image.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Photo must be 5MB or smaller.");
  }
}

export async function uploadProfileAvatar(
  file: File,
  userId: string,
  currentAvatarUrlOrPath: string | null,
): Promise<void> {
  validateAvatarFile(file);
  const supabase = createSupabaseBrowserClient();

  const ext =
    file.type === "image/png"
      ? "png"
      : file.type === "image/webp"
        ? "webp"
        : "jpg";
  const path = `${userId}/avatar_${Date.now()}.${ext}`;

  const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type,
  });
  if (upErr) throw toSupabaseError(upErr, "Could not upload photo");

  const oldPath = parseAvatarsStoragePath(currentAvatarUrlOrPath);
  if (oldPath) {
    await supabase.storage.from("avatars").remove([oldPath]);
  }

  const { error: updErr } = await supabase
    .from("profiles")
    .update({ avatar_url: path })
    .eq("id", userId);
  if (updErr) {
    await supabase.storage.from("avatars").remove([path]);
    throw toSupabaseError(updErr, "Could not save profile photo");
  }
}

export async function removeProfileAvatar(
  userId: string,
  currentAvatarUrlOrPath: string | null,
): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  const oldPath = parseAvatarsStoragePath(currentAvatarUrlOrPath);
  if (oldPath) {
    const { error: rmErr } = await supabase.storage.from("avatars").remove([oldPath]);
    if (rmErr) throw toSupabaseError(rmErr, "Could not remove photo file");
  }
  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: null })
    .eq("id", userId);
  if (error) throw toSupabaseError(error, "Could not update profile");
}
