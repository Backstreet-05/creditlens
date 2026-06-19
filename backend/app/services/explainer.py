from __future__ import annotations

import numpy as np

from app.schemas.prediction import ShapValue

TOP_N = 5


class ExplainerService:
    def __init__(self, model, display_names: dict[str, str]) -> None:
        import shap  # lazy import — only needed after M2 artifacts exist
        self.explainer = shap.TreeExplainer(model)
        self.display_names = display_names

    def local_shap(self, X_transformed: np.ndarray, df_original) -> list[ShapValue]:
        shap_vals = self.explainer.shap_values(X_transformed)[0]
        feature_names = list(df_original.columns)

        contributions = [
            ShapValue(
                feature=name,
                display_name=self.display_names.get(name, name),
                applicant_value=float(df_original[name].iloc[0]),
                shap_contribution=round(float(shap_vals[i]), 4),
                direction="increases_risk" if shap_vals[i] > 0 else "decreases_risk",
            )
            for i, name in enumerate(feature_names)
        ]

        return sorted(contributions, key=lambda x: abs(x.shap_contribution), reverse=True)[:TOP_N]

    def generate_reasoning(
        self, shap_values: list[ShapValue], risk_category: str, probability: float
    ) -> str:
        if not shap_values:
            return f"This applicant has been classified as {risk_category} risk with a {probability:.0%} estimated default probability."

        top = shap_values[0]
        direction_phrase = "significantly increases" if top.shap_contribution > 0 else "significantly reduces"

        if top.feature == "revolving_utilization":
            top_detail = f"credit utilization of {top.applicant_value:.0%}"
        elif top.feature == "monthly_income":
            top_detail = f"monthly income of ${top.applicant_value:,.0f}"
        elif top.feature in ("times_90_days_late", "times_30_59_days_late", "times_60_89_days_late"):
            top_detail = f"{int(top.applicant_value)} instance(s) of {top.display_name.lower()}"
        elif top.feature == "debt_ratio":
            top_detail = f"debt ratio of {top.applicant_value:.2f}"
        elif top.feature == "age":
            top_detail = f"age of {int(top.applicant_value)}"
        else:
            top_detail = f"{top.display_name.lower()} of {top.applicant_value}"

        risk_drivers = [sv for sv in shap_values if sv.direction == "increases_risk"]
        secondary = f" Additionally, {risk_drivers[1].display_name.lower()} contributes to elevated risk." if len(risk_drivers) > 1 else ""

        return (
            f"This applicant's {top_detail} {direction_phrase} their risk score. "
            f"The model assigns a {risk_category} risk classification with an estimated "
            f"{probability:.0%} probability of default.{secondary}"
        )
