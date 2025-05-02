import { type NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import ProjectIdea from "@/models/ProjectIdea"
import Feedback from "@/models/Feedback"
import { getCurrentUser, requireRole } from "@/lib/auth"

export async function POST(req: NextRequest) {
  // Check if user is a staff
  const authError = await requireRole(req, "staff")
  if (authError) return authError

  try {
    const { ideaId, status, feedback } = await req.json()

    await connectToDatabase()

    // Get current user
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Update project idea
    const updatedIdea = await ProjectIdea.findByIdAndUpdate(
      ideaId,
      {
        status,
        feedback,
        reviewedAt: new Date(),
        reviewedBy: user._id,
      },
      { new: true },
    )

    if (!updatedIdea) {
      return NextResponse.json({ error: "Project idea not found" }, { status: 404 })
    }

    // Create feedback record
    if (feedback) {
      const feedbackRecord = new Feedback({
        ideaId,
        staffId: user._id,
        content: feedback,
      })
      await feedbackRecord.save()
    }

    return NextResponse.json({
      success: true,
      message: `Project idea ${status}`,
      idea: updatedIdea,
    })
  } catch (error) {
    console.error("Error reviewing idea:", error)
    return NextResponse.json({ error: "Failed to review idea" }, { status: 500 })
  }
}
