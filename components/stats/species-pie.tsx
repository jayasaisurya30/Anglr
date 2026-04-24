"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

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
    <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-6">
      <div className="mb-5">
        <h3 className="text-sm font-medium">Species breakdown</h3>
        <p className="text-xs text-muted-foreground">
          Across all logged catches
        </p>
      </div>
      <div className="grid grid-cols-5 items-center gap-6">
        <div className="col-span-3 h-60">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                contentStyle={{
                  background: "rgba(14,16,20,0.95)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "12px",
                  backdropFilter: "blur(16px)",
                  fontSize: 12,
                }}
              />
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={95}
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
        <ul className="col-span-2 space-y-2 text-sm">
          {data.slice(0, 8).map((d, i) => (
            <li key={d.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ background: COLORS[i % COLORS.length] }}
                />
                <span className="truncate">{d.name}</span>
              </div>
              <span className="text-muted-foreground">
                {total > 0 ? Math.round((d.value / total) * 100) : 0}%
              </span>
            </li>
          ))}
          {data.length === 0 ? (
            <li className="text-muted-foreground">No data yet</li>
          ) : null}
        </ul>
      </div>
    </div>
  );
}
