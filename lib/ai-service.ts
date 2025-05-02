import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import connectToDatabase from "./db"
import ProjectIdea from "@/models/ProjectIdea"

type IdeaFormData = {
  areasOfInterest: string
  domainInterest: string
  languagesKnown: string
  additionalInfo?: string
}

export async function generateProjectIdea(formData: IdeaFormData): Promise<string> {
  const prompt = `
    Generate a unique project idea based on the following criteria:
    
    Areas of Interest: ${formData.areasOfInterest}
    Domain Interest: ${formData.domainInterest}
    Programming Languages: ${formData.languagesKnown}
    Additional Information: ${formData.additionalInfo || "None"}
    
    The idea should be innovative, feasible for a student project, and include:
    1. A clear title
    2. A detailed description
    3. Key features
    4. Technical implementation details
    5. Potential challenges
    
    Format the response in Markdown.
  `

  // Using AI SDK to generate text
  const { text } = await generateText({
    model: openai("gpt-4o"),
    prompt,
    system:
      "You are an expert project advisor who specializes in generating unique and innovative project ideas for students. Your ideas should be specific, technically feasible, and tailored to the student's interests and skills.",
  })

  return text
}

export async function checkIdeaUniqueness(ideaTitle: string, ideaDescription: string): Promise<boolean> {
  await connectToDatabase()

  // Get all approved ideas
  const existingIdeas = await ProjectIdea.find({ status: "approved" }).select("title description")

  // If no existing ideas, it's unique
  if (existingIdeas.length === 0) return true

  // Use AI to check similarity
  const existingIdeasText = existingIdeas
    .map((idea) => `Title: ${idea.title}\nDescription: ${idea.description}`)
    .join("\n\n")

  const prompt = `
    I need to determine if a new project idea is sufficiently unique compared to existing ideas.
    
    New idea:
    Title: ${ideaTitle}
    Description: ${ideaDescription}
    
    Existing ideas:
    ${existingIdeasText}
    
    Is the new idea sufficiently unique compared to the existing ideas? 
    Consider the core concept, implementation approach, and target domain.
    Answer with only "yes" or "no".
  `

  const { text } = await generateText({
    model: openai("gpt-4o"),
    prompt,
    system:
      "You are an expert at analyzing project ideas and determining their uniqueness. Be strict about uniqueness - ideas should have distinct core concepts, not just superficial differences.",
  })

  return text.toLowerCase().includes("yes")
}
