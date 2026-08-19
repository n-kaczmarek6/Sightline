import { NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { createServerClient } from "@supabase/ssr";
import { routing } from "./i18n/routing";

const handleI18nRouting = createMiddleware(routing);
const AUTH_PATHS = ["/login", "/register"];

export async function middleware(request) {
  // 1. Sprach-Routing zuerst (entscheidet z.B. redirect "/" -> "/de").
  const response = handleI18nRouting(request);

  // 2. Supabase-Session auf der daraus entstandenen Response erneuern,
  //    damit abgelaufene Login-Cookies bei jedem Request aufgefrischt werden.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
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

  // 3. Zugriff auf /app nur mit gültiger Session; eingeloggte Nutzer:innen
  //    landen nicht mehr auf den Login-/Register-Seiten.
  const { pathname } = request.nextUrl;
  const locale = routing.locales.find(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`)
  ) ?? routing.defaultLocale;
  const path = pathname.slice(`/${locale}`.length) || "/";

  if (path.startsWith("/app") && !user) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/login`;
    return NextResponse.redirect(url);
  }

  if (AUTH_PATHS.includes(path) && user) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/app`;
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
