import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "va_session";

const PUBLIC_PATHS = ["/auth/login", "/auth/register"];
const PUBLIC_API_PREFIXES = ["/api/auth", "/api/leads", "/api/webhooks"];

async function hasValidSession(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return false;
  const secret = process.env.AUTH_SECRET || "dev-secret-change-me";
  try {
    await jwtVerify(token, new TextEncoder().encode(secret));
    return true;
  } catch {
    return false;
  }
}

function redirectToLogin(pathname: string, req: NextRequest): NextResponse {
  const loginUrl = new URL("/auth/login", req.url);
  loginUrl.searchParams.set("next", pathname);
  const res = NextResponse.redirect(loginUrl);
  res.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon") || pathname.startsWith("/assets")) {
    return NextResponse.next();
  }

  const validSession = await hasValidSession(req);

  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    if (validSession) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/api")) {
    const isPublicApi = PUBLIC_API_PREFIXES.some((p) => pathname.startsWith(p));
    if (isPublicApi) return NextResponse.next();
    if (!validSession) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.next();
  }

  if (!validSession) {
    return redirectToLogin(pathname, req);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/calls",
    "/calls/:path*",
    "/leads",
    "/settings",
    "/admin",
    "/transcripts",
    "/auth/login",
    "/auth/register",
    "/api/:path*",
  ],
};
