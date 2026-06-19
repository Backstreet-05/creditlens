import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { ApplicantInput } from "@/types/applicant";
import type { PredictionResponse } from "@/types/prediction";

// ── Colour palette ────────────────────────────────────────────────
const CATEGORY_COLORS: Record<PredictionResponse["risk_category"], string> = {
  Low: "#10b981",
  Medium: "#f59e0b",
  High: "#f97316",
  Critical: "#ef4444",
};

const RECOMMENDATION_COLORS: Record<PredictionResponse["recommendation"], string> = {
  Approve: "#10b981",
  Review: "#f59e0b",
  Reject: "#ef4444",
};

// ── Field display names ───────────────────────────────────────────
const DISPLAY: Record<keyof ApplicantInput, { label: string; unit?: string }> = {
  revolving_utilization: { label: "Credit Utilization", unit: "ratio" },
  age:                   { label: "Applicant Age", unit: "years" },
  times_30_59_days_late: { label: "30–59 Day Late Payments" },
  debt_ratio:            { label: "Debt Ratio", unit: "ratio" },
  monthly_income:        { label: "Monthly Income", unit: "USD" },
  open_credit_lines:     { label: "Open Credit Lines" },
  times_90_days_late:    { label: "90+ Day Late Payments" },
  real_estate_loans:     { label: "Real Estate Loans" },
  times_60_89_days_late: { label: "60–89 Day Late Payments" },
  dependents:            { label: "Number of Dependents" },
};

// ── Styles ────────────────────────────────────────────────────────
const s = StyleSheet.create({
  page: { fontFamily: "Helvetica", fontSize: 9, color: "#111827", backgroundColor: "#ffffff", padding: 36 },

  // Header
  header:      { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20, paddingBottom: 12, borderBottom: "1.5pt solid #e5e7eb" },
  brand:       { fontSize: 16, fontFamily: "Helvetica-Bold", color: "#1e293b", letterSpacing: 0.5 },
  brandSub:    { fontSize: 7.5, color: "#6b7280", marginTop: 2 },
  headerRight: { alignItems: "flex-end" },
  reportTitle: { fontSize: 10, fontFamily: "Helvetica-Bold", color: "#374151", textTransform: "uppercase", letterSpacing: 0.8 },
  dateText:    { fontSize: 8, color: "#9ca3af", marginTop: 2 },

  // Score section
  scoreSection:  { flexDirection: "row", gap: 16, marginBottom: 20, alignItems: "flex-start" },
  scoreBox:      { alignItems: "center", justifyContent: "center", width: 90, height: 90, borderRadius: 8, borderWidth: 2 },
  scoreNum:      { fontSize: 36, fontFamily: "Helvetica-Bold" },
  scoreLabel:    { fontSize: 7, textTransform: "uppercase", letterSpacing: 1, marginTop: 2 },
  scoreDetails:  { flex: 1, gap: 8 },
  detailRow:     { flexDirection: "row", alignItems: "center", gap: 6 },
  detailLabel:   { fontSize: 8, color: "#6b7280", width: 110 },
  detailValue:   { fontSize: 9, fontFamily: "Helvetica-Bold" },
  badge:         { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, fontSize: 8, fontFamily: "Helvetica-Bold" },

  // Section headings
  sectionTitle:  { fontSize: 8, fontFamily: "Helvetica-Bold", textTransform: "uppercase", letterSpacing: 1, color: "#6b7280", marginBottom: 8, marginTop: 16 },
  divider:       { borderBottom: "0.5pt solid #e5e7eb", marginBottom: 8 },

  // SHAP table
  table:         { width: "100%" },
  tableHeader:   { flexDirection: "row", backgroundColor: "#f9fafb", paddingVertical: 5, paddingHorizontal: 8, borderRadius: 4 },
  tableRow:      { flexDirection: "row", paddingVertical: 5, paddingHorizontal: 8, borderBottom: "0.5pt solid #f3f4f6" },
  col1:          { flex: 3, fontSize: 8 },
  col2:          { flex: 2, fontSize: 8, textAlign: "right" },
  col3:          { flex: 1.5, fontSize: 8, textAlign: "right" },
  colHeader:     { fontSize: 7.5, fontFamily: "Helvetica-Bold", color: "#6b7280" },
  positiveShap:  { color: "#ef4444" },
  negativeShap:  { color: "#10b981" },

  // Inputs table
  inputRow:      { flexDirection: "row", paddingVertical: 4, paddingHorizontal: 8, borderBottom: "0.5pt solid #f3f4f6" },
  inputLabel:    { flex: 3, fontSize: 8, color: "#374151" },
  inputValue:    { flex: 2, fontSize: 8, textAlign: "right", color: "#111827", fontFamily: "Helvetica-Bold" },

  // Footer
  footer:        { position: "absolute", bottom: 24, left: 36, right: 36, flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 8, borderTop: "0.5pt solid #e5e7eb" },
  footerLeft:    { fontSize: 7, color: "#9ca3af" },
  footerRight:   { fontSize: 7, color: "#9ca3af" },
  disclaimer:    { fontSize: 7, color: "#d1d5db", marginTop: 4, textAlign: "center" },
});

// ── Helper ────────────────────────────────────────────────────────
function formatValue(key: keyof ApplicantInput, value: number): string {
  if (key === "monthly_income") return `$${value.toLocaleString()}`;
  if (key === "revolving_utilization" || key === "debt_ratio") return value.toFixed(2);
  return String(value);
}

