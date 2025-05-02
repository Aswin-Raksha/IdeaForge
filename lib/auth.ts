import jwt from "jsonwebtoken"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import { type IUser } from "@/models/User" // Import only the type, not the model directly

// Don't use DB models like Mongoose in Middleware — only use them in API routes
const JWT_SECRET = process.env.JWT_SECRET || "1206ce854c1b28027d5768fdc4029c3b4ae0e05f6d53c8bfa25d8ab5d4c12a32c0c985b4ea3febc1400946987df274ac4e8ad982b7631e126f6821fb738dd151"

export async function signToken(user: IUser) {
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role,
  }

  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" })
}

export async function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as jwt.JwtPayload
  } catch (error) {
    return null
  }
}

// This function should only be used in API routes or Server Components
export async function getCurrentUser() {
  const cookieStore = cookies()
  const token = cookieStore.get("token")?.value

  if (!token) return null

  const decoded = await verifyToken(token)
  if (!decoded) return null

  try {
    // Lazy-load Mongoose and User model
    const mongoose = await import("mongoose")
    const { default: User } = await import("@/models/User")

    const user = await User.findById(decoded.id).select("-password")
    return user
  } catch (error) {
    console.error("Failed to fetch user:", error)
    return null
  }
}

export async function requireAuth(req: NextRequest) {
  const cookieStore = cookies()
  const token = cookieStore.get("token")?.value

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const decoded = await verifyToken(token)
  if (!decoded) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
  }

  return null // Auth successful
}

export async function requireRole(req: NextRequest, role: string) {
  const authError = await requireAuth(req)
  if (authError) return authError

  const token = cookies().get("token")?.value
  const decoded = await verifyToken(token!)

  if (!decoded || decoded.role !== role) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  return null // Role check passed
}
