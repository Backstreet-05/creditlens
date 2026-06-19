import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function DemoModeBanner() {
  return (
    <div className="flex items-center justify-center gap-2 bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-sm text-amber-400">
      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
      <span>
        Demo mode — predictions are not saved.{" "}
        <Link href="/signup" className="underline underline-offset-2 font-medium hover:text-amber-300 transition-colors">
          Sign up
        </Link>{" "}
        to save your history.
      </span>
    </div>
  );
}
