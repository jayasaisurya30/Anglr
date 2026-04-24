import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { type ReactNode } from "react";
import type { ProfileLite } from "@/lib/queries/follows";

export function UserRow({
  profile,
  action,
}: {
  profile: ProfileLite;
  action?: ReactNode;
}) {
  const initials = (profile.display_name ?? profile.username ?? "A")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.025] p-4 hover:bg-white/[0.04] transition-colors">
      <Link href={`/profile/${profile.handle}`} className="shrink-0">
        <Avatar className="h-11 w-11">
          {profile.avatar_url ? <AvatarImage src={profile.avatar_url} alt="" /> : null}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </Link>
      <div className="flex-1 min-w-0">
        <Link href={`/profile/${profile.handle}`} className="block min-w-0">
          <div className="text-sm font-medium truncate">
            {profile.display_name ?? profile.username}
          </div>
          <div className="text-xs text-muted-foreground truncate">
            @{profile.handle}
          </div>
          {profile.bio ? (
            <div className="mt-1 text-xs text-muted-foreground line-clamp-1">
              {profile.bio}
            </div>
          ) : null}
        </Link>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
