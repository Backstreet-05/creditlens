from pydantic import BaseModel, ConfigDict


class ShapValue(BaseModel):
    feature: str
    display_name: str
    applicant_value: float
    shap_contribution: float
    direction: str  # "increases_risk" | "decreases_risk"


class PredictionResponse(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    risk_score: int
    default_probability: float
    risk_category: str
    recommendation: str
    confidence: str
    shap_values: list[ShapValue]
    reasoning: str
    model_version: str
