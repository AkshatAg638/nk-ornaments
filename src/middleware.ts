/**
 * Next.js Middleware with Admin Route Protection & Session Refresh
 *
 * In Mock Mode (DATA_MODE=mock):
 * - Allows full navigation through all pages and admin screens for UI review.
 *
 * In Supabase Mode (DATA_MODE=supabase):
 * - Refreshes the Supabase Auth session on every request for SSR.
 * - Protects all `/admin/*` paths: unauthenticated visitors are redirected to `/admin/login`.
 */

import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const pathname = request.nextUrl.pathname;

  // Add noindex to admin routes
  if (pathname.startsWith("/admin")) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  // Check if mock mode is active
  const isMock =
    process.env.DATA_MODE === "mock" ||
    process.env.NEXT_PUBLIC_DATA_MODE === "mock" ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project-ref");

  if (isMock) {
    // In mock mode, allow direct access to all pages for instant review
    return response;
  }

  // Supabase live mode handling
  const { createServerClient } = await import("@supabase/ssr");
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
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (pathname.startsWith("/admin")) {
    const isLoginPath = pathname === "/admin/login";
    const isSetupPath = pathname === "/admin/setup";

    if (isLoginPath || isSetupPath) {
      return response;
    }

    if (!user) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
