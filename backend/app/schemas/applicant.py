from pydantic import BaseModel, Field


class ApplicantInput(BaseModel):
    revolving_utilization: float = Field(
        ..., ge=0.0, le=20.0, description="Total balance on credit cards / sum of credit limits"
    )
    age: int = Field(..., ge=18, le=110, description="Age of borrower in years")
    times_30_59_days_late: int = Field(
        ..., ge=0, le=98, description="Times borrower has been 30-59 days past due (not worse)"
    )
    debt_ratio: float = Field(
        ..., ge=0.0, le=500.0, description="Monthly debt payments / monthly gross income"
    )
    monthly_income: float = Field(..., ge=0.0, le=10_000_000.0, description="Monthly income in USD")
    open_credit_lines: int = Field(..., ge=0, le=100, description="Number of open loans and lines of credit")
    times_90_days_late: int = Field(..., ge=0, le=98, description="Times borrower has been 90+ days late")
    real_estate_loans: int = Field(
        ..., ge=0, le=50, description="Number of mortgage and real estate loans"
    )
    times_60_89_days_late: int = Field(
        ..., ge=0, le=98, description="Times borrower has been 60-89 days past due (not worse)"
    )
    dependents: int = Field(..., ge=0, le=20, description="Number of dependents excluding borrower")

    model_config = {
        "json_schema_extra": {
            "example": {
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
        }
    }
