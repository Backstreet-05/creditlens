import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import type { PredictionResponse } from "@/types/prediction";

interface RiskReasoningTextProps {
  prediction: PredictionResponse;
}

export default function RiskReasoningText({ prediction }: RiskReasoningTextProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
          Model reasoning
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed text-muted-foreground">{prediction.reasoning}</p>
      </CardContent>
    </Card>
  );
}
