import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Get session from cookies
    const sessionCookie = request.cookies.get("better-auth.session_token")

    // Public routes that don't require authentication
    const publicRoutes = ["/", "/login"]
    const isPublicRoute = publicRoutes.includes(pathname)

    // If no session and trying to access protected route, redirect to login
    if (!sessionCookie && !isPublicRoute) {
        console.log(`[Middleware] No session, redirecting ${pathname} to /login`)
        const loginUrl = new URL("/login", request.url)
        return NextResponse.redirect(loginUrl)
    }

    // If has session, fetch user role
    if (sessionCookie) {
        try {
            // Use better-auth's built-in session endpoint
            const sessionResponse = await fetch(new URL("/api/auth/get-session", request.url), {
                headers: {
                    Cookie: `better-auth.session_token=${sessionCookie.value}`,
                },
            })

            if (sessionResponse.ok) {
                const sessionData = await sessionResponse.json()
                const userRole = sessionData?.user?.role

                console.log(`[Middleware] User role: ${userRole}, Path: ${pathname}`)

                // If on login page or home page with active session, redirect based on role
                if (pathname === "/login" || pathname === "/") {
                    if (userRole === "ADMIN") {
                        console.log(`[Middleware] Redirecting ADMIN to /admin/dashboard`)
                        return NextResponse.redirect(new URL("/admin/dashboard", request.url))
                    } else {
                        console.log(`[Middleware] Redirecting USER to /user/workflow`)
                        return NextResponse.redirect(new URL("/user/workflow", request.url))
                    }
                }

                // Protect admin routes
                if (pathname.startsWith("/admin")) {
                    if (userRole !== "ADMIN") {
                        console.log(`[Middleware] Non-admin trying to access ${pathname}, redirecting`)
                        return NextResponse.redirect(new URL("/user/workflow", request.url))
                    }
                }

                // Protect user routes
                if (pathname.startsWith("/user")) {
                    if (userRole === "ADMIN") {
                        console.log(`[Middleware] Admin trying to access ${pathname}, redirecting`)
                        return NextResponse.redirect(new URL("/admin/dashboard", request.url))
                    }
                }
            } else {
                console.log(`[Middleware] Session fetch failed with status ${sessionResponse.status}`)
            }
        } catch (error) {
            console.error("[Middleware] Auth check failed:", error)
            // On error, allow request to continue
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (public folder)
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
}
