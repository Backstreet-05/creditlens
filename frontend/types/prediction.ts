export interface ShapValue {
  feature: string;
  display_name: string;
  applicant_value: number;
  shap_contribution: number;
  direction: "increases_risk" | "decreases_risk";
}

export interface PredictionResponse {
  risk_score: number;
  default_probability: number;
  risk_category: "Low" | "Medium" | "High" | "Critical";
  recommendation: "Approve" | "Review" | "Reject";
  confidence: "Low" | "Moderate" | "High";
  shap_values: ShapValue[];
  reasoning: string;
  model_version: string;
}

export interface ModelInfo {
  algorithm: string;
  version: string;
  training_date: string;
  dataset_size: number;
  train_size: number;
  test_size: number;
  features: string[];
  threshold: number;
  scale_pos_weight: number;
  positive_class_rate: number;
  metrics: {
    roc_auc: number;
    precision: number;
    recall: number;
    f1: number;
    accuracy: number;
    confusion_matrix: [[number, number], [number, number]];
    roc_curve: { fpr: number[]; tpr: number[] };
  };
}

export interface GlobalShapFeature {
  feature: string;
  display_name: string;
  importance: number;
}
