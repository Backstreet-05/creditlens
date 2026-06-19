"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GlobalShapFeature } from "@/types/prediction";

interface GlobalShapChartProps {
  features: GlobalShapFeature[];
}

const PALETTE = [
  "#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe",
  "#818cf8", "#93c5fd", "#7dd3fc", "#5eead4", "#34d399",
];

export default function GlobalShapChart({ features }: GlobalShapChartProps) {
  const sorted = [...features].sort((a, b) => a.importance - b.importance);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Global Feature Importance (SHAP)</CardTitle>
        <p className="text-xs text-muted-foreground">Mean |SHAP value| across 2,000 training samples</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={sorted}
            layout="vertical"
            margin={{ top: 4, right: 16, left: 4, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" opacity={0.4} />
            <XAxis
              type="number"
              tick={{ fontSize: 11 }}
              tickFormatter={(v: number) => v.toFixed(2)}
            />
            <YAxis
              dataKey="display_name"
              type="category"
              width={148}
              tick={{ fontSize: 11 }}
            />
            <Tooltip
              formatter={(v) => [typeof v === "number" ? v.toFixed(4) : "0.0000", "Mean |SHAP|"]}
              contentStyle={{ fontSize: 12 }}
            />
            <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
              {sorted.map((entry, i) => (
                <Cell key={entry.feature} fill={PALETTE[i % PALETTE.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
