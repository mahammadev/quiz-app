import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
    if (isAdminRoute(req)) {
        const { sessionClaims } = await auth();
        const role = (sessionClaims?.metadata as { role?: string })?.role;

        if (role !== "admin") {
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
