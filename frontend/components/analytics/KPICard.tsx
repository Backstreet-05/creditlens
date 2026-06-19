import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KPICardProps {
  label: string;
  value: string | number;
  subtext?: string;
  accent?: "default" | "green" | "yellow" | "red";
}

const ACCENT_CLASSES: Record<NonNullable<KPICardProps["accent"]>, string> = {
  default: "border-border",
  green: "border-emerald-500/40",
  yellow: "border-yellow-500/40",
  red: "border-red-500/40",
};

export default function KPICard({ label, value, subtext, accent = "default" }: KPICardProps) {
  return (
    <Card className={cn("border", ACCENT_CLASSES[accent])}>
      <CardContent className="pt-5">
        <p className="text-xs text-muted-foreground uppercase tracking-widest">{label}</p>
        <p className="mt-1 text-3xl font-bold tabular-nums">{value}</p>
        {subtext && <p className="mt-1 text-xs text-muted-foreground">{subtext}</p>}
      </CardContent>
    </Card>
  );
}