// ── PDF Document ──────────────────────────────────────────────────
interface PredictionPdfProps {
  prediction: PredictionResponse;
  input: ApplicantInput;
  assessmentDate?: string;
}

export default function PredictionPdf({ prediction, input, assessmentDate }: PredictionPdfProps) {
  const color = CATEGORY_COLORS[prediction.risk_category];
  const recColor = RECOMMENDATION_COLORS[prediction.recommendation];
  const probability = `${(prediction.default_probability * 100).toFixed(1)}%`;
  const topShap = [...prediction.shap_values].sort(
    (a, b) => Math.abs(b.shap_contribution) - Math.abs(a.shap_contribution)
  ).slice(0, 5);

  const date = assessmentDate ?? new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  return (
    <Document title="CreditLens Risk Report" author="CreditLens">
      <Page size="A4" style={s.page}>

        {/* ── Header ── */}
        <View style={s.header}>
          <View>
            <Text style={s.brand}>CreditLens</Text>
            <Text style={s.brandSub}>ML-powered credit risk assessment</Text>
          </View>
          <View style={s.headerRight}>
            <Text style={s.reportTitle}>Risk Assessment Report</Text>
            <Text style={s.dateText}>Assessment Date: {date}</Text>
          </View>
        </View>

        {/* ── Risk score ── */}
        <View style={s.scoreSection}>
          <View style={[s.scoreBox, { borderColor: color, backgroundColor: `${color}15` }]}>
            <Text style={[s.scoreNum, { color }]}>{prediction.risk_score}</Text>
            <Text style={[s.scoreLabel, { color }]}>Risk Score</Text>
          </View>

          <View style={s.scoreDetails}>
            <View style={s.detailRow}>
              <Text style={s.detailLabel}>Risk Category</Text>
              <Text style={[s.badge, { backgroundColor: `${color}20`, color }]}>
                {prediction.risk_category.toUpperCase()}
              </Text>
            </View>
            <View style={s.detailRow}>
              <Text style={s.detailLabel}>Default Probability</Text>
              <Text style={[s.detailValue, { color }]}>{probability}</Text>
            </View>
            <View style={s.detailRow}>
              <Text style={s.detailLabel}>Recommendation</Text>
              <Text style={[s.badge, { backgroundColor: `${recColor}20`, color: recColor }]}>
                {prediction.recommendation.toUpperCase()}
              </Text>
            </View>
            <View style={s.detailRow}>
              <Text style={s.detailLabel}>Confidence</Text>
              <Text style={s.detailValue}>{prediction.confidence}</Text>
            </View>
            <View style={s.detailRow}>
              <Text style={s.detailLabel}>Model Version</Text>
              <Text style={[s.detailValue, { color: "#9ca3af" }]}>{prediction.model_version}</Text>
            </View>
          </View>
        </View>

        {/* ── SHAP factors ── */}
        <Text style={s.sectionTitle}>Key Risk Drivers (SHAP Analysis)</Text>
        <View style={s.divider} />
        <View style={s.table}>
          <View style={s.tableHeader}>
            <Text style={[s.col1, s.colHeader]}>Feature</Text>
            <Text style={[s.col2, s.colHeader]}>Applicant Value</Text>
            <Text style={[s.col3, s.colHeader]}>SHAP Contribution</Text>
          </View>
          {topShap.map((sv) => (
            <View key={sv.feature} style={s.tableRow}>
              <Text style={s.col1}>{sv.display_name}</Text>
              <Text style={s.col2}>{String(sv.applicant_value)}</Text>
              <Text style={[s.col3, sv.shap_contribution > 0 ? s.positiveShap : s.negativeShap]}>
                {sv.shap_contribution > 0 ? "+" : ""}{sv.shap_contribution.toFixed(4)}
              </Text>
            </View>
          ))}
        </View>

        {/* ── Reasoning ── */}
        <Text style={[s.sectionTitle, { marginTop: 16 }]}>Model Reasoning</Text>
        <View style={s.divider} />
        <Text style={{ fontSize: 8.5, color: "#374151", lineHeight: 1.5 }}>{prediction.reasoning}</Text>

        {/* ── Applicant profile ── */}
        <Text style={[s.sectionTitle, { marginTop: 16 }]}>Applicant Profile</Text>
        <View style={s.divider} />
        <View style={s.table}>
          {(Object.keys(input) as (keyof ApplicantInput)[]).map((key) => (
            <View key={key} style={s.inputRow}>
              <Text style={s.inputLabel}>{DISPLAY[key].label}</Text>
              <Text style={s.inputValue}>
                {formatValue(key, input[key])}
                {DISPLAY[key].unit ? ` ${DISPLAY[key].unit}` : ""}
              </Text>
            </View>
          ))}
        </View>

        {/* ── Footer ── */}
        <View style={s.footer} fixed>
          <Text style={s.footerLeft}>CreditLens · creditlens.vercel.app</Text>
          <Text style={s.footerRight}>XGBoost · SHAP · ROC-AUC 0.8686</Text>
        </View>
        <Text style={[s.disclaimer, { position: "absolute", bottom: 10, left: 36, right: 36 }]}>
          For portfolio demonstration only. Not intended for real lending decisions.
        </Text>
      </Page>
    </Document>
  );
}
