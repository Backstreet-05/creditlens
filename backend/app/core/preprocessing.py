from __future__ import annotations

import numpy as np
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler


class UpperWinsorizer(BaseEstimator, TransformerMixin):
    """Cap each feature at its 99th-percentile value (fitted on training data)."""

    def fit(self, X, y=None):
        self.upper_ = np.percentile(X, 99, axis=0)
        return self

    def transform(self, X):
        return np.clip(X, a_min=None, a_max=self.upper_)


def build_preprocessor() -> Pipeline:
    return Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("winsorizer", UpperWinsorizer()),
        ("scaler", StandardScaler()),
    ])
