"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { FIELD_METADATA, type ApplicantInput } from "@/types/applicant";
import { cn } from "@/lib/utils";

export type FormValues = { [K in keyof ApplicantInput]: string };

const FIELD_ORDER: (keyof ApplicantInput)[] = [
  "revolving_utilization",
  "age",
  "monthly_income",
  "debt_ratio",
  "times_30_59_days_late",
  "times_60_89_days_late",
  "times_90_days_late",
  "open_credit_lines",
  "real_estate_loans",
  "dependents",
];

const FIELD_CONFIG: Record<keyof ApplicantInput, { min: number; max?: number; step: string }> = {
  revolving_utilization:  { min: 0,  max: 20,  step: "0.01" },
  age:                    { min: 18, max: 110, step: "1" },
  times_30_59_days_late:  { min: 0,  max: 98,  step: "1" },
  debt_ratio:             { min: 0,  max: 500, step: "0.01" },
  monthly_income:         { min: 0,            step: "1" },
  open_credit_lines:      { min: 0,  max: 100, step: "1" },
  times_90_days_late:     { min: 0,  max: 98,  step: "1" },
  real_estate_loans:      { min: 0,  max: 50,  step: "1" },
  times_60_89_days_late:  { min: 0,  max: 98,  step: "1" },
  dependents:             { min: 0,  max: 20,  step: "1" },
};

interface ApplicantFormProps {
  values: FormValues;
  errors: Partial<Record<keyof ApplicantInput, string>>;
  loading: boolean;
  onChange: (field: keyof ApplicantInput, value: string) => void;
  onSubmit: () => void;
}

export default function ApplicantForm({ values, errors, loading, onChange, onSubmit }: ApplicantFormProps) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {FIELD_ORDER.map((field) => {
          const meta = FIELD_METADATA[field];
          const cfg = FIELD_CONFIG[field];
          const err = errors[field];

          return (
            <div key={field} className="space-y-1.5">
              <div className="flex items-center gap-1">
                <Label htmlFor={field} className="text-xs font-medium">
                  {meta.label}
                  {meta.unit && (
                    <span className="ml-1 font-normal text-muted-foreground">({meta.unit})</span>
                  )}
                </Label>
                <Tooltip>
                  <TooltipTrigger className="cursor-help" type="button">
                    <Info className="h-3 w-3 shrink-0 text-muted-foreground/60" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-56 text-xs">
                    {meta.tooltip}
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input
                id={field}
                type="number"
                min={cfg.min}
                max={cfg.max}
                step={cfg.step}
                value={values[field]}
                onChange={(e) => onChange(field, e.target.value)}
                placeholder={cfg.max !== undefined ? `${cfg.min}–${cfg.max}` : `≥ ${cfg.min}`}
                className={cn("h-9 font-mono text-sm", err && "border-destructive")}
              />
              {err && <p className="text-xs text-destructive">{err}</p>}
            </div>
          );
        })}
      </div>

      <Button onClick={onSubmit} disabled={loading} className="w-full sm:w-auto">
        {loading ? "Assessing…" : "Assess Risk"}
      </Button>
    </div>
  );
}
