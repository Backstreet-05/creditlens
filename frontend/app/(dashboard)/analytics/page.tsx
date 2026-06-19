import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import KPICard from "@/components/analytics/KPICard";
import RiskDistributionChart from "@/components/analytics/RiskDistributionChart";
import PredictionHistoryTable from "@/components/analytics/PredictionHistoryTable";
import type { PredictionResponse } from "@/types/prediction";

export const metadata = { title: "Analytics" };

interface PredRow {
  id: string;
  created_at: string;
  risk_score: number;
  risk_category: PredictionResponse["risk_category"];
  recommendation: PredictionResponse["recommendation"];
  default_probability: number;
}

const DEMO_PREDICTIONS: PredRow[] = [
  {
    id: "demo-1",
    created_at: new Date(Date.now() - 3 * 60_000).toISOString(),
    risk_score: 97,
    risk_category: "Critical",
    recommendation: "Reject",
    default_probability: 0.972,
  },
  {
    id: "demo-2",
    created_at: new Date(Date.now() - 8 * 60_000).toISOString(),
    risk_score: 38,
    risk_category: "Medium",
    recommendation: "Review",
    default_probability: 0.234,
  },
  {
    id: "demo-3",
    created_at: new Date(Date.now() - 15 * 60_000).toISOString(),
    risk_score: 12,
    risk_category: "Low",
    recommendation: "Approve",
    default_probability: 0.098,
  },
];

const CATEGORIES = ["Low", "Medium", "High", "Critical"] as const;

function computeKPIs(rows: PredRow[]) {
  const total = rows.length;
  const avgScore = total > 0 ? Math.round(rows.reduce((s, r) => s + r.risk_score, 0) / total) : 0;
  const approvalRate =
    total > 0
      ? Math.round((rows.filter((r) => r.recommendation === "Approve").length / total) * 100)
      : 0;
  const highCritical = rows.filter(
    (r) => r.risk_category === "High" || r.risk_category === "Critical"
  ).length;
  const distribution = CATEGORIES.map((cat) => ({
    category: cat,
    count: rows.filter((r) => r.risk_category === cat).length,
  }));
  return { total, avgScore, approvalRate, highCritical, distribution };
}

export default async function AnalyticsPage() {
  const cookieStore = await cookies();
  const isDemo = cookieStore.get("cri_demo_mode")?.value === "true";

  let predictions: PredRow[] = [];

  if (isDemo) {
    predictions = DEMO_PREDICTIONS;
  } else {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("predictions")
        .select("id, created_at, risk_score, risk_category, recommendation, default_probability")
        .order("created_at", { ascending: false });
      predictions = (data ?? []) as PredRow[];
    }
  }

  const { total, avgScore, approvalRate, highCritical, distribution } = computeKPIs(predictions);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Analytics</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {isDemo
            ? "Showing 3 demo applicants — sign up to track your own predictions."
            : `${total} prediction${total !== 1 ? "s" : ""} in your history`}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard label="Total Predictions" value={total} />
        <KPICard
          label="Approval Rate"
          value={`${approvalRate}%`}
          subtext="Recommend: Approve"
          accent={approvalRate >= 50 ? "green" : approvalRate >= 25 ? "yellow" : "red"}
        />
        <KPICard
          label="Avg Risk Score"
          value={total > 0 ? avgScore : "—"}
          subtext="0 = no risk · 100 = max risk"
        />
        <KPICard
          label="High / Critical"
          value={highCritical}
          subtext="Applicants needing review"
          accent={highCritical > 0 ? "red" : "green"}
        />
      </div>

      <RiskDistributionChart data={distribution} />

      {predictions.length > 0 && (
        <PredictionHistoryTable predictions={predictions} />
      )}
    </div>
  );
}
