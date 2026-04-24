import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { toSupabaseError } from "@/lib/supabase/to-error";
import type { CommentRow } from "@/lib/supabase/types";

export async function toggleLike(catchId: string): Promise<boolean> {
  const supabase = createSupabaseBrowserClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Sign in to like");

  const { data: existing } = await supabase
    .from("likes")
    .select("catch_id")
    .eq("catch_id", catchId)
    .eq("user_id", auth.user.id)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("likes")
      .delete()
      .eq("catch_id", catchId)
      .eq("user_id", auth.user.id);
    return false;
  }

  await supabase
    .from("likes")
    .insert({ catch_id: catchId, user_id: auth.user.id });
  return true;
}

export async function getLikeInfo(catchId: string): Promise<{
  count: number;
  liked: boolean;
}> {
  const supabase = createSupabaseBrowserClient();
  const { data: auth } = await supabase.auth.getUser();
  const [{ count }, { data: mine }] = await Promise.all([
    supabase
      .from("likes")
      .select("*", { count: "exact", head: true })
      .eq("catch_id", catchId),
    auth.user
      ? supabase
          .from("likes")
          .select("catch_id")
          .eq("catch_id", catchId)
          .eq("user_id", auth.user.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);
  return { count: count ?? 0, liked: !!mine };
}

export interface CommentWithAuthor extends CommentRow {
  author: {
    username: string;
    handle: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

export async function listComments(catchId: string): Promise<CommentWithAuthor[]> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("comments")
    .select(
      "*, author:profiles!user_id(username,handle,display_name,avatar_url)"
    )
    .eq("catch_id", catchId)
    .order("created_at", { ascending: true });
  if (error) throw toSupabaseError(error, "Failed to load comments");
  return (data as unknown as CommentWithAuthor[]) ?? [];
}

export async function addComment(catchId: string, body: string) {
  const supabase = createSupabaseBrowserClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Sign in to comment");
  const { error } = await supabase
    .from("comments")
    .insert({ catch_id: catchId, user_id: auth.user.id, body });
  if (error) throw toSupabaseError(error, "Could not add comment");
}
