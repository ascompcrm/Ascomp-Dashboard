import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// export async function proxy(request: NextRequest) {
//     const { pathname } = request.nextUrl

//     console.log("path name", pathname);

//     const sessionCookie = request.cookies.get("better-auth.session_token")
//     console.log("session cookie", sessionCookie)
//     console.log(`[Middleware] Path: ${pathname}, Session: ${sessionCookie ? 'exists' : 'none'}`)

//     // Public routes that don't require authentication
//     const publicRoutes = ["/", "/login"]
//     const isPublicRoute = publicRoutes.includes(pathname)

//     // If no session and trying to access protected route, redirect to login
//     if (!sessionCookie && !isPublicRoute) {
//         console.log(`[Middleware] No session, redirecting ${pathname} to /login`)
//         const loginUrl = new URL("/login", request.url)
//         return NextResponse.redirect(loginUrl)
//     }

//     // If has session, fetch user role
//     if (sessionCookie) {
//         try {
//             // Build absolute URL for session endpoint
//             const baseUrl = request.nextUrl.origin
//             const sessionUrl = `${baseUrl}/api/auth/get-session`

//             console.log(`[Middleware] Fetching session from: ${sessionUrl}`)

//             const sessionResponse = await fetch(sessionUrl, {
//                 headers: {
//                     "Cookie": `better-auth.session_token=${sessionCookie.value}`,
//                 },
//                 cache: "no-store",
//             })

//             console.log(`[Middleware] Session response status: ${sessionResponse.status}`)

//             if (sessionResponse.ok) {
//                 const sessionData = await sessionResponse.json()
//                 const userRole = sessionData?.user?.role

//                 console.log(`[Middleware] Session data:`, JSON.stringify(sessionData, null, 2))
//                 console.log(`[Middleware] User role: ${userRole}, Path: ${pathname}`)

//                 // If on login page or home page with active session, redirect based on role
//                 if (pathname === "/login" || pathname === "/") {
//                     if (userRole === "ADMIN") {
//                         console.log(`[Middleware] Redirecting ADMIN to /admin/dashboard`)
//                         return NextResponse.redirect(new URL("/admin/dashboard", request.url))
//                     } else if (userRole === "FIELD_WORKER") {
//                         console.log(`[Middleware] Redirecting FIELD_WORKER to /user/workflow`)
//                         return NextResponse.redirect(new URL("/user/workflow", request.url))
//                     } else {
//                         console.log(`[Middleware] Unknown role: ${userRole}`)
//                     }
//                 }

//                 // Protect admin routes
//                 if (pathname.startsWith("/admin")) {
//                     if (userRole !== "ADMIN") {
//                         console.log(`[Middleware] Non-admin trying to access ${pathname}, redirecting`)
//                         return NextResponse.redirect(new URL("/user/workflow", request.url))
//                     }
//                 }

//                 // Protect user routes
//                 if (pathname.startsWith("/user")) {
//                     if (userRole === "ADMIN") {
//                         console.log(`[Middleware] Admin trying to access ${pathname}, redirecting`)
//                         return NextResponse.redirect(new URL("/admin/dashboard", request.url))
//                     }
//                 }

//                 // Add debug headers for successful auth
//                 const response = NextResponse.next()
//                 response.headers.set('X-Middleware-Executed', 'true')
//                 response.headers.set('X-User-Role', userRole || 'NONE')
//                 return response
//             } else {
//                 const responseText = await sessionResponse.text()
//                 console.log(`[Middleware] Session fetch failed with status ${sessionResponse.status}`)
//                 console.log(`[Middleware] Response body:`, responseText)
//             }
//         } catch (error) {
//             console.error("[Middleware] Auth check failed:", error)
//             // On error, allow request to continue
//         }
//     }

//     // Add header to show middleware ran(no session case)
//     const response = NextResponse.next()
//     response.headers.set('X-Middleware-Executed', 'true')
//     response.headers.set('X-Has-Session', sessionCookie ? 'yes' : 'no')
//     return response
// }

// export const config = {
//     matcher: [
//         "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
//     ],
// }


export default function proxy(request: NextRequest) {
    return NextResponse.redirect(new URL('/', request.url));
}