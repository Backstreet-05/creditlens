"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RocCurveChartProps {
  fpr: number[];
  tpr: number[];
  auc: number;
}

export default function RocCurveChart({ fpr, tpr, auc }: RocCurveChartProps) {
  // diagonal = fpr (random chance, y=x)
  const data = fpr.map((x, i) => ({ fpr: x, tpr: tpr[i], diagonal: x }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">
          ROC Curve
          <span className="ml-2 text-xs font-normal text-muted-foreground">AUC = {auc.toFixed(4)}</span>
        </CardTitle>
        <p className="text-xs text-muted-foreground">True Positive Rate vs False Positive Rate</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data} margin={{ top: 4, right: 8, left: -8, bottom: 16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
            <XAxis
              dataKey="fpr"
              type="number"
              domain={[0, 1]}
              tickCount={6}
              tick={{ fontSize: 11 }}
              label={{ value: "False Positive Rate", position: "insideBottom", offset: -8, fontSize: 11 }}
            />
            <YAxis
              type="number"
              domain={[0, 1]}
              tickCount={6}
              tick={{ fontSize: 11 }}
              label={{ value: "True Positive Rate", angle: -90, position: "insideLeft", offset: 12, fontSize: 11 }}
            />
            <Tooltip
              formatter={(v, name) => [
                typeof v === "number" ? v.toFixed(3) : "0.000",
                name === "tpr" ? "TPR (XGBoost)" : "TPR (Random)",
              ]}
              labelFormatter={(l) => `FPR: ${Number(l).toFixed(3)}`}
              contentStyle={{ fontSize: 12 }}
            />
            <Line
              dataKey="diagonal"
              stroke="hsl(var(--muted-foreground))"
              strokeDasharray="4 4"
              strokeWidth={1}
              dot={false}
              name="Random"
            />
            <Line
              dataKey="tpr"
              stroke="hsl(var(--primary))"
              strokeWidth={2.5}
              dot={false}
              name="XGBoost"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
