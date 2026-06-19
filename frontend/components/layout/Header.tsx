"use client";

import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/layout/ThemeToggle";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/predict": "New Prediction",
  "/analytics": "Analytics",
  "/model": "Model",
};

export default function Header() {
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] ?? "CreditLens";

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-6">
      <h1 className="text-sm font-semibold">{title}</h1>
      <ThemeToggle />
    </header>
  );
}
