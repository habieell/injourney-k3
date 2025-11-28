// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/types/db";

const LOGIN_PATH = "/sign-in";

export async function middleware(req: NextRequest) {
    const res = NextResponse.next();

    // pakai helper resmi Supabase
    const supabase = createMiddlewareClient<Database>({ req, res });

    const {
        data: { session },
    } = await supabase.auth.getSession();

    const url = req.nextUrl;
    const { pathname, searchParams } = url;

    const isProtected =
        pathname.startsWith("/admin") ||
        pathname.startsWith("/findings") ||
        pathname.startsWith("/report") ||
        pathname.startsWith("/tasks");

    const isAuthPage = pathname === LOGIN_PATH;
    const isLoggedIn = !!session;

    // sudah login tapi buka /sign-in → redirect ke redirect param / /findings
    if (isAuthPage && isLoggedIn) {
        const redirectParam = searchParams.get("redirect");
        const target =
            redirectParam && redirectParam.startsWith("/")
                ? redirectParam
                : "/findings";

        return NextResponse.redirect(new URL(target, req.url));
    }

    // belum login & akses protected → paksa ke sign-in
    if (isProtected && !isLoggedIn) {
        const loginUrl = new URL(LOGIN_PATH, req.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // penting: selalu return res yang sudah di-*wrap* Supabase
    return res;
}

export const config = {
    matcher: [
        "/admin/:path*",
        "/findings/:path*",
        "/report/:path*",
        "/tasks/:path*",
        "/sign-in",
    ],
};