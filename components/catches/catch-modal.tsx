"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CatchForm } from "./catch-form";
import { publicImageUrl, deleteCatch, updateCatch } from "@/lib/queries/catches";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { fmtDate } from "@/lib/utils/dates";
import { Pencil, Trash2 } from "lucide-react";
import type { CatchWithAuthor, CatchWithImages, Profile } from "@/lib/supabase/types";
import { useAuthProfile } from "@/components/common/auth-profile-provider";
import { profilePrimaryName } from "@/lib/utils/profile-display";
import { catchSpeciesTitle } from "@/lib/utils/catch-display";

export interface CatchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  catchRow: CatchWithImages | null;
  readOnly?: boolean;
  /** When the catch row has no `profiles` join (e.g. another user&apos;s grid). */
  ownerProfile?: Pick<Profile, "username" | "handle" | "display_name"> | null;
}

function hasAuthor(row: CatchWithImages): row is CatchWithAuthor {
  return "profiles" in row && !!(row as CatchWithAuthor).profiles;
}

function toDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    d.getFullYear() +
    "-" +
    pad(d.getMonth() + 1) +
    "-" +
    pad(d.getDate()) +
    "T" +
    pad(d.getHours()) +
    ":" +
    pad(d.getMinutes())
  );
}

export function CatchModal({
  open,
  onOpenChange,
  catchRow,
  readOnly,
  ownerProfile,
}: CatchModalProps) {
  const [editing, setEditing] = useState(false);
  const qc = useQueryClient();
  const { user } = useAuthProfile();

  const updateMut = useMutation({
    mutationFn: async (values: {
      id: string;
      patch: Parameters<typeof updateCatch>[1];
    }) => updateCatch(values.id, values.patch),
    onSuccess: () => {
      toast.success("Catch updated");
      qc.invalidateQueries({ queryKey: ["my-catches"] });
      setEditing(false);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Update failed"),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => deleteCatch(id),
    onSuccess: () => {
      toast.success("Catch deleted");
      qc.invalidateQueries({ queryKey: ["my-catches"] });
      onOpenChange(false);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Delete failed"),
  });

  if (!catchRow) return null;

  const isMine = !!user?.id && catchRow.user_id === user.id;
  const joinedAuthor = hasAuthor(catchRow) ? catchRow.profiles : null;
  const ownerForLabel = joinedAuthor ?? ownerProfile ?? null;

  const imgs = (catchRow.catch_images ?? []).sort(
    (a, b) => a.sort_order - b.sort_order
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) setEditing(false);
        onOpenChange(v);
      }}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {catchSpeciesTitle(catchRow.species, catchRow.species_nickname)}
            {catchRow.weight_lbs != null ? (
              <span className="ml-2 text-muted-foreground font-normal">
                · {catchRow.weight_lbs} lbs
              </span>
            ) : null}
          </DialogTitle>
          <DialogDescription>
            {fmtDate(catchRow.caught_at, "PPpp")}
            {" · "}
            <span className="capitalize">{catchRow.visibility}</span>
          </DialogDescription>
          {isMine && user.profile ? (
            <p className="text-sm text-foreground/90 -mt-1">
              You · @{user.profile.handle}
            </p>
          ) : ownerForLabel ? (
            <p className="text-sm text-foreground/90 -mt-1">
              {profilePrimaryName(ownerForLabel)} · @{ownerForLabel.handle}
            </p>
          ) : null}
        </DialogHeader>

        {editing ? (
          <CatchForm
            defaultValues={{
              species: catchRow.species ?? "",
              species_nickname: catchRow.species_nickname ?? "",
              weight_lbs: catchRow.weight_lbs,
              caught_at: toDatetimeLocal(catchRow.caught_at),
              lat: catchRow.lat,
              lng: catchRow.lng,
              notes: catchRow.notes ?? "",
              bait: catchRow.bait ?? "",
              visibility: catchRow.visibility,
            }}
            showImages={false}
            busy={updateMut.isPending}
            onSubmit={async (values) => {
              await updateMut.mutateAsync({ id: catchRow.id, patch: values });
            }}
            onCancel={() => setEditing(false)}
          />
        ) : (
          <div className="space-y-5">
            {imgs.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {imgs.map((img) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={img.id}
                    src={publicImageUrl(img.storage_path)}
                    alt=""
                    className="aspect-square w-full rounded-xl object-cover border border-white/10"
                  />
                ))}
              </div>
            ) : null}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Field label="Species" value={catchRow.species ?? "—"} />
              <Field
                label="Custom name"
                value={catchRow.species_nickname?.trim() || "—"}
              />
              <Field
                label="Weight"
                value={
                  catchRow.weight_lbs != null
                    ? `${catchRow.weight_lbs} lbs`
                    : "—"
                }
              />
              <Field label="Bait / lure" value={catchRow.bait ?? "—"} />
              <Field
                label="Location"
                value={`${catchRow.lat.toFixed(5)}, ${catchRow.lng.toFixed(5)}`}
              />
            </div>
            {catchRow.notes ? (
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                  Notes
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {catchRow.notes}
                </p>
              </div>
            ) : null}
            <div className="flex items-center gap-2">
              <Badge variant={catchRow.visibility === "public" ? "primary" : "default"}>
                {catchRow.visibility}
              </Badge>
              {!readOnly ? (
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setEditing(true)}
                  >
                    <Pencil /> Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300"
                    onClick={() => deleteMut.mutate(catchRow.id)}
                    disabled={deleteMut.isPending}
                  >
                    <Trash2 /> Delete
                  </Button>
                </>
              ) : null}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-0.5">{value}</div>
    </div>
  );
}
