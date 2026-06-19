"""End-to-end training pipeline for CreditLens.

Run from the backend/ directory:
    python -m ml.pipeline.train

Outputs four artifacts to backend/ml/artifacts/:
    model.joblib
    preprocessor.joblib
    shap_values_global.json
    model_metadata.json
"""

from __future__ import annotations

import json
from datetime import date
from pathlib import Path

import joblib
import numpy as np
import shap
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
    roc_curve,
)
from sklearn.model_selection import train_test_split
from xgboost import XGBClassifier

from ml.pipeline.preprocess import (
    DISPLAY_NAMES,
    FEATURE_COLUMNS,
    build_preprocessor,
    load_raw,
)

ARTIFACTS_DIR = Path(__file__).parent.parent / "artifacts"
ARTIFACTS_DIR.mkdir(exist_ok=True)


def main() -> None:
    print("=" * 50)
    print("CreditLens ML Training Pipeline")
    print("=" * 50)

    # ── 1. Load data ──────────────────────────────────
    print("\n[1/5] Loading data...")
    X, y = load_raw()
    n_pos = int(y.sum())
    n_neg = int((y == 0).sum())
    print(f"  Rows: {len(X):,}  |  Positive: {n_pos:,} ({y.mean():.2%})  |  Negative: {n_neg:,}")

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"  Train: {len(X_train):,}  |  Test: {len(X_test):,}")

    # ── 2. Preprocess ─────────────────────────────────
    print("\n[2/5] Fitting preprocessor...")
    preprocessor = build_preprocessor()
    X_train_t = preprocessor.fit_transform(X_train)
    X_test_t = preprocessor.transform(X_test)

    scale_pos_weight = float(n_neg / n_pos)
    print(f"  scale_pos_weight: {scale_pos_weight:.2f}")

    # ── 3. Train ──────────────────────────────────────
    print("\n[3/5] Training XGBoost...")
    model = XGBClassifier(
        n_estimators=300,
        max_depth=4,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        min_child_weight=5,
        scale_pos_weight=scale_pos_weight,
        eval_metric="auc",
        random_state=42,
        n_jobs=-1,
        verbosity=0,
    )
    model.fit(X_train_t, y_train, eval_set=[(X_test_t, y_test)], verbose=False)
    print("  Training complete.")

    # ── 4. Evaluate ───────────────────────────────────
    print("\n[4/5] Evaluating on held-out test set...")
    y_prob = model.predict_proba(X_test_t)[:, 1]
    y_pred = (y_prob >= 0.5).astype(int)

    roc_auc   = roc_auc_score(y_test, y_prob)
    precision = precision_score(y_test, y_pred, zero_division=0)
    recall    = recall_score(y_test, y_pred, zero_division=0)
    f1        = f1_score(y_test, y_pred, zero_division=0)
    accuracy  = accuracy_score(y_test, y_pred)
    cm        = confusion_matrix(y_test, y_pred).tolist()

    fpr_arr, tpr_arr, _ = roc_curve(y_test, y_prob)
    # downsample ROC curve to ~50 points for compact JSON
    step = max(1, len(fpr_arr) // 50)
    fpr_sampled = [round(float(v), 4) for v in fpr_arr[::step]]
    tpr_sampled = [round(float(v), 4) for v in tpr_arr[::step]]
    # always include endpoint (1, 1)
    if fpr_sampled[-1] < 1.0:
        fpr_sampled.append(1.0)
        tpr_sampled.append(1.0)

    print(f"  ROC-AUC  : {roc_auc:.4f}  (target >= 0.85)")
    print(f"  Precision: {precision:.4f}")
    print(f"  Recall   : {recall:.4f}")
    print(f"  F1       : {f1:.4f}")
    print(f"  Accuracy : {accuracy:.4f}")

    if roc_auc < 0.85:
        raise RuntimeError(f"ROC-AUC {roc_auc:.4f} is below the 0.85 acceptance threshold.")

    # ── 5. SHAP + save artifacts ──────────────────────
    print("\n[5/5] Computing global SHAP values and saving artifacts...")
    rng = np.random.default_rng(42)
    sample_idx = rng.choice(len(X_train_t), size=min(2000, len(X_train_t)), replace=False)
    explainer = shap.TreeExplainer(model)
    shap_vals = explainer.shap_values(X_train_t[sample_idx])
    mean_abs_shap = np.abs(shap_vals).mean(axis=0)

    global_shap = sorted(
        [
            {
                "feature": feat,
                "display_name": DISPLAY_NAMES[feat],
                "importance": round(float(mean_abs_shap[i]), 6),
            }
            for i, feat in enumerate(FEATURE_COLUMNS)
        ],
        key=lambda x: x["importance"],
        reverse=True,
    )

    metadata = {
        "algorithm": "XGBoostClassifier",
        "version": "1.0.0",
        "training_date": str(date.today()),
        "dataset_size": len(X),
        "train_size": len(X_train),
        "test_size": len(X_test),
        "features": FEATURE_COLUMNS,
        "metrics": {
            "roc_auc": round(roc_auc, 4),
            "precision": round(precision, 4),
            "recall": round(recall, 4),
            "f1": round(f1, 4),
            "accuracy": round(accuracy, 4),
            "confusion_matrix": cm,
            "roc_curve": {"fpr": fpr_sampled, "tpr": tpr_sampled},
        },
        "threshold": 0.5,
        "scale_pos_weight": round(scale_pos_weight, 2),
        "positive_class_rate": round(float(y.mean()), 4),
    }

    joblib.dump(model, ARTIFACTS_DIR / "model.joblib")
    joblib.dump(preprocessor, ARTIFACTS_DIR / "preprocessor.joblib")
    with open(ARTIFACTS_DIR / "shap_values_global.json", "w") as f:
        json.dump(global_shap, f, indent=2)
    with open(ARTIFACTS_DIR / "model_metadata.json", "w") as f:
        json.dump(metadata, f, indent=2)

    print("\nArtifacts saved:")
    for p in sorted(ARTIFACTS_DIR.iterdir()):
        print(f"  {p.name:<30} {p.stat().st_size:>10,} bytes")

    print("\nM2 complete. Backend is now ready to serve predictions.")


if __name__ == "__main__":
    main()
