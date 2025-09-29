"use client"

import { useState } from "react"
import { Logo } from "@/components/ui/logo"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ThemeToggle } from "@/components/theme-toggle"
import { Search, MapPin, Clock, DollarSign, Building, Filter, Heart } from "lucide-react"
import Link from "next/link"

// Mock job data - will be replaced with API calls
const mockJobs = [
  {
    id: "1",
    title: "Senior Software Engineer",
    company: "TechCorp Rwanda",
    location: "Kigali, Rwanda",
    type: "Full-time",
    remote: true,
    salary: "$60,000 - $80,000",
    postedAt: "2 days ago",
    description: "Join our growing team to build innovative software solutions...",
    skills: ["React", "Node.js", "TypeScript", "AWS"],
    featured: true,
  },
  {
    id: "2",
    title: "Marketing Manager",
    company: "Growth Solutions",
    location: "Kigali, Rwanda",
    type: "Full-time",
    remote: false,
    salary: "$45,000 - $55,000",
    postedAt: "1 week ago",
    description: "Lead marketing initiatives for our expanding business...",
    skills: ["Digital Marketing", "Analytics", "Strategy", "Leadership"],
    featured: false,
  },
  {
    id: "3",
    title: "Data Analyst",
    company: "Analytics Pro",
    location: "Remote",
    type: "Contract",
    remote: true,
    salary: "$40,000 - $50,000",
    postedAt: "3 days ago",
    description: "Analyze complex datasets to drive business insights...",
    skills: ["Python", "SQL", "Tableau", "Statistics"],
    featured: false,
  },
  {
    id: "4",
    title: "UX Designer",
    company: "Design Studio",
    location: "Kigali, Rwanda",
    type: "Full-time",
    remote: true,
    salary: "$50,000 - $65,000",
    postedAt: "5 days ago",
    description: "Create beautiful and intuitive user experiences...",
    skills: ["Figma", "User Research", "Prototyping", "Design Systems"],
    featured: true,
  },
  {
    id: "5",
    title: "Project Manager",
    company: "BuildTech",
    location: "Kigali, Rwanda",
    type: "Full-time",
    remote: false,
    salary: "$55,000 - $70,000",
    postedAt: "1 day ago",
    description: "Manage complex construction and development projects...",
    skills: ["Project Management", "Agile", "Leadership", "Communication"],
    featured: false,
  },
  {
    id: "6",
    title: "Financial Analyst",
    company: "FinanceFirst",
    location: "Kigali, Rwanda",
    type: "Full-time",
    remote: false,
    salary: "$42,000 - $52,000",
    postedAt: "4 days ago",
    description: "Provide financial analysis and strategic recommendations...",
    skills: ["Excel", "Financial Modeling", "Analysis", "Reporting"],
    featured: false,
  },
]

