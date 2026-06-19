"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/client";
import { fetchPrediction } from "@/lib/api/predict";
import { FIELD_METADATA, type ApplicantInput } from "@/types/applicant";
import type { PredictionResponse } from "@/types/prediction";
import ApplicantForm, { type FormValues } from "@/components/predict/ApplicantForm";
import DemoApplicantSelector from "@/components/predict/DemoApplicantSelector";
import RiskScoreCard from "@/components/predict/RiskScoreCard";
import ShapWaterfallChart from "@/components/predict/ShapWaterfallChart";
import RiskReasoningText from "@/components/predict/RiskReasoningText";
import ColdStartWarning from "@/components/shared/ColdStartWarning";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckCircle } from "lucide-react";

// react-pdf uses browser canvas APIs — must not run on the server
const DownloadPdfButton = dynamic(
  () => import("@/components/predict/DownloadPdfButton"),
  { ssr: false, loading: () => null }
);

const EMPTY_FORM: FormValues = {
  revolving_utilization: "",
  age: "",
  times_30_59_days_late: "",
  debt_ratio: "",
  monthly_income: "",
  open_credit_lines: "",
  times_90_days_late: "",
  real_estate_loans: "",
  times_60_89_days_late: "",
  dependents: "",
};

const INTEGER_FIELDS = new Set<keyof ApplicantInput>([
  "age", "times_30_59_days_late", "open_credit_lines",
  "times_90_days_late", "real_estate_loans", "times_60_89_days_late", "dependents",
]);

function parseValues(raw: FormValues): { input: ApplicantInput | null; errors: Partial<Record<keyof ApplicantInput, string>> } {
  const errors: Partial<Record<keyof ApplicantInput, string>> = {};
  const input: Partial<ApplicantInput> = {};

  for (const key of Object.keys(raw) as (keyof ApplicantInput)[]) {
    const str = raw[key].trim();
    if (str === "") {
      errors[key] = "Required";
      continue;
    }
    const num = Number(str);
    if (isNaN(num)) {
      errors[key] = "Must be a number";
      continue;
    }
    if (INTEGER_FIELDS.has(key) && !Number.isInteger(num)) {
      errors[key] = "Must be a whole number";
      continue;
    }
    (input as Record<keyof ApplicantInput, number>)[key] = num;
  }

  return Object.keys(errors).length > 0 ? { input: null, errors } : { input: input as ApplicantInput, errors: {} };
}

interface PredictClientProps {
  userId: string | null;
}

export default function PredictClient({ userId }: PredictClientProps) {
  const supabase = createClient();

  const [values, setValues] = useState<FormValues>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof ApplicantInput, string>>>({});
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [lastInput, setLastInput] = useState<ApplicantInput | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function handleChange(field: keyof ApplicantInput, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function handleDemoSelect(input: ApplicantInput) {
    const stringified = Object.fromEntries(
      Object.entries(input).map(([k, v]) => [k, String(v)])
    ) as FormValues;
    setValues(stringified);
    setErrors({});
    setPrediction(null);
    setSaved(false);
    setApiError(null);
  }

  async function handleSubmit() {
    const { input, errors: validationErrors } = parseValues(values);
    if (!input) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setApiError(null);
    setPrediction(null);
    setSaved(false);
    setLoading(true);
    setLastInput(input);
    try {
      const result = await fetchPrediction(input);
      setPrediction(result);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Failed to reach the prediction API.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!prediction || !lastInput || !userId) return;
    setSaving(true);
    try {
      await supabase.from("predictions").insert({
        user_id: userId,
        input_data: lastInput,
        risk_score: prediction.risk_score,
        default_probability: prediction.default_probability,
        risk_category: prediction.risk_category,
        recommendation: prediction.recommendation,
        shap_values: prediction.shap_values,
        model_version: prediction.model_version,
        is_demo: false,
      });
      setSaved(true);
    } catch {
      // silent — save is best-effort
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">New Prediction</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter an applicant&apos;s financial profile to get an instant risk score and SHAP explanation.
        </p>
      </div>

      <DemoApplicantSelector onSelect={handleDemoSelect} />

      <ApplicantForm
        values={values}
        errors={errors}
        loading={loading}
        onChange={handleChange}
        onSubmit={handleSubmit}
      />

      {loading && <ColdStartWarning />}

      {apiError && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {apiError}
        </div>
      )}

      {prediction && (
        <>
          <Separator />
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Results</h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <RiskScoreCard prediction={prediction} />
              <ShapWaterfallChart shapValues={prediction.shap_values} />
            </div>

            <RiskReasoningText prediction={prediction} />

            <div className="flex flex-wrap items-center gap-3">
              {lastInput && (
                <DownloadPdfButton prediction={prediction} input={lastInput} />
              )}
              {userId && (
                saved ? (
                  <span className="flex items-center gap-1.5 text-sm text-emerald-400">
                    <CheckCircle className="h-4 w-4" /> Saved to history
                  </span>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? "Saving…" : "Save prediction"}
                  </Button>
                )
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
