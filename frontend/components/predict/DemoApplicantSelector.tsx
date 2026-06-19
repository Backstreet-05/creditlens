"use client";

import { Button } from "@/components/ui/button";
import type { ApplicantInput } from "@/types/applicant";

interface DemoApplicant {
  name: string;
  label: string;
  color: string;
  values: ApplicantInput;
}

const DEMO_APPLICANTS: DemoApplicant[] = [
  {
    name: "Sarah Chen",
    label: "Low risk",
    color: "text-emerald-400",
    values: {
      revolving_utilization: 0.12,
      age: 34,
      times_30_59_days_late: 0,
      debt_ratio: 0.18,
      monthly_income: 7200,
      open_credit_lines: 6,
      times_90_days_late: 0,
      real_estate_loans: 1,
      times_60_89_days_late: 0,
      dependents: 1,
    },
  },
  {
    name: "Marcus Johnson",
    label: "Medium risk",
    color: "text-amber-400",
    values: {
      revolving_utilization: 0.42,
      age: 45,
      times_30_59_days_late: 1,
      debt_ratio: 0.38,
      monthly_income: 5100,
      open_credit_lines: 9,
      times_90_days_late: 0,
      real_estate_loans: 2,
      times_60_89_days_late: 0,
      dependents: 2,
    },
  },
  {
    name: "David Rodriguez",
    label: "High risk",
    color: "text-red-400",
    values: {
      revolving_utilization: 0.91,
      age: 28,
      times_30_59_days_late: 3,
      debt_ratio: 0.65,
      monthly_income: 2800,
      open_credit_lines: 12,
      times_90_days_late: 2,
      real_estate_loans: 0,
      times_60_89_days_late: 1,
      dependents: 3,
    },
  },
];

interface DemoApplicantSelectorProps {
  onSelect: (values: ApplicantInput) => void;
}

export default function DemoApplicantSelector({ onSelect }: DemoApplicantSelectorProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-muted-foreground shrink-0">Demo applicants:</span>
      {DEMO_APPLICANTS.map((applicant) => (
        <Button
          key={applicant.name}
          variant="outline"
          size="sm"
          className="h-7 gap-1.5 text-xs"
          onClick={() => onSelect(applicant.values)}
        >
          {applicant.name}
          <span className={applicant.color}>· {applicant.label}</span>
        </Button>
      ))}
    </div>
  );
}
