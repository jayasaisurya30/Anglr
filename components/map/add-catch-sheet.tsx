"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CatchForm } from "@/components/catches/catch-form";
import { createCatch } from "@/lib/queries/catches";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { CatchFormInput } from "@/lib/validators/catch";
import { queueCatch } from "@/lib/offline/queue";

export interface AddCatchSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialCoords: { lng: number; lat: number } | null;
}

function toDatetimeLocal(date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    date.getFullYear() +
    "-" +
    pad(date.getMonth() + 1) +
    "-" +
    pad(date.getDate()) +
    "T" +
    pad(date.getHours()) +
    ":" +
    pad(date.getMinutes())
  );
}

export function AddCatchSheet({
  open,
  onOpenChange,
  initialCoords,
}: AddCatchSheetProps) {
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      values,
      files,
    }: {
      values: CatchFormInput;
      files: File[];
    }) => {
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        await queueCatch(values, files);
        return { queued: true as const };
      }
      const row = await createCatch(values, files);
      return { queued: false as const, row };
    },
    onSuccess: (res) => {
      if (res.queued) {
        toast.success("Queued offline", {
          description: "We'll sync when you're back online.",
        });
      } else {
        toast.success("Catch saved");
      }
      qc.invalidateQueries({ queryKey: ["my-catches"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
      onOpenChange(false);
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : "Could not save catch");
    },
  });

  if (!initialCoords) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New catch</DialogTitle>
          <DialogDescription>
            Log the details while it&apos;s fresh in memory.
          </DialogDescription>
        </DialogHeader>
        <CatchForm
          defaultValues={{
            species: "",
            species_nickname: "",
            weight_lbs: null,
            caught_at: toDatetimeLocal(),
            lat: initialCoords.lat,
            lng: initialCoords.lng,
            notes: "",
            bait: "",
            visibility: "private",
          }}
          onCancel={() => onOpenChange(false)}
          busy={mutation.isPending}
          onSubmit={async (values, files) => {
            await mutation.mutateAsync({ values, files });
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