export default function JobsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [locationFilter, setLocationFilter] = useState("")
  const [jobTypeFilter, setJobTypeFilter] = useState("")
  const [remoteOnly, setRemoteOnly] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const filteredJobs = mockJobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.skills.some((skill) => skill.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesLocation = !locationFilter || job.location.toLowerCase().includes(locationFilter.toLowerCase())
    const matchesJobType = !jobTypeFilter || job.type === jobTypeFilter
    const matchesRemote = !remoteOnly || job.remote

    return matchesSearch && matchesLocation && matchesJobType && matchesRemote
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Logo />
            </Link>
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/jobs" className="text-sm font-medium text-primary">
                Find Jobs
              </Link>
              <Link href="/employers" className="text-sm font-medium hover:text-primary transition-colors">
                For Employers
              </Link>
              <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors">
                About
              </Link>
            </nav>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/login">Sign In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/auth/signup">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              <div className="flex items-center justify-between lg:hidden">
                <h3 className="font-semibold">Filters</h3>
                <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
                  <Filter className="h-4 w-4 mr-2" />
                  {showFilters ? "Hide" : "Show"} Filters
                </Button>
              </div>

              <div className={`space-y-6 ${showFilters ? "block" : "hidden lg:block"}`}>
                <Card>
                  <CardHeader>
                    <h3 className="font-semibold">Search & Filter</h3>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search jobs, companies, skills..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Location</label>
                      <Select value={locationFilter} onValueChange={setLocationFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="All locations" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All locations</SelectItem>
                          <SelectItem value="kigali">Kigali</SelectItem>
                          <SelectItem value="remote">Remote</SelectItem>
                          <SelectItem value="butare">Butare</SelectItem>
                          <SelectItem value="musanze">Musanze</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Job Type</label>
                      <Select value={jobTypeFilter} onValueChange={setJobTypeFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="All types" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All types</SelectItem>
                          <SelectItem value="Full-time">Full-time</SelectItem>
                          <SelectItem value="Part-time">Part-time</SelectItem>
                          <SelectItem value="Contract">Contract</SelectItem>
                          <SelectItem value="Internship">Internship</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox id="remote" checked={remoteOnly} onCheckedChange={setRemoteOnly} />
                      <label htmlFor="remote" className="text-sm font-medium">
                        Remote jobs only
                      </label>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <h3 className="font-semibold">Popular Categories</h3>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {["Technology", "Marketing", "Finance", "Healthcare", "Education", "Construction"].map(
                        (category) => (
                          <button
                            key={category}
                            className="block w-full text-left text-sm text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {category}
                          </button>
                        ),
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Job Listings */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold">Job Opportunities</h1>
                  <p className="text-muted-foreground">{filteredJobs.length} jobs found</p>
                </div>
                <Select defaultValue="recent">
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="salary-high">Salary: High to Low</SelectItem>
                    <SelectItem value="salary-low">Salary: Low to High</SelectItem>
                    <SelectItem value="company">Company A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                {filteredJobs.map((job) => (
                  <Card key={job.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Link href={`/jobs/${job.id}`}>
                                  <h3 className="text-lg font-semibold hover:text-primary transition-colors">
                                    {job.title}
                                  </h3>
                                </Link>
                                {job.featured && (
                                  <Badge variant="secondary" className="text-xs">
                                    Featured
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                                <div className="flex items-center gap-1">
                                  <Building className="h-4 w-4" />
                                  {job.company}
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  {job.location}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {job.postedAt}
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{job.description}</p>
                              <div className="flex items-center gap-2 mb-3">
                                <Badge variant="outline">{job.type}</Badge>
                                {job.remote && (
                                  <Badge variant="outline" className="text-green-600 border-green-600">
                                    Remote
                                  </Badge>
                                )}
                                <div className="flex items-center gap-1 text-sm font-medium text-primary">
                                  <DollarSign className="h-4 w-4" />
                                  {job.salary}
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {job.skills.slice(0, 4).map((skill) => (
                                  <Badge key={skill} variant="secondary" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                                {job.skills.length > 4 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{job.skills.length - 4} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 ml-4">
                          <Button variant="ghost" size="sm">
                            <Heart className="h-4 w-4" />
                          </Button>
                          <Link href={`/jobs/${job.id}`}>
                            <Button size="sm">View Details</Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredJobs.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
                    <p className="text-muted-foreground mb-4">Try adjusting your search criteria or filters</p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery("")
                        setLocationFilter("")
                        setJobTypeFilter("")
                        setRemoteOnly(false)
                      }}
                    >
                      Clear all filters
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Pagination */}
              {filteredJobs.length > 0 && (
                <div className="flex items-center justify-center gap-2 pt-8">
                  <Button variant="outline" size="sm" disabled>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">
                    1
                  </Button>
                  <Button variant="outline" size="sm">
                    2
                  </Button>
                  <Button variant="outline" size="sm">
                    3
                  </Button>
                  <Button variant="outline" size="sm">
                    Next
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
