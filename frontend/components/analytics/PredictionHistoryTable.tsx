import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getRiskColor, getRecommendationColor, formatProbability } from "@/lib/utils/risk";
import { cn } from "@/lib/utils";
import type { PredictionResponse } from "@/types/prediction";

interface HistoryRow {
  id: string;
  created_at: string;
  risk_score: number;
  risk_category: PredictionResponse["risk_category"];
  recommendation: PredictionResponse["recommendation"];
  default_probability: number;
}

interface PredictionHistoryTableProps {
  predictions: HistoryRow[];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PredictionHistoryTable({ predictions }: PredictionHistoryTableProps) {
  if (predictions.length === 0) {
    return (
      <Card className="border-border/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Recent predictions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No predictions yet. Go to{" "}
            <a href="/predict" className="underline underline-offset-2 hover:text-foreground transition-colors">
              New Prediction
            </a>{" "}
            to get started.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Recent predictions</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Date</TableHead>
              <TableHead className="text-xs text-right">Score</TableHead>
              <TableHead className="text-xs">Category</TableHead>
              <TableHead className="text-xs">Decision</TableHead>
              <TableHead className="text-xs text-right">Probability</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {predictions.map((row) => {
              const riskColor = getRiskColor(row.risk_category);
              const recColor = getRecommendationColor(row.recommendation);
              return (
                <TableRow key={row.id}>
                  <TableCell className="text-xs text-muted-foreground">{formatDate(row.created_at)}</TableCell>
                  <TableCell className={cn("text-right font-mono text-sm font-semibold", riskColor.text)}>
                    {row.risk_score}
                  </TableCell>
                  <TableCell>
                    <span className={cn("text-xs font-medium", riskColor.text)}>{row.risk_category}</span>
                  </TableCell>
                  <TableCell>
                    <span className={cn("text-xs font-medium", recColor.text)}>{row.recommendation}</span>
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-muted-foreground">
                    {formatProbability(row.default_probability)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
