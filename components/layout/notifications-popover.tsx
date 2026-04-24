"use client";

import { Bell, Check, Heart, MessageSquare, UserPlus } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useRealtimeNotifications,
  type EnrichedNotification,
} from "@/hooks/use-realtime-notifications";
import { useUser } from "@/hooks/use-user";
import { fmtRelative } from "@/lib/utils/dates";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import type { NotificationType } from "@/lib/supabase/types";
import { useQueryClient } from "@tanstack/react-query";
import { profilePrimaryName } from "@/lib/utils/profile-display";

export function NotificationsPopover() {
  const { user } = useUser();
  const { data, unread } = useRealtimeNotifications(user?.id);
  const qc = useQueryClient();

  async function markAllRead() {
    if (!user) return;
    const supabase = createSupabaseBrowserClient();
    await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .is("read_at", null);
    qc.invalidateQueries({ queryKey: ["notifications", user.id] });
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          aria-label="Notifications"
          className="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/[0.05] transition"
        >
          <Bell className="h-[18px] w-[18px] text-foreground" />
          {unread > 0 ? (
            <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-anglr-blue px-1 text-[10px] font-semibold text-white">
              {unread > 9 ? "9+" : unread}
            </span>
          ) : null}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <div className="text-sm font-medium">Notifications</div>
          {unread > 0 ? (
            <Button
              size="sm"
              variant="ghost"
              onClick={markAllRead}
              className="h-7 px-2"
            >
              <Check className="h-3.5 w-3.5" /> Mark all read
            </Button>
          ) : null}
        </div>
        <ScrollArea className="h-[360px]">
          {!data || data.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-muted-foreground">
              You&apos;re all caught up.
            </div>
          ) : (
            <ul className="divide-y divide-white/5">
              {data.map((n) => (
                <NotificationItem key={n.id} n={n} />
              ))}
            </ul>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

function NotificationItem({ n }: { n: EnrichedNotification }) {
  const { icon: Icon, label } = describe(n.type);
  const who = n.actor
    ? `${profilePrimaryName(n.actor)} (@${n.actor.handle})`
    : "Someone";

  return (
    <li
      className={cn(
        "flex items-start gap-3 px-4 py-3 hover:bg-white/[0.03] transition",
        !n.read_at && "bg-anglr-blue/[0.04]"
      )}
    >
      <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.05] text-anglr-blue">
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm">
          <span className="font-medium text-foreground">{who}</span>{" "}
          <span className="text-muted-foreground">{label}</span>
        </div>
        <div className="text-xs text-muted-foreground mt-0.5">
          {fmtRelative(n.created_at)}
        </div>
      </div>
      {!n.read_at ? (
        <span className="mt-2 h-2 w-2 rounded-full bg-anglr-blue" />
      ) : null}
    </li>
  );
}

function describe(type: NotificationType) {
  switch (type) {
    case "follow_request":
      return { icon: UserPlus, label: "sent you a follow request" };
    case "follow_accept":
      return { icon: UserPlus, label: "accepted your follow request" };
    case "like":
      return { icon: Heart, label: "liked your catch" };
    case "comment":
      return { icon: MessageSquare, label: "commented on your catch" };
    default:
      return { icon: Bell, label: "did something" };
  }
}
