"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUploader } from "./image-uploader";
import { catchFormSchema, type CatchFormInput } from "@/lib/validators/catch";
import type { CatchVisibility } from "@/lib/supabase/types";
import { fishSpeciesSelectOptions } from "@/lib/constants/fish-species";

export interface CatchFormProps {
  defaultValues: CatchFormInput;
  submitLabel?: string;
  onSubmit: (values: CatchFormInput, files: File[]) => Promise<void> | void;
  onCancel?: () => void;
  showImages?: boolean;
  busy?: boolean;
}

export function CatchForm({
  defaultValues,
  submitLabel = "Save catch",
  onSubmit,
  onCancel,
  showImages = true,
  busy,
}: CatchFormProps) {
  const [files, setFiles] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CatchFormInput>({
    resolver: zodResolver(catchFormSchema),
    defaultValues,
  });

  const visibility = watch("visibility");
  const species = watch("species");

  const speciesOptions = useMemo(
    () => fishSpeciesSelectOptions(defaultValues.species),
    [defaultValues.species]
  );

  const submit = async (values: CatchFormInput) => {
    await onSubmit(values, files);
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-5">
      {showImages ? (
        <div className="space-y-2">
          <Label>Photos</Label>
          <ImageUploader files={files} onFilesChange={setFiles} />
        </div>
      ) : null}

      <div className="space-y-1.5">
        <Label>Species</Label>
        <Select
          value={species || undefined}
          onValueChange={(v) =>
            setValue("species", v, { shouldDirty: true, shouldValidate: true })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose a species" />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            {speciesOptions.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.species ? (
          <p className="text-xs text-destructive">{errors.species.message}</p>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="weight">Weight (lbs)</Label>
          <Input
            id="weight"
            type="number"
            step="0.01"
            inputMode="decimal"
            placeholder="4.25"
            {...register("weight_lbs", {
              setValueAs: (v) =>
                v === "" || v === null || v === undefined || Number.isNaN(Number(v))
                  ? null
                  : Number(v),
            })}
          />
          {errors.weight_lbs ? (
            <p className="text-xs text-destructive">
              {errors.weight_lbs.message}
            </p>
          ) : null}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="species_nickname">Custom name (optional)</Label>
          <Input
            id="species_nickname"
            placeholder="e.g. Big Betty"
            autoComplete="off"
            {...register("species_nickname")}
          />
          {errors.species_nickname ? (
            <p className="text-xs text-destructive">
              {errors.species_nickname.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="caught_at">Date & time</Label>
        <Input id="caught_at" type="datetime-local" {...register("caught_at")} />
        {errors.caught_at ? (
          <p className="text-xs text-destructive">{errors.caught_at.message}</p>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="lat">Latitude</Label>
          <Input
            id="lat"
            type="number"
            step="any"
            {...register("lat", { valueAsNumber: true })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lng">Longitude</Label>
          <Input
            id="lng"
            type="number"
            step="any"
            {...register("lng", { valueAsNumber: true })}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="bait">Bait / lure</Label>
        <Input id="bait" placeholder="Green pumpkin worm" {...register("bait")} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" rows={3} placeholder="Cold morning, deep cove..." {...register("notes")} />
      </div>

      <div className="space-y-1.5">
        <Label>Visibility</Label>
        <Select
          value={visibility}
          onValueChange={(v) =>
            setValue("visibility", v as CatchVisibility, { shouldDirty: true })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Who can see this catch?" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="private">Private — only me</SelectItem>
            <SelectItem value="friends">Friends — shared with followers</SelectItem>
            <SelectItem value="public">Public — anyone on ANGLR</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2 pt-2">
        {onCancel ? (
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            className="flex-1"
          >
            Cancel
          </Button>
        ) : null}
        <Button
          type="submit"
          variant="primary"
          disabled={busy}
          className="flex-1"
        >
          {busy ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
