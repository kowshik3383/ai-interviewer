// proxy.ts — route protection (Next.js Proxy, replaces middleware).
import { auth } from "./auth";

const PUBLIC_ROUTES = ["/login"];

export default auth((req: any) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isPublic = PUBLIC_ROUTES.some((r) => nextUrl.pathname.startsWith(r));

  // Protected areas: dashboard + interview workspace/report.
  const isProtected =
    nextUrl.pathname.startsWith("/dashboard") ||
    nextUrl.pathname.startsWith("/interview/");

  if (!isLoggedIn && isProtected) {
    const loginUrl = new URL("/login", nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname + nextUrl.search);
    return Response.redirect(loginUrl);
  }

  // Logged-in users hitting /login go straight to the dashboard.
  if (isLoggedIn && isPublic && nextUrl.pathname === "/login") {
    return Response.redirect(new URL("/dashboard", nextUrl.origin));
  }
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/interview/:path*",
    "/login",
  ],
};