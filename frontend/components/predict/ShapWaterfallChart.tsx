"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ShapValue } from "@/types/prediction";

interface ShapWaterfallChartProps {
  shapValues: ShapValue[];
}

interface TooltipPayload {
  payload?: {
    name: string;
    value: number;
    applicant_value: number;
    direction: string;
  };
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  if (!active || !payload?.length || !payload[0]?.payload) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-md border border-border bg-card px-3 py-2 text-xs shadow-md">
      <p className="font-semibold">{d.name}</p>
      <p className="text-muted-foreground">Value: {d.applicant_value}</p>
      <p className={d.value > 0 ? "text-red-400" : "text-emerald-400"}>
        SHAP: {d.value > 0 ? "+" : ""}{d.value.toFixed(4)}
      </p>
      <p className="text-muted-foreground capitalize">{d.direction.replace("_", " ")}</p>
    </div>
  );
}

export default function ShapWaterfallChart({ shapValues }: ShapWaterfallChartProps) {
  // Reverse so highest-impact at top (Recharts renders bottom-to-top)
  const chartData = [...shapValues].reverse().map((sv) => ({
    name: sv.display_name,
    value: sv.shap_contribution,
    applicant_value: sv.applicant_value,
    direction: sv.direction,
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">SHAP feature contributions</CardTitle>
        <p className="text-xs text-muted-foreground">
          <span className="text-red-400 font-medium">Red</span> = increases risk ·{" "}
          <span className="text-emerald-400 font-medium">Green</span> = decreases risk
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 16, top: 4, bottom: 4 }}>
            <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.08} />
            <XAxis
              type="number"
              tick={{ fontSize: 10 }}
              tickFormatter={(v) => v.toFixed(2)}
              stroke="currentColor"
              strokeOpacity={0.3}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={148}
              tick={{ fontSize: 11 }}
              stroke="currentColor"
              strokeOpacity={0.3}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine x={0} stroke="currentColor" strokeOpacity={0.4} strokeWidth={1} />
            <Bar dataKey="value" radius={[0, 3, 3, 0]}>
              {chartData.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.direction === "increases_risk" ? "#ef4444" : "#10b981"}
                  fillOpacity={0.85}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
