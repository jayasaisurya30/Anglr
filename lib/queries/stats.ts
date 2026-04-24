import type { CatchRow } from "@/lib/supabase/types";

export interface StatsSummary {
  total: number;
  biggest: number;
  totalWeight: number;
}

export function summarize(catches: CatchRow[]): StatsSummary {
  let biggest = 0;
  let totalWeight = 0;
  for (const c of catches) {
    const w = c.weight_lbs ?? 0;
    totalWeight += w;
    if (w > biggest) biggest = w;
  }
  return {
    total: catches.length,
    biggest,
    totalWeight: Number(totalWeight.toFixed(2)),
  };
}

export function monthlyCatches(catches: CatchRow[], months = 12) {
  const out: { month: string; count: number }[] = [];
  const now = new Date();
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push({
      month: d.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
      count: 0,
    });
  }
  for (const c of catches) {
    const d = new Date(c.caught_at);
    const monthsAgo =
      (now.getFullYear() - d.getFullYear()) * 12 +
      (now.getMonth() - d.getMonth());
    if (monthsAgo >= 0 && monthsAgo < months) {
      out[months - 1 - monthsAgo].count++;
    }
  }
  return out;
}

export function speciesBreakdown(catches: CatchRow[]) {
  const map = new Map<string, number>();
  for (const c of catches) {
    const key = c.species?.trim() || "Unknown";
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}
