"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function MonthlyCatches({
  data,
}: {
  data: { month: string; count: number }[];
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-medium">Monthly catches</h3>
          <p className="text-xs text-muted-foreground">
            Last 12 months of activity
          </p>
        </div>
      </div>
      <div className="h-60">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="gradBlue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4DA3FF" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#4DA3FF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="month"
              stroke="rgba(255,255,255,0.4)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="rgba(255,255,255,0.4)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              width={30}
            />
            <Tooltip
              cursor={{ stroke: "rgba(77,163,255,0.2)", strokeWidth: 1 }}
              contentStyle={{
                background: "rgba(14,16,20,0.95)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "12px",
                backdropFilter: "blur(16px)",
                fontSize: 12,
              }}
              labelStyle={{ color: "rgba(255,255,255,0.6)" }}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#4DA3FF"
              strokeWidth={2}
              fill="url(#gradBlue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
