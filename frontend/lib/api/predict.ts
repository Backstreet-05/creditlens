import type { ApplicantInput } from "@/types/applicant";
import type { GlobalShapFeature, ModelInfo, PredictionResponse } from "@/types/prediction";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail ?? `Request failed with status ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export async function fetchPrediction(input: ApplicantInput): Promise<PredictionResponse> {
  return apiFetch<PredictionResponse>("/predict", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function fetchModelInfo(): Promise<ModelInfo> {
  return apiFetch<ModelInfo>("/model/info");
}

export async function fetchGlobalShap(): Promise<GlobalShapFeature[]> {
  return apiFetch<GlobalShapFeature[]>("/model/shap-global");
}

export async function checkHealth(): Promise<{ status: string; model_loaded: boolean }> {
  return apiFetch("/health");
}
