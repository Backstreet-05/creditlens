import Link from "next/link";
import { Lightbulb } from "lucide-react";
import AuthGradient from "@/components/landing/AuthGradient";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4">
      {/* Animated sphere gradient */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <AuthGradient />
      </div>

      <Link href="/" className="mb-8 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30">
          <Lightbulb className="h-4.5 w-4.5 text-white" />
        </div>
        <span className="text-lg font-semibold tracking-tight">CreditLens</span>
      </Link>
      {children}
    </div>
  );
}
