"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Download, Mail, Phone, MapPin, Calendar, Star, Eye } from "lucide-react"

export default function CandidatesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [jobFilter, setJobFilter] = useState("all")

  const candidates = [
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah.johnson@email.com",
      phone: "+250 788 123 456",
      location: "Kigali, Rwanda",
      position: "Senior Software Engineer",
      appliedDate: "2024-01-15",
      status: "interview",
      rating: 4.5,
      skills: ["React", "Node.js", "TypeScript", "AWS"],
      experience: "5 years",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 2,
      name: "Michael Chen",
      email: "michael.chen@email.com",
      phone: "+250 788 234 567",
      location: "Kigali, Rwanda",
      position: "Product Manager",
      appliedDate: "2024-01-14",
      status: "review",
      rating: 4.2,
      skills: ["Product Strategy", "Agile", "Analytics", "Leadership"],
      experience: "7 years",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      email: "emily.rodriguez@email.com",
      phone: "+250 788 345 678",
      location: "Kigali, Rwanda",
      position: "UX Designer",
      appliedDate: "2024-01-13",
      status: "hired",
      rating: 4.8,
      skills: ["Figma", "User Research", "Prototyping", "Design Systems"],
      experience: "4 years",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 4,
      name: "David Uwimana",
      email: "david.uwimana@email.com",
      phone: "+250 788 456 789",
      location: "Kigali, Rwanda",
      position: "Data Scientist",
      appliedDate: "2024-01-12",
      status: "rejected",
      rating: 3.9,
      skills: ["Python", "Machine Learning", "SQL", "Tableau"],
      experience: "3 years",
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

  const filteredCandidates = candidates.filter((candidate) => {
    const matchesSearch =
      candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.skills.some((skill) => skill.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesStatus = statusFilter === "all" || candidate.status === statusFilter
    const matchesJob = jobFilter === "all" || candidate.position === jobFilter

    return matchesSearch && matchesStatus && matchesJob
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Candidates</h1>
          <p className="text-muted-foreground">Manage and review job applications</p>
        </div>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search candidates by name, position, or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
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
              <Select value={jobFilter} onValueChange={setJobFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="All Positions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Positions</SelectItem>
                  <SelectItem value="Senior Software Engineer">Software Engineer</SelectItem>
                  <SelectItem value="Product Manager">Product Manager</SelectItem>
                  <SelectItem value="UX Designer">UX Designer</SelectItem>
                  <SelectItem value="Data Scientist">Data Scientist</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Candidates List */}
      <div className="grid gap-4">
        {filteredCandidates.map((candidate) => (
          <Card key={candidate.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={candidate.avatar || "/placeholder.svg"} alt={candidate.name} />
                  <AvatarFallback>
                    {candidate.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{candidate.name}</h3>
                      <p className="text-muted-foreground">{candidate.position}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{candidate.rating}</span>
                      </div>
                      <Badge className={getStatusColor(candidate.status)}>
                        {candidate.status.charAt(0).toUpperCase() + candidate.status.slice(1)}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {candidate.email}
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {candidate.phone}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {candidate.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Applied {new Date(candidate.appliedDate).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Experience: {candidate.experience}</p>
                    <div className="flex flex-wrap gap-1">
                      {candidate.skills.map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View Profile
                    </Button>
                    <Button size="sm" variant="outline">
                      <Mail className="h-4 w-4 mr-2" />
                      Contact
                    </Button>
                    {candidate.status === "review" && (
                      <>
                        <Button size="sm" variant="outline">
                          Schedule Interview
                        </Button>
                        <Button size="sm" variant="outline">
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCandidates.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <p className="text-muted-foreground">No candidates found matching your criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
