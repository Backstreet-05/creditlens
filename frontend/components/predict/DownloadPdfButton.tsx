"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import { FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import PredictionPdf from "@/components/predict/PredictionPdf";
import type { ApplicantInput } from "@/types/applicant";
import type { PredictionResponse } from "@/types/prediction";

interface DownloadPdfButtonProps {
  prediction: PredictionResponse;
  input: ApplicantInput;
}

export default function DownloadPdfButton({ prediction, input }: DownloadPdfButtonProps) {
  const filename = `creditlens-risk-report-${new Date().toISOString().split("T")[0]}.pdf`;
  const date = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  return (
    <PDFDownloadLink
      document={<PredictionPdf prediction={prediction} input={input} assessmentDate={date} />}
      fileName={filename}
    >
      {({ loading }) => (
        <Button variant="outline" size="sm" disabled={loading} className="gap-1.5">
          <FileDown className="h-3.5 w-3.5" />
          {loading ? "Generating…" : "Download PDF"}
        </Button>
      )}
    </PDFDownloadLink>
  );
}
