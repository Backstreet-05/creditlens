import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const DEMO_COOKIE = "cri_demo_mode";
const DEMO_COOKIE_MAX_AGE = 60 * 60 * 24; // 24 hours

const PROTECTED_ROUTES = ["/dashboard", "/predict", "/analytics", "/model"];
const AUTH_ROUTES = ["/login", "/signup"];

export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Activate demo mode: set a secure cookie and redirect to /dashboard (clean URL)
  if (searchParams.get("demo") === "true") {
    const dest = new URL("/dashboard", request.url);
    const response = NextResponse.redirect(dest);
    response.cookies.set(DEMO_COOKIE, "true", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: DEMO_COOKIE_MAX_AGE,
      path: "/",
    });
    return response;
  }

  const isDemo = request.cookies.get(DEMO_COOKIE)?.value === "true";
  const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));

  // Demo users bypass auth on protected routes
  if (isDemo && isProtected) {
    return NextResponse.next({ request });
  }

  // All other protected or auth routes: validate Supabase session
  if (isProtected || isAuthRoute) {
    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            supabaseResponse = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user && isProtected) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (user && isAuthRoute) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return supabaseResponse;
  }

  return NextResponse.next({ request });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
