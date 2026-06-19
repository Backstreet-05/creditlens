import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://creditlens.vercel.app";

export const metadata: Metadata = {
  title: {
    template: "%s | CreditLens",
    default: "CreditLens — ML Credit Risk Assessment",
  },
  description:
    "ML-powered credit risk assessment. Predict default probability, understand key risk drivers with SHAP explainability, and explore portfolio analytics. Built with XGBoost + FastAPI + Next.js.",
  keywords: ["credit risk", "machine learning", "fintech", "analytics", "XGBoost", "SHAP", "default prediction"],
  metadataBase: new URL(BASE_URL),
  openGraph: {
    type: "website",
    url: BASE_URL,
    siteName: "CreditLens",
    title: "CreditLens — ML Credit Risk Assessment",
    description:
      "Predict default probability and understand risk drivers with SHAP explainability. XGBoost model trained on 150k credit records. ROC-AUC 0.87.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "CreditLens dashboard preview" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "CreditLens — ML Credit Risk Assessment",
    description: "Predict default probability with XGBoost + SHAP explainability. Live demo — no login required.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="min-h-full antialiased bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
