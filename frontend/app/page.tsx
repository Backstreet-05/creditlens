"use client";

import Link from "next/link";
import { ArrowRight, BarChart3, CheckCircle, Cpu, Lightbulb, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ThemeToggle from "@/components/layout/ThemeToggle";
import HeroGradient from "@/components/landing/HeroGradient";
import dynamic from "next/dynamic";

const LiquidLogo = dynamic(() => import("@/components/landing/LiquidLogo"), { ssr: false });

const STATS = [
  { value: "0.87", label: "ROC-AUC" },
  { value: "150k", label: "Training rows" },
  { value: "10", label: "Features" },
  { value: "SHAP", label: "Explainability" },
];

const FEATURES = [
  {
    icon: Lightbulb,
    title: "Instant risk scoring",
    description:
      "Submit an applicant's financial profile and receive a 0–100 risk score, default probability, and category classification in under 500ms.",
    bullets: ["Low / Medium / High / Critical tiers", "Approve · Review · Reject recommendation", "Confidence band per prediction"],
  },
  {
    icon: Shield,
    title: "SHAP explainability",
    description:
      "Every prediction comes with a local SHAP waterfall chart and plain-English reasoning — so you know exactly why a score was assigned.",
    bullets: ["Top 5 feature contributions", "Direction: increases or decreases risk", "Grounded in model output, not heuristics"],
  },
  {
    icon: BarChart3,
    title: "Portfolio analytics",
    description:
      "Track approval rates, risk distribution, and score trends across all predictions. Global SHAP shows which features matter most at scale.",
    bullets: ["KPI dashboard with live counts", "Risk distribution chart", "Global feature importance (mean |SHAP|)"],
  },
];

const CARD_VARIANTS = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: 0.1 + i * 0.12, ease: "easeOut" as const },
  }),
};

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Navbar */}
      <motion.nav
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-border/60 bg-background/70 px-6 backdrop-blur-md"
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-violet-600 shadow-sm shadow-indigo-500/30">
            <Lightbulb className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold tracking-tight">CreditLens</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/login">
            <Button variant="ghost" size="sm">Sign in</Button>
          </Link>
          <Link href="/signup">
            <Button size="sm">Get started</Button>
          </Link>
        </div>
      </motion.nav>

      {/* Hero */}
      <section className="relative flex flex-col items-center overflow-hidden px-6 pt-24 pb-20 text-center">
        {/* Shader gradient background — dark fintech atmosphere */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <HeroGradient />
          {/* Fade out at bottom so it blends into the page */}
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-background" />
        </div>

        {/* Liquid chrome logo mark */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.05, ease: "easeOut" }}
          className="mb-4"
        >
          <LiquidLogo text="CL" size={140} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.18 }}
        >
          <Badge variant="secondary" className="mb-5 gap-1.5 text-xs font-medium">
            <Cpu className="h-3 w-3" />
            XGBoost · SHAP · FastAPI · Next.js
          </Badge>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.28 }}
          className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
        >
          ML-powered{" "}
          <span className="animate-shimmer-text bg-gradient-to-r from-indigo-300 via-violet-300 to-indigo-400 bg-clip-text text-transparent">
            credit risk
          </span>{" "}
          assessment
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.40 }}
          className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg"
        >
          Predict default probability, understand why with SHAP explainability,
          and explore portfolio analytics — all in one platform.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.52 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <Link href="/dashboard?demo=true">
            <Button size="lg" className="gap-2 animate-glow-pulse">
              Try the demo
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="lg" variant="outline">
              Create free account
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Stats strip */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.62 }}
        className="border-y border-border/50 bg-card/60 backdrop-blur-md dark:bg-white/3"
      >
        <div className="mx-auto grid max-w-3xl grid-cols-2 gap-px sm:grid-cols-4">
          {STATS.map(({ value, label }) => (
            <div key={label} className="flex flex-col items-center py-7 transition-colors hover:bg-primary/5">
              <span className="font-mono text-2xl font-bold text-primary">{value}</span>
              <span className="mt-1 text-xs text-muted-foreground tracking-wide uppercase">{label}</span>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Features */}
      <section className="mx-auto w-full max-w-5xl px-6 py-20">
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.6 }}
          className="mb-12 text-center text-2xl font-semibold tracking-tight"
        >
          Built for analysts and engineers
        </motion.h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description, bullets }, i) => (
            <motion.div
              key={title}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={CARD_VARIANTS}
              className="rounded-xl border border-border bg-card p-6 space-y-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/8 hover:border-primary/30"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/20">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{description}</p>
              </div>
              <ul className="space-y-1.5">
                {bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                    {b}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA strip */}
      <section className="border-t border-border bg-card">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-6 py-16 text-center">
          <h2 className="text-2xl font-semibold tracking-tight">
            No login required to explore
          </h2>
          <p className="text-sm text-muted-foreground max-w-sm">
            Demo mode gives you full access to predictions and analytics using pre-seeded sample applicants.
          </p>
          <Link href="/dashboard?demo=true">
            <Button size="lg" className="gap-2 mt-2">
              Open demo dashboard
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-6 text-center text-xs text-muted-foreground">
        CreditLens · XGBoost trained on Give Me Some Credit (Kaggle) · Built with Next.js + FastAPI
      </footer>
    </div>
  );
}
