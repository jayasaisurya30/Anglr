"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addComment, listComments } from "@/lib/queries/social";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fmtRelative } from "@/lib/utils/dates";
import { toast } from "sonner";
import Link from "next/link";
import { profileInitials, profilePrimaryName } from "@/lib/utils/profile-display";

export function CommentThread({ catchId }: { catchId: string }) {
  const [body, setBody] = useState("");
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ["comments", catchId],
    queryFn: () => listComments(catchId),
  });

  const mut = useMutation({
    mutationFn: (b: string) => addComment(catchId, b),
    onSuccess: () => {
      setBody("");
      qc.invalidateQueries({ queryKey: ["comments", catchId] });
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : "Could not comment"),
  });

  return (
    <div className="space-y-3">
      <ul className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {(data ?? []).map((c) => {
          const handle = c.author?.handle;
          const name = profilePrimaryName(c.author ?? undefined);
          const initials = profileInitials(c.author ?? undefined);
          return (
            <li key={c.id} className="flex gap-2.5">
              {handle ? (
                <Link href={`/profile/${handle}`} className="shrink-0">
                  <Avatar className="h-7 w-7">
                    {c.author?.avatar_url ? (
                      <AvatarImage src={c.author.avatar_url} alt="" />
                    ) : null}
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                </Link>
              ) : (
                <Avatar className="h-7 w-7 shrink-0">
                  {c.author?.avatar_url ? (
                    <AvatarImage src={c.author.avatar_url} alt="" />
                  ) : null}
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              )}
              <div className="min-w-0">
                <div className="text-xs">
                  <span className="font-medium">{name}</span>
                  {handle ? (
                    <>
                      {" "}
                      <Link
                        href={`/profile/${handle}`}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        @{handle}
                      </Link>
                    </>
                  ) : null}{" "}
                  <span className="text-muted-foreground">
                    · {fmtRelative(c.created_at)}
                  </span>
                </div>
                <div className="text-sm mt-0.5">{c.body}</div>
              </div>
            </li>
          );
        })}
        {(!data || data.length === 0) && (
          <li className="text-xs text-muted-foreground">No comments yet.</li>
        )}
      </ul>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (body.trim()) mut.mutate(body.trim());
        }}
        className="flex gap-2"
      >
        <Input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write a comment..."
        />
        <Button
          type="submit"
          variant="secondary"
          size="sm"
          disabled={!body.trim() || mut.isPending}
        >
          Post
        </Button>
      </form>
    </div>
  );
}
