import { NextResponse, type NextRequest } from "next/server";
import { createMiddlewareClient } from "@/lib/supabase/middleware";

const PUBLIC_PATHS = ["/login", "/register", "/reset-password"];
const ADMIN_ONLY_PATHS = ["/agentes"];

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });
  const supabase = createMiddlewareClient(request, response);

  const { pathname } = request.nextUrl;

  const isPublicPath = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  // Refresh session (handles token rotation)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // No session → redirect to login (except public paths)
  if (!user && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Has session on login/register page → redirect to dashboard
  if (user && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Admin-only paths
  if (user && ADMIN_ONLY_PATHS.some((p) => pathname.startsWith(p))) {
    const role = user.app_metadata?.role as string | undefined;
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|api/|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp)$).*)",
  ],
};
