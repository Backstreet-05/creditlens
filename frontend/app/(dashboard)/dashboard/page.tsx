import Link from "next/link";
import { ArrowRight, BarChart3, Cpu, Lightbulb } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import PredictionHistoryTable from "@/components/analytics/PredictionHistoryTable";
import type { PredictionResponse } from "@/types/prediction";

const QUICK_LINKS = [
  {
    href: "/predict",
    icon: Lightbulb,
    title: "New Prediction",
    description: "Assess a new applicant — enter their financial profile and get an instant risk score with SHAP explanation.",
  },
  {
    href: "/analytics",
    icon: BarChart3,
    title: "Analytics",
    description: "View risk distribution, KPIs, and trends across all predictions in your portfolio.",
  },
  {
    href: "/model",
    icon: Cpu,
    title: "Model Performance",
    description: "Inspect ROC-AUC, confusion matrix, and global SHAP feature importance for the trained XGBoost model.",
  },
];

interface HistoryRow {
  id: string;
  created_at: string;
  risk_score: number;
  risk_category: PredictionResponse["risk_category"];
  recommendation: PredictionResponse["recommendation"];
  default_probability: number;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let predictions: HistoryRow[] = [];
  if (user) {
    const { data } = await supabase
      .from("predictions")
      .select("id, created_at, risk_score, risk_category, recommendation, default_probability")
      .order("created_at", { ascending: false })
      .limit(5);
    predictions = (data ?? []) as HistoryRow[];
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Welcome to CreditLens</h2>
        <p className="mt-1 text-muted-foreground text-sm">
          ML-powered credit risk assessment — XGBoost · SHAP explainability · ROC-AUC 0.87
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {QUICK_LINKS.map(({ href, icon: Icon, title, description }) => (
          <Card key={href} className="group transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md hover:shadow-primary/8">
            <CardHeader className="pb-2">
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/20">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-base">{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <CardDescription className="text-xs leading-relaxed">{description}</CardDescription>
              <Link href={href}>
                <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs">
                  Open <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Model snapshot</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "ROC-AUC", value: "0.8686" },
              { label: "Training rows", value: "150,000" },
              { label: "Features", value: "10" },
              { label: "Algorithm", value: "XGBoost" },
            ].map(({ label, value }) => (
              <div key={label}>
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd className="mt-0.5 font-mono text-sm font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>

      {user && <PredictionHistoryTable predictions={predictions} />}
    </div>
  );
}
