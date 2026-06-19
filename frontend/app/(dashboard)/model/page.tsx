import { fetchModelInfo, fetchGlobalShap } from "@/lib/api/predict";
import MetricsGrid from "@/components/model/MetricsGrid";
import ConfusionMatrix from "@/components/model/ConfusionMatrix";
import RocCurveChart from "@/components/model/RocCurveChart";
import GlobalShapChart from "@/components/model/GlobalShapChart";
import type { ModelInfo, GlobalShapFeature } from "@/types/prediction";

export const metadata = { title: "Model Performance" };

const FALLBACK_INFO: ModelInfo = {
  algorithm: "XGBoostClassifier",
  version: "1.0.0",
  training_date: "2026-06-09",
  dataset_size: 150000,
  train_size: 120000,
  test_size: 30000,
  features: [
    "revolving_utilization","age","times_30_59_days_late","debt_ratio",
    "monthly_income","open_credit_lines","times_90_days_late",
    "real_estate_loans","times_60_89_days_late","dependents",
  ],
  threshold: 0.5,
  scale_pos_weight: 13.96,
  positive_class_rate: 0.0668,
  metrics: {
    roc_auc: 0.8686,
    precision: 0.2171,
    recall: 0.7791,
    f1: 0.3395,
    accuracy: 0.7974,
    confusion_matrix: [[22367, 5629], [443, 1561]],
    roc_curve: {
      fpr: [0.0,0.005,0.012,0.025,0.05,0.08,0.12,0.18,0.25,0.33,0.42,0.52,0.63,0.75,0.87,1.0],
      tpr: [0.0,0.21,0.36,0.50,0.63,0.71,0.77,0.82,0.86,0.89,0.91,0.93,0.95,0.97,0.98,1.0],
    },
  },
};

const FALLBACK_SHAP: GlobalShapFeature[] = [
  { feature: "revolving_utilization", display_name: "Credit Utilization", importance: 0.844717 },
  { feature: "times_30_59_days_late", display_name: "30-59 Day Late Payments", importance: 0.391055 },
  { feature: "times_90_days_late", display_name: "90+ Day Late Payments", importance: 0.335275 },
  { feature: "age", display_name: "Applicant Age", importance: 0.239527 },
  { feature: "open_credit_lines", display_name: "Open Credit Lines", importance: 0.176910 },
  { feature: "times_60_89_days_late", display_name: "60-89 Day Late Payments", importance: 0.171197 },
  { feature: "debt_ratio", display_name: "Debt Ratio", importance: 0.149654 },
  { feature: "real_estate_loans", display_name: "Real Estate Loans", importance: 0.121859 },
  { feature: "monthly_income", display_name: "Monthly Income", importance: 0.113151 },
  { feature: "dependents", display_name: "Number of Dependents", importance: 0.034216 },
];

export default async function ModelPage() {
  let modelInfo: ModelInfo = FALLBACK_INFO;
  let shapFeatures: GlobalShapFeature[] = FALLBACK_SHAP;

  try {
    [modelInfo, shapFeatures] = await Promise.all([
      fetchModelInfo(),
      fetchGlobalShap(),
    ]);
  } catch {
    // backend offline — rendering with static artifact values
  }

  const { metrics } = modelInfo;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Model Performance</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          XGBoost trained on 150k credit applicants · {modelInfo.features.length} features ·
          {" "}threshold = {modelInfo.threshold}
        </p>
      </div>

      <MetricsGrid metrics={metrics} />

      <div className="grid gap-4 md:grid-cols-2">
        <ConfusionMatrix matrix={metrics.confusion_matrix} />
        <RocCurveChart
          fpr={metrics.roc_curve.fpr}
          tpr={metrics.roc_curve.tpr}
          auc={metrics.roc_auc}
        />
      </div>

      <GlobalShapChart features={shapFeatures} />

      <div className="rounded-md border border-border/60 bg-muted/30 px-4 py-3 text-xs text-muted-foreground space-y-1">
        <p><span className="font-medium text-foreground">Dataset:</span> Give Me Some Credit (Kaggle) · {modelInfo.dataset_size.toLocaleString()} rows · {(modelInfo.positive_class_rate * 100).toFixed(2)}% positive class</p>
        <p><span className="font-medium text-foreground">Class imbalance:</span> Handled via scale_pos_weight = {modelInfo.scale_pos_weight} · no oversampling</p>
        <p><span className="font-medium text-foreground">Preprocessing:</span> Median imputation → 99th-pct winsorization → StandardScaler</p>
        <p><span className="font-medium text-foreground">Evaluation:</span> Stratified 80/20 split · {modelInfo.test_size.toLocaleString()} held-out test rows</p>
      </div>
    </div>
  );
}
