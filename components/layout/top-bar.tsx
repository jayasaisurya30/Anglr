"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NotificationsPopover } from "./notifications-popover";
import { UserMenu } from "./user-menu";
import { OfflineBadge } from "@/components/common/offline-badge";
import { Logo } from "@/components/common/logo";

/** Pages with a prominent in-content title — omit duplicate bar heading next to logo. */
const BAR_TITLE_HIDDEN_PREFIXES = [
  "/catches",
  "/stats",
  "/friends",
  "/settings",
] as const;

const TITLES: Record<string, string> = {
  "/map": "Map",
  "/profile": "Profile",
};

export function TopBar() {
  const pathname = usePathname();
  const hideBarTitle = BAR_TITLE_HIDDEN_PREFIXES.some((p) =>
    pathname.startsWith(p),
  );
  const title =
    Object.entries(TITLES).find(([path]) => pathname.startsWith(path))?.[1] ??
    "ANGLR";

  return (
    <header className="flex items-center justify-between px-6 h-16 border-b border-white/5 bg-anglr-ink/60 backdrop-blur-2xl sticky top-0 z-30">
      <div className="flex items-center gap-3 min-w-0">
        <Link
          href="/"
          className="md:hidden shrink-0 rounded-lg -ml-2 p-1.5 hover:bg-white/[0.04] transition-colors"
          aria-label="ANGLR home"
        >
          <Logo size={26} />
        </Link>
        {hideBarTitle ? null : (
          <h1 className="text-base font-medium tracking-tight truncate">
            {title}
          </h1>
        )}
        <OfflineBadge />
      </div>
      <div className="flex items-center gap-1.5">
        <NotificationsPopover />
        <UserMenu />
      </div>
    </header>
  );
}
