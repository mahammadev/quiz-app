import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Define protected routes
const isAdminRoute = createRouteMatcher(['/admin(.*)'])
const isTeacherRoute = createRouteMatcher(['/teacher(.*)'])
const isExamRoute = createRouteMatcher(['/exam(.*)'])

export default clerkMiddleware(async (auth, req) => {
    const { userId } = await auth()

    // Admin routes - ADMIN only
    if (isAdminRoute(req)) {
        if (!userId) {
            return NextResponse.redirect(new URL('/sign-in', req.url))
        }
        // TODO: Add role check when we have user role in session
        // For now, any authenticated user can access admin
    }

    // Teacher routes - TEACHER only
    if (isTeacherRoute(req)) {
        if (!userId) {
            return NextResponse.redirect(new URL('/sign-in', req.url))
        }
        // TODO: Add role check when we have user role in session
    }

    // Exam routes - STUDENT only (authenticated)
    if (isExamRoute(req)) {
        if (!userId) {
            return NextResponse.redirect(new URL('/sign-in', req.url))
        }
    }

    return NextResponse.next()
})

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
}
