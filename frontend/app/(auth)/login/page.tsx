"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

// Client-side rate-limit: max 5 attempts per 15-minute window (UX guard, not a security boundary)
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

function getAttemptState(): { count: number; windowStart: number } {
  try {
    const raw = sessionStorage.getItem("_login_attempts");
    return raw ? JSON.parse(raw) : { count: 0, windowStart: Date.now() };
  } catch {
    return { count: 0, windowStart: Date.now() };
  }
}

function recordAttempt(): { blocked: boolean; remaining: number; retryAfterMs: number } {
  const now = Date.now();
  let state = getAttemptState();
  if (now - state.windowStart > WINDOW_MS) {
    state = { count: 0, windowStart: now };
  }
  state.count += 1;
  try {
    sessionStorage.setItem("_login_attempts", JSON.stringify(state));
  } catch {
    // storage unavailable — fail open (Supabase enforces server-side limits)
  }
  const blocked = state.count > MAX_ATTEMPTS;
  return {
    blocked,
    remaining: Math.max(0, MAX_ATTEMPTS - state.count),
    retryAfterMs: blocked ? WINDOW_MS - (now - state.windowStart) : 0,
  };
}

function normalizeAuthError(message: string): string {
  // Avoid leaking account-existence info or implementation details
  const lower = message.toLowerCase();
  if (lower.includes("invalid") || lower.includes("credentials") || lower.includes("not found")) {
    return "Incorrect email or password.";
  }
  if (lower.includes("email") && lower.includes("confirm")) {
    return "Please confirm your email address before signing in.";
  }
  if (lower.includes("rate") || lower.includes("too many")) {
    return "Too many attempts. Please wait before trying again.";
  }
  return "Sign-in failed. Please try again.";
}

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const { blocked, retryAfterMs } = recordAttempt();
    if (blocked) {
      const minutes = Math.ceil(retryAfterMs / 60_000);
      setError(`Too many sign-in attempts. Please wait ${minutes} minute${minutes !== 1 ? "s" : ""} and try again.`);
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(normalizeAuthError(error.message));
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <Card className="w-full max-w-sm backdrop-blur-xl dark:bg-white/5 dark:ring-white/10 dark:shadow-2xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl">Sign in</CardTitle>
        <CardDescription>Enter your email and password to continue</CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-medium text-foreground underline-offset-4 hover:underline">
              Sign up
            </Link>
          </p>
          <Link
            href="/dashboard?demo=true"
            className="text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Try demo instead →
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}
