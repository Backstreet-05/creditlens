"""Preprocessing utilities for the CreditLens ML pipeline.

Re-exports UpperWinsorizer and build_preprocessor from app.core.preprocessing
so notebooks can import from a single pipeline-level namespace.
"""

from __future__ import annotations

from pathlib import Path

import pandas as pd

from app.core.preprocessing import UpperWinsorizer, build_preprocessor  # noqa: F401

DATA_DIR = Path(__file__).parent.parent / "data"

COLUMN_MAP = {
    "RevolvingUtilizationOfUnsecuredLines": "revolving_utilization",
    "age": "age",
    "NumberOfTime30-59DaysPastDueNotWorse": "times_30_59_days_late",
    "DebtRatio": "debt_ratio",
    "MonthlyIncome": "monthly_income",
    "NumberOfOpenCreditLinesAndLoans": "open_credit_lines",
    "NumberOfTimes90DaysLate": "times_90_days_late",
    "NumberRealEstateLoansOrLines": "real_estate_loans",
    "NumberOfTime60-89DaysPastDueNotWorse": "times_60_89_days_late",
    "NumberOfDependents": "dependents",
}

FEATURE_COLUMNS = list(COLUMN_MAP.values())
TARGET_COLUMN = "SeriousDlqin2yrs"

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


def load_raw() -> tuple[pd.DataFrame, pd.Series]:
    """Load and rename the raw CSV; return (X, y)."""
    df = pd.read_csv(DATA_DIR / "cs-training.csv", index_col=0)
    df = df.rename(columns=COLUMN_MAP)
    df = df.dropna(subset=[TARGET_COLUMN])
    X = df[FEATURE_COLUMNS]
    y = df[TARGET_COLUMN].astype(int)
    return X, y
