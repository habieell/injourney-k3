// middleware.ts
import { NextRequest, NextResponse } from "next/server";

const LOGIN_PATH = "/sign-in";

// Deteksi cookie session Supabase (sb-xxx-auth-token)
function hasSupabaseSession(req: NextRequest) {
    const allCookies = req.cookies.getAll();
    return allCookies.some((cookie) =>
        /^sb-.*-auth-token$/.test(cookie.name)
    );
}

export function middleware(req: NextRequest) {
    const url = req.nextUrl;
    const { pathname, searchParams } = url;

    const isProtected =
        pathname.startsWith("/admin") ||
        pathname.startsWith("/findings") ||
        pathname.startsWith("/report");

    const isAuthPage = pathname === LOGIN_PATH;
    const isLoggedIn = hasSupabaseSession(req);

    // sudah login tapi buka /sign-in → lempar ke redirect (kalau ada) atau /findings
    if (isAuthPage && isLoggedIn) {
        const redirectParam = searchParams.get("redirect");
        const target =
            redirectParam && redirectParam.startsWith("/")
                ? redirectParam
                : "/findings";

        return NextResponse.redirect(new URL(target, req.url));
    }

    // belum login, akses protected → lempar ke /sign-in?redirect=<path>
    if (isProtected && !isLoggedIn) {
        const loginUrl = new URL(LOGIN_PATH, req.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*", "/findings/:path*", "/report/:path*", "/sign-in"],
};