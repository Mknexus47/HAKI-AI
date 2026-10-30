import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { safeNextPath } from "./lib/auth-redirect";

const PUBLIC_PATHS = ["/login", "/signup", "/offline"];
const PUBLIC_PREFIXES = ["/auth", "/api"];

// Search-engine crawlers are let through so the site can be indexed.
// Verified crawlers reverse-DNS their IPs; this UA check is a best-effort
// filter (spoofable) — data access is still protected by Supabase RLS.
const CRAWLER_UA_TOKENS = [
  "googlebot",
  "bingbot",
  "slurp",
  "duckduckbot",
  "baiduspider",
  "yandexbot",
  "applebot",
  "facebookexternalhit",
  "twitterbot",
  "linkedinbot",
  "whatsapp",
];

function isSearchEngineCrawler(userAgent: string | null): boolean {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return CRAWLER_UA_TOKENS.some((token) => ua.includes(token));
}

// Search-engine and social-preview crawlers. Humans always hit the sign-in
// gate; crawlers get the page so the site can appear in search results.
const CRAWLER_PATTERN =
  /googlebot|google-inspectiontool|apis-google|mediapartners-google|storebot-google|bingbot|bingpreview|duckduckbot|yandex|baiduspider|applebot|slurp|twitterbot|facebookexternalhit|whatsapp|slackbot|discordbot|linkedinbot|embedly|pinterest|gptbot|oai-searchbot|perplexitybot|claudebot/i;

function isPublicPath(pathname: string): boolean {
  return (
    PUBLIC_PATHS.includes(pathname) ||
    PUBLIC_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    )
  );
}

// The gate's outcome varies by cookie and user-agent, but the page cache is
// keyed by path only. A cached 307 would keep crawlers out forever; a cached
// 200 would hand anonymous visitors the signed-in page. Never cache it.
function noStore(response: NextResponse): NextResponse {
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Crawlers see the site without signing in (same content users get).
  if (CRAWLER_PATTERN.test(request.headers.get("user-agent") ?? "")) {
    return noStore(NextResponse.next({ request }));
  }

  // The admin panel now lives inside the dashboard (Admin tab).
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "?tab=admin";
    return noStore(NextResponse.redirect(url));
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseConfigured =
    !!supabaseUrl &&
    !!supabaseAnonKey &&
    !supabaseUrl.includes("placeholder") &&
    supabaseAnonKey !== "placeholder-anon-key";

  // Auth unavailable — never lock every visitor out.
  if (!supabaseConfigured) {
    return noStore(NextResponse.next({ request }));
  }

  // Let search-engine crawlers index the site without a session.
  if (isSearchEngineCrawler(request.headers.get("user-agent"))) {
    return noStore(NextResponse.next({ request }));
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // Refreshes the session cookie when expired; returns the signed-in user.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const onAuthPage = pathname === "/login" || pathname === "/signup";

  // Signed-in users don't need the auth screens.
  if (user && onAuthPage) {
    const target = safeNextPath(request.nextUrl.searchParams.get("next"));
    const targetPath = new URL(target, request.url).pathname;
    if (targetPath !== "/login" && targetPath !== "/signup") {
      return noStore(NextResponse.redirect(new URL(target, request.url)));
    }
    return noStore(NextResponse.redirect(new URL("/", request.url)));
  }

  // Every other page requires an email sign-in.
  if (!user && !isPublicPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("next", pathname + search);
    return noStore(NextResponse.redirect(url));
  }

  return noStore(response);
}

export const config = {
  matcher: [
    "/((?!api|_next|favicon.ico|robots.txt|sitemap.xml|manifest.webmanifest|sw.js|.*\\.(?:png|jpe?g|gif|webp|svg|ico|css|js|map|woff2?)$).*)",
  ],
};
