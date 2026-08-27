import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession } from "@/lib/session";

const COOKIE_NAME = process.env.JWT_COOKIE_NAME ?? "access_token";

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/activate",
  "/forgot-password",
  "/reset-password",
];

// Extensions de fichiers statiques servies depuis public/ (jamais protégées)
const STATIC_FILE_REGEX =
  /\.(?:png|jpe?g|svg|webp|gif|ico|avif|css|js|mjs|map|txt|pdf|woff2?|ttf|eot|webmanifest|xml)$/i;

function isPublicPath(pathname: string): boolean {
  return (
    PUBLIC_PATHS.includes(pathname) ||
    PUBLIC_PATHS.some((p) => p !== "/" && pathname.startsWith(p))
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Les fichiers statiques (public/...) sont accessibles sans authentification
  if (STATIC_FILE_REGEX.test(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;
  const session = await verifySession(token);

  // Non authentifié : accès limité aux pages publiques
  if (!session) {
    if (isPublicPath(pathname)) {
      return NextResponse.next();
    }

    const url = new URL("/login", request.url);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  // AUTH-04 : mot de passe temporaire => changement obligatoire
  if (
    session.tempPassword &&
    pathname !== "/change-password" &&
    pathname !== "/activate"
  ) {
    return NextResponse.redirect(new URL("/change-password", request.url));
  }

  // AUTH-05 : seuls les administrateurs accèdent aux routes d'administration
  const ADMIN_ONLY_PREFIXES = ["/invite", "/settings", "/users"];
  const isAdminRoute = ADMIN_ONLY_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  if (isAdminRoute && session.role !== "Administrateur") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Utilisateur connecté : sortir des pages publiques d'authentification
  if (isPublicPath(pathname) && pathname !== "/activate") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpe?g|svg|webp|gif|ico|avif|css|js|mjs|map|txt|pdf|woff2?|ttf|eot|webmanifest|xml)$).*)",
  ],
};