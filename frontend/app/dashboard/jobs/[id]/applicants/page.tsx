"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ArrowLeft, Search, Filter, Mail, Phone, MapPin, Calendar, Star, Eye, CheckCircle, XCircle } from "lucide-react"

export default function JobApplicantsPage() {
  const params = useParams()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedApplicant, setSelectedApplicant] = useState<any>(null)
  const [actionType, setActionType] = useState<"interview" | "reject" | "hire" | null>(null)
  const [message, setMessage] = useState("")

  const jobTitle = "Senior Software Engineer"

  const applicants = [
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah.johnson@email.com",
      phone: "+250 788 123 456",
      location: "Kigali, Rwanda",
      appliedDate: "2024-01-15",
      status: "review",
      rating: 4.5,
      skills: ["React", "Node.js", "TypeScript", "AWS"],
      experience: "5 years",
      education: "Bachelor's in Computer Science",
      resume: "sarah_johnson_resume.pdf",
      coverLetter: "I am excited to apply for this position...",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 2,
      name: "Michael Chen",
      email: "michael.chen@email.com",
      phone: "+250 788 234 567",
      location: "Kigali, Rwanda",
      appliedDate: "2024-01-14",
      status: "interview",
      rating: 4.2,
      skills: ["React", "Python", "Docker", "Kubernetes"],
      experience: "7 years",
      education: "Master's in Software Engineering",
      resume: "michael_chen_resume.pdf",
      coverLetter: "With over 7 years of experience...",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      email: "emily.rodriguez@email.com",
      phone: "+250 788 345 678",
      location: "Kigali, Rwanda",
      appliedDate: "2024-01-13",
      status: "hired",
      rating: 4.8,
      skills: ["React", "Vue.js", "GraphQL", "MongoDB"],
      experience: "4 years",
      education: "Bachelor's in Information Technology",
      resume: "emily_rodriguez_resume.pdf",
      coverLetter: "I believe my skills align perfectly...",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "review":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
      case "interview":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      case "hired":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "rejected":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20"
    }
  }

  const handleAction = async () => {
    if (!selectedApplicant || !actionType) return

    // Mock API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Update applicant status locally
    const updatedStatus = actionType === "interview" ? "interview" : actionType === "hire" ? "hired" : "rejected"

    setSelectedApplicant(null)
    setActionType(null)
    setMessage("")
  }

  const filteredApplicants = applicants.filter((applicant) => {
    const matchesSearch =
      applicant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      applicant.skills.some((skill) => skill.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesStatus = statusFilter === "all" || applicant.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Applicants for {jobTitle}</h1>
          <p className="text-muted-foreground">{filteredApplicants.length} candidates found</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search applicants by name or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="review">Under Review</SelectItem>
                <SelectItem value="interview">Interview</SelectItem>
                <SelectItem value="hired">Hired</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Applicants List */}
      <div className="grid gap-4">
        {filteredApplicants.map((applicant) => (
          <Card key={applicant.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={applicant.avatar || "/placeholder.svg"} alt={applicant.name} />
                  <AvatarFallback>
                    {applicant.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{applicant.name}</h3>
                      <p className="text-muted-foreground">{applicant.education}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{applicant.rating}</span>
                      </div>
                      <Badge className={getStatusColor(applicant.status)}>
                        {applicant.status.charAt(0).toUpperCase() + applicant.status.slice(1)}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {applicant.email}
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {applicant.phone}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {applicant.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Applied {new Date(applicant.appliedDate).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Experience: {applicant.experience}</p>
                    <div className="flex flex-wrap gap-1">
                      {applicant.skills.map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>{applicant.name}</DialogTitle>
                          <DialogDescription>Application details and documents</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <h4 className="font-medium mb-2">Contact Information</h4>
                              <div className="space-y-1 text-sm text-muted-foreground">
                                <p>{applicant.email}</p>
                                <p>{applicant.phone}</p>
                                <p>{applicant.location}</p>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium mb-2">Experience & Education</h4>
                              <div className="space-y-1 text-sm text-muted-foreground">
                                <p>Experience: {applicant.experience}</p>
                                <p>Education: {applicant.education}</p>
                                <p>Applied: {new Date(applicant.appliedDate).toLocaleDateString()}</p>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium mb-2">Cover Letter</h4>
                            <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                              {applicant.coverLetter}
                            </p>
                          </div>

                          <div>
                            <h4 className="font-medium mb-2">Skills</h4>
                            <div className="flex flex-wrap gap-1">
                              {applicant.skills.map((skill) => (
                                <Badge key={skill} variant="outline" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium mb-2">Resume</h4>
                            <Button variant="outline" size="sm">
                              Download {applicant.resume}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button size="sm" variant="outline">
                      <Mail className="h-4 w-4 mr-2" />
                      Contact
                    </Button>

                    {applicant.status === "review" && (
                      <>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedApplicant(applicant)
                                setActionType("interview")
                              }}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Schedule Interview
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Schedule Interview</DialogTitle>
                              <DialogDescription>Send interview invitation to {applicant.name}</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <Textarea
                                placeholder="Add a message for the candidate..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                              />
                              <div className="flex gap-2 justify-end">
                                <Button variant="outline" onClick={() => setSelectedApplicant(null)}>
                                  Cancel
                                </Button>
                                <Button onClick={handleAction}>Send Interview Invitation</Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedApplicant(applicant)
                                setActionType("reject")
                              }}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Reject Application</DialogTitle>
                              <DialogDescription>Send rejection notice to {applicant.name}</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <Textarea
                                placeholder="Add a message for the candidate (optional)..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                              />
                              <div className="flex gap-2 justify-end">
                                <Button variant="outline" onClick={() => setSelectedApplicant(null)}>
                                  Cancel
                                </Button>
                                <Button variant="destructive" onClick={handleAction}>
                                  Send Rejection
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </>
                    )}

                    {applicant.status === "interview" && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedApplicant(applicant)
                              setActionType("hire")
                            }}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Hire Candidate
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Hire Candidate</DialogTitle>
                            <DialogDescription>Send job offer to {applicant.name}</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Textarea
                              placeholder="Add a message with the job offer..."
                              value={message}
                              onChange={(e) => setMessage(e.target.value)}
                            />
                            <div className="flex gap-2 justify-end">
                              <Button variant="outline" onClick={() => setSelectedApplicant(null)}>
                                Cancel
                              </Button>
                              <Button onClick={handleAction}>Send Job Offer</Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredApplicants.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <p className="text-muted-foreground">No applicants found matching your criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
