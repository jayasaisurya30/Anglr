"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

const COLORS = [
  "#4DA3FF",
  "#7FC4FF",
  "#2F80ED",
  "#6FE3C2",
  "#FFBD59",
  "#F472B6",
  "#A78BFA",
  "#94A3B8",
];

export function SpeciesPie({
  data,
}: {
  data: { name: string; value: number }[];
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-6 md:p-8">
      <div className="mb-6 md:mb-8">
        <h3 className="text-base font-semibold tracking-tight">
          Species breakdown
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Across all logged catches
        </p>
      </div>
      <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-10">
        <div className="h-64 min-h-[16rem] w-full sm:h-72 md:h-80 lg:col-span-8 lg:h-[22rem]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius="42%"
                outerRadius="78%"
                paddingAngle={2}
                stroke="none"
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2 sm:gap-x-8 lg:col-span-4 lg:block lg:space-y-3 lg:self-center">
          {data.slice(0, 8).map((d, i) => (
            <li
              key={d.name}
              className="flex items-center justify-between gap-3 text-sm md:text-base"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className="inline-block h-3 w-3 shrink-0 rounded-full"
                  style={{ background: COLORS[i % COLORS.length] }}
                />
                <span className="truncate font-medium">{d.name}</span>
              </div>
              <span className="shrink-0 tabular-nums text-muted-foreground">
                {total > 0 ? Math.round((d.value / total) * 100) : 0}%
              </span>
            </li>
          ))}
          {data.length === 0 ? (
            <li className="text-muted-foreground sm:col-span-2 lg:col-span-1">
              No data yet
            </li>
          ) : null}
        </ul>
      </div>
    </div>
  );
}
