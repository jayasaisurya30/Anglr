"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  getFollowState,
  sendFollowRequest,
  unfollow,
  type FollowState,
} from "@/lib/queries/follows";
import { toast } from "sonner";
import { Check, UserMinus, UserPlus, Clock } from "lucide-react";

export function FollowButton({
  userId,
  size = "sm",
}: {
  userId: string;
  size?: "sm" | "default";
}) {
  const qc = useQueryClient();
  const { data: state, isLoading } = useQuery({
    queryKey: ["follow-state", userId],
    queryFn: () => getFollowState(userId),
  });

  const requestMut = useMutation({
    mutationFn: () => sendFollowRequest(userId),
    onSuccess: () => {
      toast.success("Follow request sent");
      qc.invalidateQueries({ queryKey: ["follow-state", userId] });
      qc.invalidateQueries({ queryKey: ["outgoing-requests"] });
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : "Could not send request"),
  });

  const unfollowMut = useMutation({
    mutationFn: () => unfollow(userId),
    onSuccess: () => {
      toast.success("Unfollowed");
      qc.invalidateQueries({ queryKey: ["follow-state", userId] });
      qc.invalidateQueries({ queryKey: ["following"] });
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : "Could not unfollow"),
  });

  if (!state || state === "self") return null;

  const label: Record<FollowState, string> = {
    self: "",
    none: "Follow",
    requested: "Requested",
    following: "Following",
    mutual: "Friends",
  };

  const icon: Partial<Record<FollowState, React.ReactNode>> = {
    none: <UserPlus />,
    requested: <Clock />,
    following: <Check />,
    mutual: <Check />,
  };

  const disabled = isLoading || requestMut.isPending || unfollowMut.isPending;

  if (state === "none") {
    return (
      <Button
        size={size}
        variant="primary"
        disabled={disabled}
        onClick={() => requestMut.mutate()}
      >
        {icon.none} {label.none}
      </Button>
    );
  }
  if (state === "requested") {
    return (
      <Button size={size} variant="secondary" disabled>
        {icon.requested} {label.requested}
      </Button>
    );
  }
  return (
    <Button
      size={size}
      variant="secondary"
      disabled={disabled}
      onClick={() => unfollowMut.mutate()}
      className="group"
    >
      <span className="group-hover:hidden inline-flex items-center gap-2">
        {icon[state]} {label[state]}
      </span>
      <span className="hidden group-hover:inline-flex items-center gap-2 text-red-300">
        <UserMinus /> Unfollow
      </span>
    </Button>
  );
}
