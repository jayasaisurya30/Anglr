"use client";

import Link from "next/link";
import { useUser } from "@/hooks/use-user";
import { profilePrimaryName } from "@/lib/utils/profile-display";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { resolveProfileAvatarSrc } from "@/lib/utils/profile-avatar";
import { LogOut, Settings, User as UserIcon } from "lucide-react";

export function UserMenu() {
  const { user } = useUser();

  if (!user) {
    return (
      <Link
        href="/login"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        Sign in
      </Link>
    );
  }

  const display = profilePrimaryName(user.profile ?? undefined);
  const menuAvatarSrc = resolveProfileAvatarSrc(user.profile?.avatar_url);
  const initials = display.slice(0, 2).toUpperCase();
  const profileHref = (() => {
    const h = user.profile?.handle?.trim();
    if (!h) return "/settings?setup=profile";
    return `/profile/${encodeURIComponent(h)}`;
  })();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-full p-1 pr-3 hover:bg-white/[0.05] transition">
        <Avatar className="h-8 w-8">
          {menuAvatarSrc ? <AvatarImage src={menuAvatarSrc} alt="" /> : null}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="hidden sm:flex flex-col items-start leading-tight">
          <span className="text-sm">{display}</span>
          <span className="text-xs text-muted-foreground">
            @{user.profile?.handle ?? "—"}
          </span>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="space-y-0.5">
            <div className="text-sm text-foreground">{display}</div>
            <div className="text-xs text-muted-foreground normal-case tracking-normal">
              @{user.profile?.handle ?? "—"}
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={profileHref}>
            <UserIcon className="h-4 w-4" /> Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings">
            <Settings className="h-4 w-4" /> Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <form action="/auth/signout" method="post" className="w-full">
            <button
              type="submit"
              className="flex w-full items-center gap-2 text-left"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
