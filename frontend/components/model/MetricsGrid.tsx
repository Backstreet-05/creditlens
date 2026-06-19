import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Metrics {
  roc_auc: number;
  precision: number;
  recall: number;
  f1: number;
  accuracy: number;
}

interface MetricsGridProps {
  metrics: Metrics;
}

const METRICS_CONFIG = [
  { key: "roc_auc" as const, label: "ROC-AUC", description: "Area under the ROC curve" },
  { key: "accuracy" as const, label: "Accuracy", description: "Overall correct predictions" },
  { key: "precision" as const, label: "Precision", description: "True positives among predicted positives" },
  { key: "recall" as const, label: "Recall", description: "True positives among actual positives" },
  { key: "f1" as const, label: "F1 Score", description: "Harmonic mean of precision and recall" },
];

export default function MetricsGrid({ metrics }: MetricsGridProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Performance Metrics</CardTitle>
        <p className="text-xs text-muted-foreground">Evaluated on 30,000 held-out test samples</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {METRICS_CONFIG.map(({ key, label, description }) => (
            <div key={key} className="space-y-1">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-2xl font-bold tabular-nums text-foreground">
                {metrics[key].toFixed(4)}
              </p>
              <p className="text-[11px] text-muted-foreground leading-tight">{description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
