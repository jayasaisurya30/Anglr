"use client";

import { useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { Camera, Loader2, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { Profile } from "@/lib/supabase/types";
import {
  removeProfileAvatar,
  uploadProfileAvatar,
} from "@/lib/queries/profile-avatar";
import { profileInitials } from "@/lib/utils/profile-display";
import { resolveProfileAvatarSrc } from "@/lib/utils/profile-avatar";
import { toast } from "sonner";

export function ProfilePhotoField({
  userId,
  profile,
  onUpdated,
}: {
  userId: string;
  profile: Profile;
  onUpdated: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = useMutation({
    mutationFn: async (file: File) => {
      await uploadProfileAvatar(file, userId, profile.avatar_url);
    },
    onSuccess: () => {
      toast.success("Profile photo updated");
      onUpdated();
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : "Could not upload photo"),
  });

  const remove = useMutation({
    mutationFn: async () => {
      await removeProfileAvatar(userId, profile.avatar_url);
    },
    onSuccess: () => {
      toast.success("Profile photo removed");
      onUpdated();
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : "Could not remove photo"),
  });

  const src = resolveProfileAvatarSrc(profile.avatar_url);
  const initials = profileInitials(profile);

  return (
    <div className="space-y-2">
      <Label>Profile photo</Label>
      <p className="text-xs text-muted-foreground">
        Choose an image from your computer (JPG, PNG, or WebP, up to 5MB).
      </p>
      <div className="flex flex-wrap items-center gap-4">
        <Avatar className="h-20 w-20 border border-white/10">
          {src ? <AvatarImage src={src} alt="" /> : null}
          <AvatarFallback className="bg-white/[0.06] text-sm font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-wrap gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (f) upload.mutate(f);
            }}
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={upload.isPending || remove.isPending}
            onClick={() => inputRef.current?.click()}
            className="gap-2"
          >
            {upload.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Camera className="h-4 w-4" />
            )}
            {profile.avatar_url ? "Change photo" : "Choose photo"}
          </Button>
          {profile.avatar_url ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={upload.isPending || remove.isPending}
              onClick={() => remove.mutate()}
              className="gap-2 text-muted-foreground"
            >
              {remove.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Remove
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
