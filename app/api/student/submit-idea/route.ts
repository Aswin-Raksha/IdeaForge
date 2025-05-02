"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import StaffHeader from "@/components/staff-header"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import ReactMarkdown from "react-markdown"

type Idea = {
  _id: string
  title: string
  description: string
  status: "pending" | "approved" | "rejected"
  feedback?: string
  submittedAt: string
  student?: {
    name: string
    email: string
  }
}

export default function StaffDashboard() {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null)
  const [feedback, setFeedback] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isReviewing, setIsReviewing] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    // Fetch ideas
    const fetchIdeas = async () => {
      try {
        const response = await fetch("/api/staff/ideas")

        if (response.status === 401 || response.status === 403) {
          // Unauthorized or forbidden, redirect to login
          router.push("/staff/login")
          return
        }

        const data = await response.json()

        if (response.ok) {
          setIdeas(data.ideas)
        } else {
          toast({
            title: "Error",
            description: data.error || "Failed to fetch ideas",
            variant: "destructive",
          })
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch ideas",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchIdeas()
  }, [router, toast])

  const handleApprove = async (id: string) => {
    setIsReviewing(true)
    try {
      const response = await fetch("/api/staff/review-idea", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ideaId: id,
          status: "approved",
          feedback,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Idea approved",
          description: "The project idea has been approved successfully.",
        })

        // Update the idea in the list
        setIdeas(ideas.map((idea) => (idea._id === id ? { ...idea, status: "approved", feedback } : idea)))

        setFeedback("")
        setDialogOpen(false)
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to approve idea",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve idea",
        variant: "destructive",
      })
    } finally {
      setIsReviewing(false)
    }
  }

  const handleReject = async (id: string) => {
    setIsReviewing(true)
    try {
      const response = await fetch("/api/staff/review-idea", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ideaId: id,
          status: "rejected",
          feedback,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Idea rejected",
          description: "The project idea has been rejected.",
        })

        // Update the idea in the list
        setIdeas(ideas.map((idea) => (idea._id === id ? { ...idea, status: "rejected", feedback } : idea)))

        setFeedback("")
        setDialogOpen(false)
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to reject idea",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject idea",
        variant: "destructive",
      })
    } finally {
      setIsReviewing(false)
    }
  }

  const pendingIdeas = ideas.filter((idea) => idea.status === "pending")
  const approvedIdeas = ideas.filter((idea) => idea.status === "approved")
  const rejectedIdeas = ideas.filter((idea) => idea.status === "rejected")

  return (
    <div className="min-h-screen bg-gray-50">
      <StaffHeader />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Staff Dashboard</h1>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{pendingIdeas.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{approvedIdeas.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Rejected</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{rejectedIdeas.length}</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending">
          <TabsList className="mb-6">
            <TabsTrigger value="pending">Pending Review</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Pending Ideas</CardTitle>
                <CardDescription>Review and provide feedback on submitted project ideas</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">Loading...</div>
                ) : pendingIdeas.length > 0 ? (
                  <div className="space-y-4">
                    {pendingIdeas.map((idea) => (
                      <div key={idea._id} className="p-4 border rounded-md">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium">{idea.title}</h3>
                          <Badge>Pending</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-3">{idea.description}</p>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {idea.student && (
                            <div className="flex justify-between items-center text-sm text-gray-500 w-full">
                              <span>
                                Student: {idea.student.name} ({idea.student.email})
                              </span>
                              <span>Submitted: {new Date(idea.submittedAt).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                        <div className="mt-4 flex justify-end gap-2">
                          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setSelectedIdea(idea)
                                  setFeedback("")
                                }}
                              >
                                Review
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Review Project Idea</DialogTitle>
                                <DialogDescription>
                                  Provide feedback and approve or reject this project idea
                                </DialogDescription>
                              </DialogHeader>

                              <div className="py-4">
                                <h3 className="font-medium text-lg">{selectedIdea?.title}</h3>
                                <div className="mt-2 text-gray-700 prose prose-sm max-h-60 overflow-y-auto">
                                  <ReactMarkdown>{selectedIdea?.description || ""}</ReactMarkdown>
                                </div>

                                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                                  {selectedIdea?.student && (
                                    <>
                                      <div>
                                        <p className="font-medium">Student</p>
                                        <p>
                                          {selectedIdea.student.name} ({selectedIdea.student.email})
                                        </p>
                                      </div>
                                      <div>
                                        <p className="font-medium">Submitted</p>
                                        <p>{new Date(selectedIdea.submittedAt).toLocaleDateString()}</p>
                                      </div>
                                    </>
                                  )}
                                </div>

                                <div className="mt-4">
                                  <label className="block font-medium mb-2">Feedback</label>
                                  <Textarea
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    placeholder="Provide feedback for the student"
                                    rows={4}
                                  />
                                </div>
                              </div>

                              <DialogFooter>
                                <Button
                                  variant="outline"
                                  onClick={() => selectedIdea && handleReject(selectedIdea._id)}
                                  disabled={isReviewing}
                                >
                                  {isReviewing ? "Rejecting..." : "Reject"}
                                </Button>
                                <Button
                                  onClick={() => selectedIdea && handleApprove(selectedIdea._id)}
                                  disabled={isReviewing}
                                >
                                  {isReviewing ? "Approving..." : "Approve"}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">No pending ideas to review</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="approved">
            <Card>
              <CardHeader>
                <CardTitle>Approved Ideas</CardTitle>
                <CardDescription>Project ideas that have been approved</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">Loading...</div>
                ) : approvedIdeas.length > 0 ? (
                  <div className="space-y-4">
                    {approvedIdeas.map((idea) => (
                      <div key={idea._id} className="p-4 border rounded-md">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium">{idea.title}</h3>
                          <Badge>Approved</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-3">{idea.description}</p>
                        {idea.student && (
                          <div className="text-xs text-gray-500">
                            Student: {idea.student.name} | Submitted: {new Date(idea.submittedAt).toLocaleDateString()}
                          </div>
                        )}
                        {idea.feedback && (
                          <div className="mt-2 text-sm">
                            <p className="font-medium">Feedback:</p>
                            <p className="text-gray-600">{idea.feedback}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">No approved ideas yet</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rejected">
            <Card>
              <CardHeader>
                <CardTitle>Rejected Ideas</CardTitle>
                <CardDescription>Project ideas that have been rejected</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">Loading...</div>
                ) : rejectedIdeas.length > 0 ? (
                  <div className="space-y-4">
                    {rejectedIdeas.map((idea) => (
                      <div key={idea._id} className="p-4 border rounded-md">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium">{idea.title}</h3>
                          <Badge variant="outline">Rejected</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-3">{idea.description}</p>
                        {idea.student && (
                          <div className="text-xs text-gray-500">
                            Student: {idea.student.name} | Submitted: {new Date(idea.submittedAt).toLocaleDateString()}
                          </div>
                        )}
                        {idea.feedback && (
                          <div className="mt-2 text-sm">
                            <p className="font-medium">Feedback:</p>
                            <p className="text-gray-600">{idea.feedback}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">No rejected ideas</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
