import pytest
from fastapi.testclient import TestClient

from app.services.predictor import _categorize_risk, _confidence_band

VALID_INPUT = {
    "revolving_utilization": 0.45,
    "age": 42,
    "times_30_59_days_late": 1,
    "debt_ratio": 0.32,
    "monthly_income": 5800.0,
    "open_credit_lines": 8,
    "times_90_days_late": 0,
    "real_estate_loans": 1,
    "times_60_89_days_late": 0,
    "dependents": 2,
}


# --- Endpoint tests (Issue #20) ---

def test_valid_input_returns_prediction(client_with_model):
    response = client_with_model.post("/predict", json=VALID_INPUT)
    assert response.status_code == 200
    data = response.json()
    assert "risk_score" in data
    assert "default_probability" in data
    assert "risk_category" in data
    assert "recommendation" in data
    assert "confidence" in data
    assert "shap_values" in data
    assert "reasoning" in data
    assert "model_version" in data


def test_missing_field_returns_422(client_with_model):
    incomplete = {k: v for k, v in VALID_INPUT.items() if k != "age"}
    response = client_with_model.post("/predict", json=incomplete)
    assert response.status_code == 422


def test_risk_score_in_valid_range(client_with_model):
    response = client_with_model.post("/predict", json=VALID_INPUT)
    assert response.status_code == 200
    risk_score = response.json()["risk_score"]
    assert 0 <= risk_score <= 100


def test_shap_values_present(client_with_model):
    response = client_with_model.post("/predict", json=VALID_INPUT)
    assert response.status_code == 200
    shap_values = response.json()["shap_values"]
    assert isinstance(shap_values, list)
    assert len(shap_values) > 0


def test_shap_values_count(client_with_model):
    response = client_with_model.post("/predict", json=VALID_INPUT)
    assert response.status_code == 200
    # Project spec: top 5 contributing features
    assert len(response.json()["shap_values"]) == 5


def test_shap_direction_matches_sign(client_with_model):
    response = client_with_model.post("/predict", json=VALID_INPUT)
    assert response.status_code == 200
    for sv in response.json()["shap_values"]:
        contribution = sv["shap_contribution"]
        direction = sv["direction"]
        if contribution > 0:
            assert direction == "increases_risk", f"Positive SHAP should be increases_risk, got {direction}"
        elif contribution < 0:
            assert direction == "decreases_risk", f"Negative SHAP should be decreases_risk, got {direction}"


def test_recommendation_values_are_valid(client_with_model):
    response = client_with_model.post("/predict", json=VALID_INPUT)
    assert response.status_code == 200
    assert response.json()["recommendation"] in {"Approve", "Review", "Reject"}


def test_risk_category_values_are_valid(client_with_model):
    response = client_with_model.post("/predict", json=VALID_INPUT)
    assert response.status_code == 200
    assert response.json()["risk_category"] in {"Low", "Medium", "High", "Critical"}


def test_extra_field_ignored(client_with_model):
    with_extra = {**VALID_INPUT, "unknown_field": 99}
    response = client_with_model.post("/predict", json=with_extra)
    # FastAPI ignores extra fields by default; prediction should still succeed
    assert response.status_code == 200


def test_default_probability_is_a_probability(client_with_model):
    response = client_with_model.post("/predict", json=VALID_INPUT)
    assert response.status_code == 200
    prob = response.json()["default_probability"]
    assert 0.0 <= prob <= 1.0


# --- Unit tests: _categorize_risk ---

@pytest.mark.parametrize("prob,expected_category,expected_rec", [
    (0.00, "Low", "Approve"),
    (0.10, "Low", "Approve"),
    (0.14, "Low", "Approve"),
    (0.15, "Medium", "Review"),
    (0.20, "Medium", "Review"),
    (0.29, "Medium", "Review"),
    (0.30, "High", "Reject"),
    (0.40, "High", "Reject"),
    (0.49, "High", "Reject"),
    (0.50, "Critical", "Reject"),
    (0.75, "Critical", "Reject"),
    (0.99, "Critical", "Reject"),
])
def test_categorize_risk_boundaries(prob, expected_category, expected_rec):
    category, rec = _categorize_risk(prob)
    assert category == expected_category, f"prob={prob}: expected {expected_category}, got {category}"
    assert rec == expected_rec, f"prob={prob}: expected rec {expected_rec}, got {rec}"


def test_categorize_risk_approve_only_for_low():
    for prob in [0.0, 0.05, 0.14]:
        _, rec = _categorize_risk(prob)
        assert rec == "Approve"
    for prob in [0.15, 0.30, 0.50]:
        _, rec = _categorize_risk(prob)
        assert rec != "Approve"


# --- Unit tests: _confidence_band ---

def test_confidence_band_low_near_threshold():
    # prob=0.15 is exactly on Low/Medium boundary → distance=0.0 → "Low" confidence
    assert _confidence_band(0.15) == "Low"


def test_confidence_band_high_center_of_range():
    # prob=0.75 is well inside Critical (0.50–1.01) → distance to nearest threshold is 0.25 → "High" confidence
    assert _confidence_band(0.75) == "High"


def test_confidence_band_returns_valid_value():
    for prob in [0.0, 0.15, 0.30, 0.50, 0.75, 1.0]:
        result = _confidence_band(prob)
        assert result in {"Low", "Moderate", "High"}, f"Unexpected confidence band: {result}"
