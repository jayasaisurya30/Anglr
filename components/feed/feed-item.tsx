"use client";

import Link from "next/link";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { publicImageUrl } from "@/lib/queries/catches";
import { fmtDate, fmtRelative } from "@/lib/utils/dates";
import { LikeButton } from "./like-button";
import { CommentThread } from "./comment-thread";
import { MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { CatchWithAuthor } from "@/lib/supabase/types";
import { profileInitials, profilePrimaryName } from "@/lib/utils/profile-display";
import { resolveProfileAvatarSrc } from "@/lib/utils/profile-avatar";
import {
  catchSpeciesBadgeLabel,
  catchSpeciesTitle,
} from "@/lib/utils/catch-display";

export function FeedItem({ catchRow }: { catchRow: CatchWithAuthor }) {
  const [openComments, setOpenComments] = useState(false);
  const author = catchRow.profiles;
  const initials = profileInitials(author ?? undefined);
  const avatarSrc = resolveProfileAvatarSrc(author?.avatar_url);
  const imgs = [...(catchRow.catch_images ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order
  );

  return (
    <article className="rounded-3xl border border-white/10 bg-white/[0.025] overflow-hidden">
      <header className="flex items-center justify-between px-5 py-4">
        <Link
          href={`/profile/${author?.handle}`}
          className="flex items-center gap-3"
        >
          <Avatar className="h-9 w-9">
            {avatarSrc ? <AvatarImage src={avatarSrc} alt="" /> : null}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <div className="text-sm font-medium">
              {profilePrimaryName(author ?? undefined)}
            </div>
            <div className="text-xs text-muted-foreground">
              @{author?.handle ?? "—"} · {fmtRelative(catchRow.caught_at)}
            </div>
          </div>
        </Link>
        <Badge variant="primary">
          {catchSpeciesBadgeLabel(
            catchRow.species,
            catchRow.species_nickname
          )}
        </Badge>
      </header>

      {imgs.length > 0 ? (
        <div
          className={
            imgs.length === 1
              ? "grid grid-cols-1"
              : imgs.length === 2
                ? "grid grid-cols-2 gap-px"
                : "grid grid-cols-3 gap-px"
          }
        >
          {imgs.slice(0, 3).map((img) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={img.id}
              src={publicImageUrl(img.storage_path)}
              alt=""
              className="aspect-[4/3] w-full object-cover bg-anglr-ink"
            />
          ))}
        </div>
      ) : null}

      <div className="px-5 py-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <strong>
            {catchSpeciesTitle(catchRow.species, catchRow.species_nickname)}
          </strong>
          {catchRow.weight_lbs != null ? (
            <span className="text-muted-foreground">
              · {catchRow.weight_lbs} lbs
            </span>
          ) : null}
          <span className="text-muted-foreground text-xs">
            · {fmtDate(catchRow.caught_at, "PP")}
          </span>
        </div>
        {catchRow.notes ? (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {catchRow.notes}
          </p>
        ) : null}
        <div className="flex items-center gap-1">
          <LikeButton catchId={catchRow.id} />
          <button
            type="button"
            onClick={() => setOpenComments((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-white/[0.05] transition-colors"
          >
            <MessageSquare className="h-4 w-4" />
            Comments
          </button>
        </div>
        <AnimatePresence initial={false}>
          {openComments ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="pt-2"
            >
              <CommentThread catchId={catchRow.id} />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </article>
  );
}
