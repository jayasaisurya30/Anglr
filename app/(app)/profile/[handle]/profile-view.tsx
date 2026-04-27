"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { FollowButton } from "@/components/friends/follow-button";
import { getFollowCounts } from "@/lib/queries/follows";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { toSupabaseError } from "@/lib/supabase/to-error";
import type { CatchWithImages, Profile } from "@/lib/supabase/types";
import { resolveProfileAvatarSrc } from "@/lib/utils/profile-avatar";
import { CatchCard } from "@/components/catches/catch-card";
import { CatchModal } from "@/components/catches/catch-modal";
import { EmptyState } from "@/components/common/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { StaggerItem, StaggerList } from "@/components/common/motion";
import { Fish } from "lucide-react";

export function ProfileView({
  profile,
  isMe,
}: {
  profile: Profile;
  isMe: boolean;
}) {
  const counts = useQuery({
    queryKey: ["follow-counts", profile.id],
    queryFn: () => getFollowCounts(profile.id),
    retry: 1,
  });

  const catches = useQuery({
    queryKey: ["profile-catches", profile.id],
    retry: 1,
    queryFn: async (): Promise<CatchWithImages[]> => {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("catches")
        .select(
          "*, catch_images(id, catch_id, storage_path, sort_order, created_at)"
        )
        .eq("user_id", profile.id)
        .order("caught_at", { ascending: false })
        .limit(36);
      if (error) throw toSupabaseError(error, "Failed to load catches");
      return (data as unknown as CatchWithImages[]) ?? [];
    },
  });

  const [selected, setSelected] = useState<CatchWithImages | null>(null);

  const biggest = useMemo(() => {
    let max = 0;
    (catches.data ?? []).forEach((c) => {
      if ((c.weight_lbs ?? 0) > max) max = c.weight_lbs ?? 0;
    });
    return max;
  }, [catches.data]);

  const initials = (profile.display_name ?? profile.username ?? "A")
    .slice(0, 2)
    .toUpperCase();
  const avatarSrc = resolveProfileAvatarSrc(profile.avatar_url);

  const loadError =
    counts.isError || catches.isError ? (
      <div className="mb-6 rounded-2xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-muted-foreground">
        {counts.isError
          ? `Could not load stats: ${counts.error instanceof Error ? counts.error.message : "error"}. `
          : null}
        {catches.isError
          ? `Could not load catches: ${catches.error instanceof Error ? catches.error.message : "error"}.`
          : null}
      </div>
    ) : null;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      {loadError}
      <div className="rounded-[32px] border border-white/10 bg-white/[0.025] p-8 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 -top-40 h-80 bg-[radial-gradient(ellipse_at_top,rgba(77,163,255,0.2),transparent_60%)]" />
        <div className="relative flex flex-col md:flex-row md:items-center gap-6">
          <Avatar className="h-24 w-24 ring-4 ring-white/10">
            {avatarSrc ? <AvatarImage src={avatarSrc} alt="" /> : null}
            <AvatarFallback className="text-xl">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-display font-semibold tracking-tight">
              {profile.display_name ?? profile.username}
            </h1>
            <div className="text-muted-foreground">@{profile.handle}</div>
            {profile.bio ? (
              <p className="mt-2 text-sm text-muted-foreground max-w-xl">
                {profile.bio}
              </p>
            ) : null}
            <div className="mt-5 flex items-center gap-5 text-sm">
              <Stat label="Catches" value={counts.data?.catches ?? 0} />
              <Separator orientation="vertical" className="h-7" />
              <Stat label="Followers" value={counts.data?.followers ?? 0} />
              <Separator orientation="vertical" className="h-7" />
              <Stat label="Following" value={counts.data?.following ?? 0} />
              <Separator orientation="vertical" className="h-7" />
              <Stat
                label="Biggest"
                value={biggest ? `${biggest.toFixed(2)} lbs` : "—"}
              />
            </div>
          </div>
          <div>{!isMe ? <FollowButton userId={profile.id} size="default" /> : null}</div>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
          Recent catches
        </h2>
        {catches.isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/5] rounded-3xl" />
            ))}
          </div>
        ) : (catches.data ?? []).length === 0 ? (
          <EmptyState
            icon={<Fish className="h-6 w-6" />}
            title="No catches visible"
            description={
              isMe
                ? "Log your first catch from the Map tab."
                : "Nothing to show yet."
            }
          />
        ) : (
          <StaggerList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {(catches.data ?? []).map((c) => (
              <StaggerItem key={c.id}>
                <CatchCard catchRow={c} onClick={() => setSelected(c)} />
              </StaggerItem>
            ))}
          </StaggerList>
        )}
      </div>

      <CatchModal
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
        catchRow={selected}
        readOnly={!isMe}
        ownerProfile={!isMe ? profile : undefined}
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-foreground font-semibold text-base">{value}</div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
    </div>
  );
}
