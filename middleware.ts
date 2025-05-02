import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "./lib/auth"

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const isPublicPath =
    path === "/" ||
    path === "/student/login" ||
    path === "/student/register" ||
    path === "/staff/login" ||
    path === "/staff/register"

  // Get token from cookies
  const token = request.cookies.get("token")?.value || ""

  // Check if the path requires authentication
  if (isPublicPath) {
    // If user is already logged in, redirect to dashboard
    if (token) {
      try {
        const decoded = await verifyToken(token)

        if (decoded) {
          // @ts-ignore
          const role = decoded.role

          // Redirect to appropriate dashboard
          if (path.includes("/student") && role === "student") {
            return NextResponse.redirect(new URL("/student/dashboard", request.url))
          }

          if (path.includes("/staff") && role === "staff") {
            return NextResponse.redirect(new URL("/staff/dashboard", request.url))
          }
        }
      } catch (error) {
        // Invalid token, continue to public path
      }
    }
    return NextResponse.next()
  }

  // Protected routes
  if (!token) {
    // Redirect to login based on the path
    if (path.startsWith("/student")) {
      return NextResponse.redirect(new URL("/student/login", request.url))
    }

    if (path.startsWith("/staff")) {
      return NextResponse.redirect(new URL("/staff/login", request.url))
    }

    return NextResponse.redirect(new URL("/", request.url))
  }

  try {
    const decoded = await verifyToken(token)

    if (!decoded) {
      // Invalid token, redirect to login
      return NextResponse.redirect(new URL("/", request.url))
    }

    // @ts-ignore
    const role = decoded.role

    // Check if user is accessing the correct routes
    if (path.startsWith("/student") && role !== "student") {
      return NextResponse.redirect(new URL("/staff/dashboard", request.url))
    }

    if (path.startsWith("/staff") && role !== "staff") {
      return NextResponse.redirect(new URL("/student/dashboard", request.url))
    }

    return NextResponse.next()
  } catch (error) {
    // Invalid token, redirect to login
    return NextResponse.redirect(new URL("/", request.url))
  }
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/", "/student/:path*", "/staff/:path*"],
}
