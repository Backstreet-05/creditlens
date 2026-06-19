import type { PredictionResponse } from "@/types/prediction";

export const RISK_COLORS = {
  Low: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/30", hex: "#10b981" },
  Medium: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/30", hex: "#f59e0b" },
  High: { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/30", hex: "#f97316" },
  Critical: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/30", hex: "#ef4444" },
} as const;

export const RECOMMENDATION_COLORS = {
  Approve: { bg: "bg-emerald-500/10", text: "text-emerald-400" },
  Review: { bg: "bg-amber-500/10", text: "text-amber-400" },
  Reject: { bg: "bg-red-500/10", text: "text-red-400" },
} as const;

export function formatProbability(prob: number): string {
  return `${(prob * 100).toFixed(1)}%`;
}

export function getRiskColor(category: PredictionResponse["risk_category"]) {
  return RISK_COLORS[category] ?? RISK_COLORS.Medium;
}

export function getRecommendationColor(rec: PredictionResponse["recommendation"]) {
  return RECOMMENDATION_COLORS[rec] ?? RECOMMENDATION_COLORS.Review;
}
