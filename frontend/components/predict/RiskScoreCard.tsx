import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getRiskColor, getRecommendationColor, formatProbability } from "@/lib/utils/risk";
import type { PredictionResponse } from "@/types/prediction";
import { cn } from "@/lib/utils";

interface RiskScoreCardProps {
  prediction: PredictionResponse;
}

export default function RiskScoreCard({ prediction }: RiskScoreCardProps) {
  const riskColor = getRiskColor(prediction.risk_category);
  const recColor = getRecommendationColor(prediction.recommendation);

  return (
    <Card className={cn("border-2", riskColor.border)}>
      <CardContent className="pt-6 space-y-4">
        {/* Score */}
        <div className="text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Risk Score</p>
          <p className={cn("mt-1 font-mono text-6xl font-bold tabular-nums", riskColor.text)}>
            {prediction.risk_score}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">out of 100</p>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap justify-center gap-2">
          <span
            className={cn(
              "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
              riskColor.bg, riskColor.text
            )}
          >
            {prediction.risk_category} Risk
          </span>
          <span
            className={cn(
              "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
              recColor.bg, recColor.text
            )}
          >
            {prediction.recommendation}
          </span>
        </div>

        {/* Details */}
        <div className="space-y-2 border-t border-border pt-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Default probability</span>
            <span className={cn("font-mono font-semibold", riskColor.text)}>
              {formatProbability(prediction.default_probability)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Confidence</span>
            <span className="font-medium">{prediction.confidence}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Model version</span>
            <span className="font-mono text-muted-foreground">{prediction.model_version}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
