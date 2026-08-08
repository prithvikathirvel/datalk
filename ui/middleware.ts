import { type NextRequest, NextResponse } from "next/server";

const authCookieName = "rag_saas_token";
const authRoutes = ["/login", "/signup"];
// `/admin/*` is intentionally listed as public here: the admin panel has its
// own session (datalk_admin_session) and its own login page at /admin/login,
// so the customer middleware must not redirect /admin visitors to /login.
const publicRoutes = [
  "/",
  "/login",
  "/signup",
  "/widget",
  "/privacy",
  "/terms",
  "/admin",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
  const isAuthRoute = authRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
  const hasSession = Boolean(request.cookies.get(authCookieName)?.value);

  if (!hasSession && !isPublicRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (hasSession && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
};
