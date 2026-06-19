import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ConfusionMatrixProps {
  matrix: [[number, number], [number, number]];
}

function fmt(n: number) {
  return n.toLocaleString();
}

export default function ConfusionMatrix({ matrix }: ConfusionMatrixProps) {
  const [[tn, fp], [fn, tp]] = matrix;
  const total = tn + fp + fn + tp;

  const cells = [
    { label: "True Negative", abbr: "TN", value: tn, bg: "bg-emerald-500/15 border-emerald-500/30", text: "text-emerald-400" },
    { label: "False Positive", abbr: "FP", value: fp, bg: "bg-red-500/10 border-red-500/20", text: "text-red-400" },
    { label: "False Negative", abbr: "FN", value: fn, bg: "bg-red-500/10 border-red-500/20", text: "text-red-400" },
    { label: "True Positive", abbr: "TP", value: tp, bg: "bg-emerald-500/15 border-emerald-500/30", text: "text-emerald-400" },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Confusion Matrix</CardTitle>
        <p className="text-xs text-muted-foreground">Predictions vs actual labels on test set (threshold = 0.5)</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 max-w-xs">
          {cells.map(({ label, abbr, value, bg, text }) => (
            <div
              key={abbr}
              className={cn("rounded-md border p-3 text-center", bg)}
            >
              <p className={cn("text-xs font-semibold", text)}>{abbr}</p>
              <p className="mt-0.5 text-xl font-bold tabular-nums">{fmt(value)}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{label}</p>
              <p className="text-[10px] text-muted-foreground">{((value / total) * 100).toFixed(1)}%</p>
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-4 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-sm bg-emerald-500/50" />
            Correct predictions
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-sm bg-red-500/40" />
            Misclassifications
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
