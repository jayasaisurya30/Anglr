import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { toSupabaseError } from "@/lib/supabase/to-error";
import type {
  CatchImage,
  CatchRow,
  CatchWithAuthor,
  CatchWithImages,
} from "@/lib/supabase/types";
import type { CatchFormInput } from "@/lib/validators/catch";

const CATCH_WITH_IMAGES_SELECT =
  "*, catch_images(id, catch_id, storage_path, sort_order, created_at)";

export async function listMyCatches(): Promise<CatchWithImages[]> {
  const supabase = createSupabaseBrowserClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return [];
  const { data, error } = await supabase
    .from("catches")
    .select(CATCH_WITH_IMAGES_SELECT)
    .eq("user_id", auth.user.id)
    .order("caught_at", { ascending: false });
  if (error) throw toSupabaseError(error, "Failed to load catches");
  return (data as unknown as CatchWithImages[]) ?? [];
}

export async function listPublicCatches(
  limit = 50
): Promise<CatchWithAuthor[]> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("catches")
    .select(
      `*, catch_images(id, catch_id, storage_path, sort_order, created_at),
       profiles:profiles!user_id(username, handle, avatar_url, display_name)`
    )
    .eq("visibility", "public")
    .order("caught_at", { ascending: false })
    .limit(limit);
  if (error) throw toSupabaseError(error, "Failed to load catches");
  return (data as unknown as CatchWithAuthor[]) ?? [];
}

export async function createCatch(input: CatchFormInput, files: File[] = []) {
  const supabase = createSupabaseBrowserClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Not signed in");

  const { data: inserted, error } = await supabase
    .from("catches")
    .insert({
      user_id: auth.user.id,
      species: input.species || null,
      weight_lbs: input.weight_lbs ?? null,
      caught_at: input.caught_at,
      lat: input.lat,
      lng: input.lng,
      notes: input.notes || null,
      bait: input.bait || null,
      visibility: input.visibility,
    })
    .select("*")
    .single();
  if (error || !inserted) throw toSupabaseError(error, "Insert failed");

  if (files.length > 0) {
    await uploadImages(inserted.id, auth.user.id, files);
  }

  return inserted as CatchRow;
}

export async function uploadImages(
  catchId: string,
  userId: string,
  files: File[]
): Promise<CatchImage[]> {
  const supabase = createSupabaseBrowserClient();
  const uploaded: CatchImage[] = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const safe = file.name.replace(/[^a-zA-Z0-9_.-]/g, "_");
    const path = `${userId}/${catchId}/${Date.now()}_${i}_${safe}`;
    const { error: upErr } = await supabase.storage
      .from("catch-images")
      .upload(path, file, { upsert: false, contentType: file.type });
    if (upErr) throw toSupabaseError(upErr, "Upload failed");
    const { data, error } = await supabase
      .from("catch_images")
      .insert({ catch_id: catchId, storage_path: path, sort_order: i })
      .select("*")
      .single();
    if (error || !data) throw toSupabaseError(error, "Image row failed");
    uploaded.push(data as CatchImage);
  }
  return uploaded;
}

export async function updateCatch(
  id: string,
  patch: Partial<CatchFormInput>
): Promise<CatchRow> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("catches")
    .update({
      species: patch.species ?? undefined,
      weight_lbs: patch.weight_lbs ?? undefined,
      caught_at: patch.caught_at ?? undefined,
      lat: patch.lat ?? undefined,
      lng: patch.lng ?? undefined,
      notes: patch.notes ?? undefined,
      bait: patch.bait ?? undefined,
      visibility: patch.visibility ?? undefined,
    })
    .eq("id", id)
    .select("*")
    .single();
  if (error || !data) throw toSupabaseError(error, "Update failed");
  return data as CatchRow;
}

export async function deleteCatch(id: string) {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.from("catches").delete().eq("id", id);
  if (error) throw toSupabaseError(error, "Delete failed");
}

export function publicImageUrl(storagePath: string): string {
  const supabase = createSupabaseBrowserClient();
  const { data } = supabase.storage
    .from("catch-images")
    .getPublicUrl(storagePath);
  return data.publicUrl;
}
