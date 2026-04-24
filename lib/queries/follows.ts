import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { toSupabaseError } from "@/lib/supabase/to-error";
import type { FollowRequest, Profile } from "@/lib/supabase/types";

export interface ProfileLite {
  id: string;
  username: string;
  handle: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
}

async function currentUserId() {
  const supabase = createSupabaseBrowserClient();
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

export async function searchUsers(q: string): Promise<ProfileLite[]> {
  const supabase = createSupabaseBrowserClient();
  const me = await currentUserId();
  const term = q.trim().replace(/^@/, "");
  if (term.length === 0) return [];
  const { data, error } = await supabase
    .from("profiles")
    .select("id,username,handle,display_name,avatar_url,bio")
    .or(`handle.ilike.%${term}%,username.ilike.%${term}%`)
    .limit(20);
  if (error) throw toSupabaseError(error, "Request failed");
  return (data ?? []).filter((p) => p.id !== me) as ProfileLite[];
}

export async function listFollowers(): Promise<ProfileLite[]> {
  const supabase = createSupabaseBrowserClient();
  const me = await currentUserId();
  if (!me) return [];
  const { data, error } = await supabase
    .from("follows")
    .select(
      "follower:profiles!follower_id(id,username,handle,display_name,avatar_url,bio)"
    )
    .eq("following_id", me);
  if (error) throw toSupabaseError(error, "Request failed");
  return ((data ?? []) as unknown as Array<{ follower: ProfileLite }>).map(
    (r) => r.follower
  );
}

export async function listFollowing(): Promise<ProfileLite[]> {
  const supabase = createSupabaseBrowserClient();
  const me = await currentUserId();
  if (!me) return [];
  const { data, error } = await supabase
    .from("follows")
    .select(
      "following:profiles!following_id(id,username,handle,display_name,avatar_url,bio)"
    )
    .eq("follower_id", me);
  if (error) throw toSupabaseError(error, "Request failed");
  return ((data ?? []) as unknown as Array<{ following: ProfileLite }>).map(
    (r) => r.following
  );
}

export interface IncomingRequest extends FollowRequest {
  from_profile: ProfileLite | null;
}

export interface OutgoingRequest extends FollowRequest {
  to_profile: ProfileLite | null;
}

export async function listIncomingRequests(): Promise<IncomingRequest[]> {
  const supabase = createSupabaseBrowserClient();
  const me = await currentUserId();
  if (!me) return [];
  const { data, error } = await supabase
    .from("follow_requests")
    .select(
      "*, from_profile:profiles!from_user(id,username,handle,display_name,avatar_url,bio)"
    )
    .eq("to_user", me)
    .eq("status", "pending")
    .order("created_at", { ascending: false });
  if (error) throw toSupabaseError(error, "Request failed");
  return (data ?? []) as unknown as IncomingRequest[];
}

export async function listOutgoingRequests(): Promise<OutgoingRequest[]> {
  const supabase = createSupabaseBrowserClient();
  const me = await currentUserId();
  if (!me) return [];
  const { data, error } = await supabase
    .from("follow_requests")
    .select(
      "*, to_profile:profiles!to_user(id,username,handle,display_name,avatar_url,bio)"
    )
    .eq("from_user", me)
    .eq("status", "pending")
    .order("created_at", { ascending: false });
  if (error) throw toSupabaseError(error, "Request failed");
  return (data ?? []) as unknown as OutgoingRequest[];
}

export async function sendFollowRequest(toUserId: string) {
  const supabase = createSupabaseBrowserClient();
  const me = await currentUserId();
  if (!me) throw new Error("Not signed in");
  const { error } = await supabase
    .from("follow_requests")
    .insert({ from_user: me, to_user: toUserId, status: "pending" });
  if (error) throw toSupabaseError(error, "Request failed");
}

export async function respondToRequest(
  requestId: string,
  status: "accepted" | "declined"
) {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase
    .from("follow_requests")
    .update({ status, responded_at: new Date().toISOString() })
    .eq("id", requestId);
  if (error) throw toSupabaseError(error, "Request failed");
}

export async function cancelFollowRequest(requestId: string) {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase
    .from("follow_requests")
    .delete()
    .eq("id", requestId);
  if (error) throw toSupabaseError(error, "Request failed");
}

export async function unfollow(userId: string) {
  const supabase = createSupabaseBrowserClient();
  const me = await currentUserId();
  if (!me) throw new Error("Not signed in");
  const { error } = await supabase
    .from("follows")
    .delete()
    .eq("follower_id", me)
    .eq("following_id", userId);
  if (error) throw toSupabaseError(error, "Request failed");
}

export type FollowState =
  | "self"
  | "none"
  | "requested"
  | "following"
  | "mutual";

export async function getFollowState(targetUserId: string): Promise<FollowState> {
  const supabase = createSupabaseBrowserClient();
  const me = await currentUserId();
  if (!me) return "none";
  if (me === targetUserId) return "self";

  const [{ data: outgoing }, { data: reqs }, { data: theyFollowMe }] =
    await Promise.all([
      supabase
        .from("follows")
        .select("follower_id")
        .eq("follower_id", me)
        .eq("following_id", targetUserId)
        .maybeSingle(),
      supabase
        .from("follow_requests")
        .select("id,status")
        .eq("from_user", me)
        .eq("to_user", targetUserId)
        .eq("status", "pending")
        .maybeSingle(),
      supabase
        .from("follows")
        .select("follower_id")
        .eq("follower_id", targetUserId)
        .eq("following_id", me)
        .maybeSingle(),
    ]);

  if (outgoing) return theyFollowMe ? "mutual" : "following";
  if (reqs) return "requested";
  return "none";
}

export async function getProfileByHandle(
  handle: string
): Promise<Profile | null> {
  const supabase = createSupabaseBrowserClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("handle", handle)
    .maybeSingle();
  return (data as Profile | null) ?? null;
}

export async function getFollowCounts(userId: string) {
  const supabase = createSupabaseBrowserClient();
  const [{ count: followers }, { count: following }, { count: catches }] =
    await Promise.all([
      supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", userId),
      supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", userId),
      supabase
        .from("catches")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId),
    ]);
  return {
    followers: followers ?? 0,
    following: following ?? 0,
    catches: catches ?? 0,
  };
}
