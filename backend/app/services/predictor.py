from pathlib import Path

import joblib
import numpy as np
import pandas as pd

from app.core.preprocessing import UpperWinsorizer  # noqa: F401 — required for joblib unpickling
from app.schemas.applicant import ApplicantInput
from app.schemas.prediction import PredictionResponse, ShapValue
from app.services.explainer import ExplainerService

ARTIFACTS_DIR = Path(__file__).parent.parent.parent / "ml" / "artifacts"

FEATURE_COLUMNS = [
    "revolving_utilization",
    "age",
    "times_30_59_days_late",
    "debt_ratio",
    "monthly_income",
    "open_credit_lines",
    "times_90_days_late",
    "real_estate_loans",
    "times_60_89_days_late",
    "dependents",
]

DISPLAY_NAMES = {
    "revolving_utilization": "Credit Utilization",
    "age": "Applicant Age",
    "times_30_59_days_late": "30-59 Day Late Payments",
    "debt_ratio": "Debt Ratio",
    "monthly_income": "Monthly Income",
    "open_credit_lines": "Open Credit Lines",
    "times_90_days_late": "90+ Day Late Payments",
    "real_estate_loans": "Real Estate Loans",
    "times_60_89_days_late": "60-89 Day Late Payments",
    "dependents": "Number of Dependents",
}

RISK_THRESHOLDS = {
    "Low": (0.0, 0.15),
    "Medium": (0.15, 0.30),
    "High": (0.30, 0.50),
    "Critical": (0.50, 1.01),
}


def _categorize_risk(prob: float) -> tuple[str, str]:
    for category, (low, high) in RISK_THRESHOLDS.items():
        if low <= prob < high:
            recommendation = "Approve" if category == "Low" else ("Review" if category == "Medium" else "Reject")
            return category, recommendation
    return "Critical", "Reject"


def _confidence_band(prob: float) -> str:
    distance_from_threshold = min(
        abs(prob - t) for thresholds in RISK_THRESHOLDS.values() for t in thresholds if 0 < t < 1
    )
    if distance_from_threshold < 0.05:
        return "Low"
    elif distance_from_threshold < 0.12:
        return "Moderate"
    return "High"


class PredictorService:
    def __init__(self) -> None:
        self.model = None
        self.preprocessor = None
        self.explainer: ExplainerService | None = None
        self.loaded = False

    def load(self) -> None:
        model_path = ARTIFACTS_DIR / "model.joblib"
        preprocessor_path = ARTIFACTS_DIR / "preprocessor.joblib"

        if not model_path.exists() or not preprocessor_path.exists():
            # Artifacts not yet present (pre-M2). Health check will report model_loaded: false.
            return

        self.model = joblib.load(model_path)
        self.preprocessor = joblib.load(preprocessor_path)
        self.explainer = ExplainerService(self.model, DISPLAY_NAMES)
        self.loaded = True

    def predict(self, input_data: ApplicantInput) -> PredictionResponse:
        if not self.loaded:
            raise RuntimeError("Model artifacts not loaded. Complete M2 (ML pipeline) first.")

        df = pd.DataFrame([input_data.model_dump()], columns=FEATURE_COLUMNS)
        X = self.preprocessor.transform(df)
        prob = float(self.model.predict_proba(X)[0, 1])
        risk_score = round(prob * 100)
        risk_category, recommendation = _categorize_risk(prob)
        confidence = _confidence_band(prob)

        shap_values = self.explainer.local_shap(X, df)
        reasoning = self.explainer.generate_reasoning(shap_values, risk_category, prob)

        from app.core.config import settings
        return PredictionResponse(
            risk_score=risk_score,
            default_probability=round(prob, 4),
            risk_category=risk_category,
            recommendation=recommendation,
            confidence=confidence,
            shap_values=shap_values,
            reasoning=reasoning,
            model_version=settings.model_version,
        )
