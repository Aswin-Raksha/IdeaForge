"use client"

import { useState } from "react"
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

type Idea = {
  id: number
  studentName: string
  studentId: string
  title: string
  description: string
  areasOfInterest: string[]
  domainInterest: string
  languagesKnown: string[]
  submittedDate: string
  status: "pending" | "approved" | "rejected"
  feedback: string
}

export default function StaffDashboard() {
  const [ideas, setIdeas] = useState<Idea[]>([
    {
      id: 1,
      studentName: "John Doe",
      studentId: "S12345",
      title: "AI-powered Health Tracker",
      description:
        "A mobile application that uses AI to track health metrics and provide personalized recommendations.",
      areasOfInterest: ["AI", "Mobile Development", "Healthcare"],
      domainInterest: "Healthcare",
      languagesKnown: ["JavaScript", "React Native", "Python"],
      submittedDate: "2023-05-01",
      status: "pending",
      feedback: "",
    },
    {
      id: 2,
      studentName: "Jane Smith",
      studentId: "S67890",
      title: "Smart Home Energy Management",
      description: "A system that optimizes energy usage in homes using IoT devices and machine learning algorithms.",
      areasOfInterest: ["IoT", "Machine Learning", "Energy"],
      domainInterest: "Smart Home",
      languagesKnown: ["Python", "JavaScript", "C++"],
      submittedDate: "2023-05-02",
      status: "approved",
      feedback: "Excellent idea with practical applications. Consider adding a cost-saving calculator feature.",
    },
    {
      id: 3,
      studentName: "Alex Johnson",
      studentId: "S24680",
      title: "AR Educational Platform",
      description: "An augmented reality platform for interactive educational experiences in science and history.",
      areasOfInterest: ["AR/VR", "Education", "Mobile Development"],
      domainInterest: "Education",
      languagesKnown: ["Unity", "C#", "JavaScript"],
      submittedDate: "2023-05-03",
      status: "rejected",
      feedback:
        "The idea is interesting but too similar to existing project #45. Please revise with a more unique approach.",
    },
  ])

  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null)
  const [feedback, setFeedback] = useState("")

  const handleApprove = (id: number) => {
    setIdeas(ideas.map((idea) => (idea.id === id ? { ...idea, status: "approved", feedback } : idea)))
    setFeedback("")
    setSelectedIdea(null)
  }

  const handleReject = (id: number) => {
    setIdeas(ideas.map((idea) => (idea.id === id ? { ...idea, status: "rejected", feedback } : idea)))
    setFeedback("")
    setSelectedIdea(null)
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
                {pendingIdeas.length > 0 ? (
                  <div className="space-y-4">
                    {pendingIdeas.map((idea) => (
                      <div key={idea.id} className="p-4 border rounded-md">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium">{idea.title}</h3>
                          <Badge>Pending</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{idea.description}</p>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {idea.areasOfInterest.map((area) => (
                            <Badge key={area} variant="outline">
                              {area}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex justify-between items-center text-sm text-gray-500">
                          <span>
                            Student: {idea.studentName} ({idea.studentId})
                          </span>
                          <span>Submitted: {idea.submittedDate}</span>
                        </div>
                        <div className="mt-4 flex justify-end gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" onClick={() => setSelectedIdea(idea)}>
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
                                <p className="mt-2 text-gray-700">{selectedIdea?.description}</p>

                                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <p className="font-medium">Student</p>
                                    <p>
                                      {selectedIdea?.studentName} ({selectedIdea?.studentId})
                                    </p>
                                  </div>
                                  <div>
                                    <p className="font-medium">Submitted</p>
                                    <p>{selectedIdea?.submittedDate}</p>
                                  </div>
                                  <div>
                                    <p className="font-medium">Domain</p>
                                    <p>{selectedIdea?.domainInterest}</p>
                                  </div>
                                  <div>
                                    <p className="font-medium">Languages</p>
                                    <p>{selectedIdea?.languagesKnown.join(", ")}</p>
                                  </div>
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
                                <Button variant="outline" onClick={() => selectedIdea && handleReject(selectedIdea.id)}>
                                  Reject
                                </Button>
                                <Button onClick={() => selectedIdea && handleApprove(selectedIdea.id)}>Approve</Button>
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
                {approvedIdeas.length > 0 ? (
                  <div className="space-y-4">
                    {approvedIdeas.map((idea) => (
                      <div key={idea.id} className="p-4 border rounded-md">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium">{idea.title}</h3>
                          <Badge>Approved</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{idea.description}</p>
                        <div className="mt-2 text-sm">
                          <p className="font-medium">Feedback:</p>
                          <p className="text-gray-600">{idea.feedback}</p>
                        </div>
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
                {rejectedIdeas.length > 0 ? (
                  <div className="space-y-4">
                    {rejectedIdeas.map((idea) => (
                      <div key={idea.id} className="p-4 border rounded-md">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium">{idea.title}</h3>
                          <Badge variant="outline">Rejected</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{idea.description}</p>
                        <div className="mt-2 text-sm">
                          <p className="font-medium">Feedback:</p>
                          <p className="text-gray-600">{idea.feedback}</p>
                        </div>
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
