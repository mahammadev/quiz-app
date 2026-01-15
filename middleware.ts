import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isPublicRoute = createRouteMatcher([
    "/",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/api/webhooks(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
    if (!isPublicRoute(req)) {
        const session = await auth();
        if (!session.userId) {
            const signInUrl = new URL("/sign-in", req.url);
            signInUrl.searchParams.set("redirect_url", req.nextUrl.href);
            return NextResponse.redirect(signInUrl);
        }
    }

    if (isAdminRoute(req)) {
        const session = await auth();
        if (!session.userId) {
            const signInUrl = new URL("/sign-in", req.url);
            signInUrl.searchParams.set("redirect_url", req.nextUrl.href);
            return NextResponse.redirect(signInUrl);
        }

        const claims = session.sessionClaims as {
            publicMetadata?: { role?: string };
            unsafeMetadata?: { role?: string };
            metadata?: { role?: string };
            role?: string;
        } | null;
        const role =
            claims?.publicMetadata?.role ||
            claims?.unsafeMetadata?.role ||
            claims?.metadata?.role ||
            claims?.role;
        if (role && role !== "admin") {
            const url = req.nextUrl.clone();
            url.pathname = "/";
            return NextResponse.redirect(url);
        }
    }
});

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
