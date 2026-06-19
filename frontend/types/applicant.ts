export interface ApplicantInput {
  revolving_utilization: number;
  age: number;
  times_30_59_days_late: number;
  debt_ratio: number;
  monthly_income: number;
  open_credit_lines: number;
  times_90_days_late: number;
  real_estate_loans: number;
  times_60_89_days_late: number;
  dependents: number;
}

export const FIELD_METADATA: Record<
  keyof ApplicantInput,
  { label: string; tooltip: string; unit?: string }
> = {
  revolving_utilization: {
    label: "Credit Utilization",
    tooltip: "Total balance on credit cards divided by total credit limits. Values above 1.0 indicate over-limit usage.",
    unit: "ratio",
  },
  age: {
    label: "Applicant Age",
    tooltip: "Age of the borrower in years.",
    unit: "years",
  },
  times_30_59_days_late: {
    label: "30–59 Day Late Payments",
    tooltip: "Number of times the borrower has been 30–59 days past due in the last 2 years.",
  },
  debt_ratio: {
    label: "Debt Ratio",
    tooltip: "Monthly debt payments divided by monthly gross income. A ratio above 0.43 is generally considered high.",
    unit: "ratio",
  },
  monthly_income: {
    label: "Monthly Income",
    tooltip: "Gross monthly income in USD.",
    unit: "USD",
  },
  open_credit_lines: {
    label: "Open Credit Lines",
    tooltip: "Total number of open loans and lines of credit.",
  },
  times_90_days_late: {
    label: "90+ Day Late Payments",
    tooltip: "Number of times the borrower has been 90 or more days past due. Strong predictor of default.",
  },
  real_estate_loans: {
    label: "Real Estate Loans",
    tooltip: "Number of mortgage and real estate loans including home equity lines.",
  },
  times_60_89_days_late: {
    label: "60–89 Day Late Payments",
    tooltip: "Number of times the borrower has been 60–89 days past due in the last 2 years.",
  },
  dependents: {
    label: "Number of Dependents",
    tooltip: "Number of dependents in the family, excluding the borrower.",
  },
};
