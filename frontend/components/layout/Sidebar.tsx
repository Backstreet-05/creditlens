"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, Cpu, Home, Lightbulb, LogOut, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/predict", label: "New Prediction", icon: Plus },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/model", label: "Model", icon: Cpu },
];

interface SidebarProps {
  isDemo: boolean;
}

export default function Sidebar({ isDemo }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <aside className="flex h-screen w-56 shrink-0 flex-col border-r border-border bg-card">
      {/* Brand */}
      <div className="flex h-14 items-center gap-2.5 border-b border-border px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md shadow-indigo-500/20">
          <Lightbulb className="h-4 w-4 text-white" />
        </div>
        <span className="font-semibold tracking-tight">CreditLens</span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-1 p-2 pt-3">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/15 text-primary font-semibold ring-1 ring-primary/20"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-2">
        {isDemo ? (
          <Link
            href="/signup"
            className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-amber-400 hover:bg-accent transition-colors"
          >
            Sign up to save work
          </Link>
        ) : (
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sign out
          </button>
        )}
      </div>
    </aside>
  );
}
