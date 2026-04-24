"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

export type DateFilter = "all" | "7d" | "30d" | "1y";
export type WeightFilter = "all" | "lt1" | "1-5" | "gt5";
export type VisFilter = "all" | "public" | "friends" | "private";

export interface FilterState {
  q: string;
  species: string;
  date: DateFilter;
  weight: WeightFilter;
  visibility: VisFilter;
}

export const INITIAL_FILTERS: FilterState = {
  q: "",
  species: "all",
  date: "all",
  weight: "all",
  visibility: "all",
};

export function CatchFilters({
  speciesList,
  value,
  onChange,
}: {
  speciesList: string[];
  value: FilterState;
  onChange: (next: FilterState) => void;
}) {
  function set<K extends keyof FilterState>(k: K, v: FilterState[K]) {
    onChange({ ...value, [k]: v });
  }

  return (
    <div className="flex flex-col md:flex-row gap-2 md:items-center">
      <div className="relative md:w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search species, notes, bait..."
          value={value.q}
          onChange={(e) => set("q", e.target.value)}
          className="pl-9"
        />
      </div>

      <Select
        value={value.species}
        onValueChange={(v) => set("species", v)}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Species" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All species</SelectItem>
          {speciesList.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={value.date} onValueChange={(v) => set("date", v as DateFilter)}>
        <SelectTrigger className="w-36">
          <SelectValue placeholder="Date" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Any time</SelectItem>
          <SelectItem value="7d">Last 7 days</SelectItem>
          <SelectItem value="30d">Last 30 days</SelectItem>
          <SelectItem value="1y">Last year</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={value.weight}
        onValueChange={(v) => set("weight", v as WeightFilter)}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Weight" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Any weight</SelectItem>
          <SelectItem value="lt1">&lt; 1 lb</SelectItem>
          <SelectItem value="1-5">1 – 5 lb</SelectItem>
          <SelectItem value="gt5">&gt; 5 lb</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={value.visibility}
        onValueChange={(v) => set("visibility", v as VisFilter)}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Visibility" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All visibility</SelectItem>
          <SelectItem value="public">Public</SelectItem>
          <SelectItem value="friends">Friends</SelectItem>
          <SelectItem value="private">Private</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

export function applyFilters(
  catches: Array<{
    species: string | null;
    caught_at: string;
    weight_lbs: number | null;
    visibility: "private" | "friends" | "public";
    notes: string | null;
    bait: string | null;
  }>,
  f: FilterState
) {
  const q = f.q.trim().toLowerCase();
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  return catches.filter((c) => {
    if (q) {
      const bag = [c.species, c.notes, c.bait]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!bag.includes(q)) return false;
    }
    if (f.species !== "all" && (c.species ?? "") !== f.species) return false;
    if (f.visibility !== "all" && c.visibility !== f.visibility) return false;
    if (f.date !== "all") {
      const d = new Date(c.caught_at).getTime();
      const span =
        f.date === "7d"
          ? 7 * dayMs
          : f.date === "30d"
            ? 30 * dayMs
            : 365 * dayMs;
      if (now - d > span) return false;
    }
    if (f.weight !== "all") {
      const w = c.weight_lbs ?? 0;
      if (f.weight === "lt1" && w >= 1) return false;
      if (f.weight === "1-5" && (w < 1 || w > 5)) return false;
      if (f.weight === "gt5" && w <= 5) return false;
    }
    return true;
  });
}
