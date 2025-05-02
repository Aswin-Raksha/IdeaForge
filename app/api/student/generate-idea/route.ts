import { type NextRequest, NextResponse } from "next/server"
import { generateProjectIdea } from "@/lib/ai-service"
import { requireRole } from "@/lib/auth"

export async function POST(req: NextRequest) {
  // Check if user is a student
  const authError = await requireRole(req, "student")
  if (authError) return authError

  try {
    const { areasOfInterest, domainInterest, languagesKnown, additionalInfo } = await req.json()

    const idea = await generateProjectIdea({
      areasOfInterest,
      domainInterest,
      languagesKnown,
      additionalInfo,
    })

    return NextResponse.json({ idea })
  } catch (error) {
    console.error("Error generating idea:", error)
    return NextResponse.json({ error: "Failed to generate idea" }, { status: 500 })
  }
}
