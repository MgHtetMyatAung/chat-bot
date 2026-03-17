import { betterFetch } from "@better-fetch/fetch";
import { NextResponse, type NextRequest } from "next/server";
import type { auth } from "@/lib/auth";

type Session = typeof auth.$Infer.Session;

export default async function authMiddleware(request: NextRequest) {
    const { data: session } = await betterFetch<Session>(
        "/api/auth/get-session",
        {
            baseURL: request.nextUrl.origin,
            headers: {
                // Get the correct headers for better fetch
                cookie: request.headers.get("cookie") || "",
            },
        },
    );

    const isAuthPage = request.nextUrl.pathname === "/login";
    const isDashboardPage = request.nextUrl.pathname.startsWith("/dashboard");
    const isVerificationPage = request.nextUrl.pathname === "/verify-email";

    if (isAuthPage) {
        if (session) {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }
        return NextResponse.next();
    }

    if (isDashboardPage) {
        if (!session) {
            return NextResponse.redirect(new URL("/login", request.url));
        }
        
        // Block unverified users from dashboard
        if (!session.user.emailVerified) {
            return NextResponse.redirect(new URL("/verify-email", request.url));
        }
    }

    if (isVerificationPage) {
        if (!session) {
            return NextResponse.redirect(new URL("/login", request.url));
        }
        if (session.user.emailVerified) {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard", "/dashboard/:path*", "/login", "/verify-email"],
};
