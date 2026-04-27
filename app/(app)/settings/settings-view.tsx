"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/hooks/use-user";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { toSupabaseError } from "@/lib/supabase/to-error";
import { bootstrapProfile } from "@/lib/queries/bootstrap-profile";
import { ProfilePhotoField } from "@/components/settings/profile-photo-field";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import type { Settings } from "@/lib/supabase/types";
import { Skeleton } from "@/components/ui/skeleton";
import { LogOut, AlertCircle, Loader2 } from "lucide-react";

export function SettingsView() {
  const { user, loading, error: userError, refreshUser } = useUser();
  const qc = useQueryClient();

  const settings = useQuery({
    enabled: !!user?.id && !!user.profile,
    queryKey: ["settings", user?.id],
    queryFn: async (): Promise<Settings> => {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw toSupabaseError(error, "Failed to load settings");
      if (data) return data as Settings;

      const { error: insErr } = await supabase
        .from("settings")
        .insert({ user_id: user!.id });
      if (insErr) throw toSupabaseError(insErr, "Failed to initialize settings");

      const { data: created, error: readErr } = await supabase
        .from("settings")
        .select("*")
        .eq("user_id", user!.id)
        .single();
      if (readErr || !created) {
        throw toSupabaseError(
          readErr ?? new Error("missing row"),
          "Failed to load settings"
        );
      }
      return created as Settings;
    },
  });

  const updateSettings = useMutation({
    mutationFn: async (patch: Partial<Settings>) => {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.from("settings").upsert(
        { user_id: user!.id, ...patch },
        { onConflict: "user_id" }
      );
      if (error) throw toSupabaseError(error, "Could not save");
    },
    onSuccess: () => {
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: ["settings", user?.id] });
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : "Could not save"),
  });

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  useEffect(() => {
    if (user?.profile) {
      setDisplayName(user.profile.display_name ?? "");
      setBio(user.profile.bio ?? "");
    }
  }, [user?.profile]);

  const updateProfile = useMutation({
    mutationFn: async () => {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase
        .from("profiles")
        .update({ display_name: displayName || null, bio: bio || null })
        .eq("id", user!.id);
      if (error) throw toSupabaseError(error, "Could not update profile");
    },
    onSuccess: () => {
      toast.success("Profile updated");
      void refreshUser();
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : "Could not update"),
  });

  const createProfile = useMutation({
    mutationFn: async () => {
      await bootstrapProfile(user!.id, user!.email);
    },
    onSuccess: async () => {
      toast.success("Profile ready");
      await refreshUser();
      qc.invalidateQueries({ queryKey: ["settings", user?.id] });
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : "Could not create profile"),
  });

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 rounded-3xl" />
        <Skeleton className="h-40 rounded-3xl" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-8 text-center space-y-4">
        <p className="text-sm text-muted-foreground">
          You are signed out or the session could not be loaded.
        </p>
        <Button variant="primary" asChild>
          <Link href="/login">Sign in</Link>
        </Button>
      </div>
    );
  }

  if (!user.profile) {
    return (
      <div className="space-y-6">
        {userError ? (
          <div className="flex gap-3 rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4 text-sm">
            <AlertCircle className="h-5 w-5 shrink-0 text-amber-400" />
            <div>
              <div className="font-medium text-foreground">Profile lookup failed</div>
              <p className="mt-1 text-muted-foreground">{userError}</p>
            </div>
          </div>
        ) : null}
        <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-6">
          <h2 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">
            Finish setup
          </h2>
          <p className="text-sm text-muted-foreground mb-4 max-w-lg">
            No profile row is linked to your account yet (this often happens if
            the database was reset or the signup trigger did not run). Create
            one to use Profile, Settings, and the rest of the app.
          </p>
          <Button
            variant="primary"
            disabled={createProfile.isPending}
            onClick={() => createProfile.mutate()}
          >
            {createProfile.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Creating…
              </>
            ) : (
              "Create my profile"
            )}
          </Button>
        </section>
      </div>
    );
  }

  if (settings.isError) {
    return (
      <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-6 text-sm">
        <div className="font-medium">Could not load settings</div>
        <p className="mt-2 text-muted-foreground">
          {settings.error instanceof Error
            ? settings.error.message
            : "Unknown error"}
        </p>
        <Button
          variant="secondary"
          size="sm"
          className="mt-4"
          onClick={() => settings.refetch()}
        >
          Try again
        </Button>
      </div>
    );
  }

  const s = settings.data;

  return (
    <div className="space-y-6">
      {settings.isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-40 rounded-3xl" />
          <Skeleton className="h-40 rounded-3xl" />
        </div>
      ) : null}

      {!settings.isLoading ? (
        <>
          <Section title="Profile">
            <div className="grid gap-3">
              <ProfilePhotoField
                userId={user.id}
                profile={user.profile}
                onUpdated={() => void refreshUser()}
              />
              <Separator className="my-1" />
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Username</Label>
                  <Input value={user.profile.username} disabled />
                </div>
                <div className="space-y-1.5">
                  <Label>Handle</Label>
                  <Input value={`@${user.profile.handle}`} disabled />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="display_name">Display name</Label>
                <Input
                  id="display_name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Say something about the waters you love..."
                />
              </div>
              <div>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={updateProfile.isPending}
                  onClick={() => updateProfile.mutate()}
                >
                  Save profile
                </Button>
              </div>
            </div>
          </Section>

          <Section title="Privacy">
            <Row
              label="Share private map with friends"
              desc="Mutuals can see catches marked private. Per-catch sharing still applies."
              control={
                <Switch
                  checked={!!s?.share_private_map}
                  disabled={!s}
                  onCheckedChange={(v) =>
                    updateSettings.mutate({ share_private_map: v })
                  }
                />
              }
            />
          </Section>

          <Section title="Notifications">
            <Row
              label="Likes"
              desc="Alert me when someone likes my catch."
              control={
                <Switch
                  checked={s?.notify_likes ?? true}
                  disabled={!s}
                  onCheckedChange={(v) =>
                    updateSettings.mutate({ notify_likes: v })
                  }
                />
              }
            />
            <Separator className="my-4" />
            <Row
              label="Comments"
              desc="Alert me on new comments."
              control={
                <Switch
                  checked={s?.notify_comments ?? true}
                  disabled={!s}
                  onCheckedChange={(v) =>
                    updateSettings.mutate({ notify_comments: v })
                  }
                />
              }
            />
            <Separator className="my-4" />
            <Row
              label="Follow requests"
              desc="Alert me when someone wants to follow."
              control={
                <Switch
                  checked={s?.notify_follows ?? true}
                  disabled={!s}
                  onCheckedChange={(v) =>
                    updateSettings.mutate({ notify_follows: v })
                  }
                />
              }
            />
          </Section>

          <Section title="Account" destructive>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm">Sign out</div>
                <div className="text-xs text-muted-foreground">
                  End your session on this device.
                </div>
              </div>
              <form action="/auth/signout" method="post">
                <Button type="submit" variant="secondary" size="sm">
                  <LogOut /> Sign out
                </Button>
              </form>
            </div>
          </Section>
        </>
      ) : null}
    </div>
  );
}

function Section({
  title,
  destructive,
  children,
}: {
  title: string;
  destructive?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`rounded-3xl border bg-white/[0.025] p-6 ${
        destructive ? "border-red-500/20" : "border-white/10"
      }`}
    >
      <h2 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Row({
  label,
  desc,
  control,
}: {
  label: string;
  desc: string;
  control: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-6">
      <div>
        <div className="text-sm">{label}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
      {control}
    </div>
  );
}
