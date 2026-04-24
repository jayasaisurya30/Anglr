"use client";

import { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cancelFollowRequest,
  listFollowers,
  listFollowing,
  listIncomingRequests,
  listOutgoingRequests,
  respondToRequest,
  searchUsers,
} from "@/lib/queries/follows";
import { UserRow } from "@/components/friends/user-row";
import { FollowButton } from "@/components/friends/follow-button";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/empty-state";

export function FriendsView() {
  const [tab, setTab] = useState("discover");
  const [q, setQ] = useState("");
  const dq = useDebounce(q, 200);
  const qc = useQueryClient();

  const search = useQuery({
    queryKey: ["users", dq],
    queryFn: () => searchUsers(dq),
    enabled: dq.trim().length > 0,
  });

  const followers = useQuery({
    queryKey: ["followers"],
    queryFn: listFollowers,
  });

  const following = useQuery({
    queryKey: ["following"],
    queryFn: listFollowing,
  });

  const incoming = useQuery({
    queryKey: ["incoming-requests"],
    queryFn: listIncomingRequests,
  });

  const outgoing = useQuery({
    queryKey: ["outgoing-requests"],
    queryFn: listOutgoingRequests,
  });

  const respondMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "accepted" | "declined" }) =>
      respondToRequest(id, status),
    onSuccess: (_r, v) => {
      toast.success(v.status === "accepted" ? "Request accepted" : "Request declined");
      qc.invalidateQueries({ queryKey: ["incoming-requests"] });
      qc.invalidateQueries({ queryKey: ["followers"] });
      qc.invalidateQueries({ queryKey: ["following"] });
    },
  });

  const cancelMut = useMutation({
    mutationFn: (id: string) => cancelFollowRequest(id),
    onSuccess: () => {
      toast.success("Request cancelled");
      qc.invalidateQueries({ queryKey: ["outgoing-requests"] });
    },
  });

  return (
    <Tabs value={tab} onValueChange={setTab} className="space-y-6">
      <TabsList>
        <TabsTrigger value="discover">Discover</TabsTrigger>
        <TabsTrigger value="requests">
          Requests{incoming.data?.length ? ` · ${incoming.data.length}` : ""}
        </TabsTrigger>
        <TabsTrigger value="followers">
          Followers{followers.data?.length ? ` · ${followers.data.length}` : ""}
        </TabsTrigger>
        <TabsTrigger value="following">
          Following{following.data?.length ? ` · ${following.data.length}` : ""}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="discover" className="space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by @handle or username"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </div>
        {dq.trim().length === 0 ? (
          <EmptyState
            title="Find anglers"
            description="Search by username or @handle to start following."
          />
        ) : search.isLoading ? (
          <ListSkeletons />
        ) : (search.data ?? []).length === 0 ? (
          <EmptyState title="No matches" description="Try a different search." />
        ) : (
          <div className="grid gap-2">
            {search.data!.map((p) => (
              <UserRow
                key={p.id}
                profile={p}
                action={<FollowButton userId={p.id} />}
              />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="requests" className="space-y-6">
        <Section title="Incoming requests">
          {incoming.isLoading ? (
            <ListSkeletons />
          ) : (incoming.data ?? []).length === 0 ? (
            <EmptyState title="No incoming requests" />
          ) : (
            <div className="grid gap-2">
              {incoming.data!.map((r) =>
                r.from_profile ? (
                  <UserRow
                    key={r.id}
                    profile={r.from_profile}
                    action={
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() =>
                            respondMut.mutate({ id: r.id, status: "accepted" })
                          }
                        >
                          <Check /> Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            respondMut.mutate({ id: r.id, status: "declined" })
                          }
                        >
                          <X /> Decline
                        </Button>
                      </div>
                    }
                  />
                ) : null
              )}
            </div>
          )}
        </Section>

        <Section title="Outgoing requests">
          {outgoing.isLoading ? (
            <ListSkeletons />
          ) : (outgoing.data ?? []).length === 0 ? (
            <EmptyState title="No outgoing requests" />
          ) : (
            <div className="grid gap-2">
              {outgoing.data!.map((r) =>
                r.to_profile ? (
                  <UserRow
                    key={r.id}
                    profile={r.to_profile}
                    action={
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => cancelMut.mutate(r.id)}
                      >
                        Cancel
                      </Button>
                    }
                  />
                ) : null
              )}
            </div>
          )}
        </Section>
      </TabsContent>

      <TabsContent value="followers">
        {followers.isLoading ? (
          <ListSkeletons />
        ) : (followers.data ?? []).length === 0 ? (
          <EmptyState title="No followers yet" />
        ) : (
          <div className="grid gap-2">
            {followers.data!.map((p) => (
              <UserRow
                key={p.id}
                profile={p}
                action={<FollowButton userId={p.id} />}
              />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="following">
        {following.isLoading ? (
          <ListSkeletons />
        ) : (following.data ?? []).length === 0 ? (
          <EmptyState title="Not following anyone yet" />
        ) : (
          <div className="grid gap-2">
            {following.data!.map((p) => (
              <UserRow
                key={p.id}
                profile={p}
                action={<FollowButton userId={p.id} />}
              />
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-3 text-xs uppercase tracking-wider text-muted-foreground">
        {title}
      </div>
      {children}
    </div>
  );
}

function ListSkeletons() {
  return (
    <div className="grid gap-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-[72px] rounded-2xl" />
      ))}
    </div>
  );
}
