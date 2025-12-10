import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import isTokenExpired from "@/services/isTokenExpired";

export function middleware(request: NextRequest) {
    const token = request.cookies.get("token")?.value;
    const isAuthPage = request.nextUrl.pathname === "/login";
    const redirected = request.cookies.get("redirected")?.value;

    if (token && isTokenExpired(token)) {
        const response = NextResponse.redirect(new URL("/login", request.url));
        response.cookies.delete("token");
        response.cookies.delete("redirected");
        return response;
    }

    if (token && isAuthPage) {
        const returnUrl = request.nextUrl.searchParams.get("returnUrl");

        const response = NextResponse.redirect(
            new URL(returnUrl || "/", request.url)
        );
        response.cookies.delete("redirected");
        return response;
    }

    if (!token && !isAuthPage) {
        const returnUrl = request.nextUrl.pathname + request.nextUrl.search;
        return NextResponse.redirect(
            new URL(
                `/login?returnUrl=${encodeURIComponent(returnUrl)}`,
                request.url
            )
        );
    }

    if (redirected) {
        const response = NextResponse.next();
        response.cookies.delete("redirected");
        return response;
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        // only apply middleware for specific routes
        "/my-claim/:path*",
        "/claim/:path*",
        "/create/:path*",
        "/(user)/:path*",
        "/(admin)/:path*",
        "/login",
    ],
};
