"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { toSupabaseError } from "@/lib/supabase/to-error";
import type { NotificationRow } from "@/lib/supabase/types";
import { toast } from "sonner";

export interface EnrichedNotification extends NotificationRow {
  actor?: {
    username: string;
    handle: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

export function useRealtimeNotifications(userId: string | undefined) {
  const queryClient = useQueryClient();
  const [connected, setConnected] = useState(false);

  const query = useQuery({
    queryKey: ["notifications", userId],
    enabled: !!userId,
    queryFn: async (): Promise<EnrichedNotification[]> => {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("notifications")
        .select(
          "*, actor:profiles!actor_id(username,handle,display_name,avatar_url)"
        )
        .eq("user_id", userId!)
        .order("created_at", { ascending: false })
        .limit(30);
      if (error) throw toSupabaseError(error, "Failed to load notifications");
      return (data as unknown as EnrichedNotification[]) ?? [];
    },
  });

  useEffect(() => {
    if (!userId) return;
    const supabase = createSupabaseBrowserClient();
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const row = payload.new as NotificationRow;
          queryClient.invalidateQueries({ queryKey: ["notifications", userId] });
          toast(describe(row.type), {
            description: "You have a new notification",
          });
        }
      )
      .subscribe((status) => setConnected(status === "SUBSCRIBED"));

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);

  const unread = (query.data ?? []).filter((n) => !n.read_at).length;

  return { ...query, unread, connected };
}

function describe(type: NotificationRow["type"]) {
  switch (type) {
    case "follow_request":
      return "New follow request";
    case "follow_accept":
      return "Follow request accepted";
    case "like":
      return "Someone liked your catch";
    case "comment":
      return "New comment on your catch";
    default:
      return "Notification";
  }
}
