export interface KPIData {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
}

export interface RiskDistribution {
  category: string;
  count: number;
  percentage: number;
}
