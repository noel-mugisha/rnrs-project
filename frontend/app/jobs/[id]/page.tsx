"use client"

import { useState } from "react"
import { Logo } from "@/components/ui/logo"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  MapPin,
  Clock,
  DollarSign,
  Building,
  Users,
  Calendar,
  Share2,
  Heart,
  ArrowLeft,
  CheckCircle,
  Upload,
} from "lucide-react"
import Link from "next/link"

// Mock job data - will be replaced with API calls
const mockJob = {
  id: "1",
  title: "Senior Software Engineer",
  company: "TechCorp Rwanda",
  location: "Kigali, Rwanda",
  type: "Full-time",
  remote: true,
  salary: "$60,000 - $80,000",
  postedAt: "2 days ago",
  expiresAt: "30 days",
  applicants: 24,
  description: `We are looking for a Senior Software Engineer to join our growing team in Kigali. You will be responsible for designing, developing, and maintaining high-quality software solutions that serve thousands of users across Rwanda and East Africa.

In this role, you will work closely with our product team to build innovative features, mentor junior developers, and contribute to our technical architecture decisions. We value clean code, collaborative development, and continuous learning.`,
  responsibilities: [
    "Design and develop scalable web applications using modern technologies",
    "Collaborate with cross-functional teams to define and implement new features",
    "Mentor junior developers and conduct code reviews",
    "Participate in technical architecture discussions and decisions",
    "Ensure code quality through testing and best practices",
    "Stay up-to-date with emerging technologies and industry trends",
  ],
  requirements: [
    "5+ years of experience in software development",
    "Strong proficiency in React, Node.js, and TypeScript",
    "Experience with cloud platforms (AWS, Azure, or GCP)",
    "Knowledge of database design and optimization",
    "Experience with agile development methodologies",
    "Excellent communication skills in English and Kinyarwanda",
    "Bachelor's degree in Computer Science or related field",
  ],
  skills: ["React", "Node.js", "TypeScript", "AWS", "PostgreSQL", "Docker", "Git", "Agile"],
  benefits: [
    "Competitive salary and equity package",
    "Health insurance for you and your family",
    "Flexible working hours and remote work options",
    "Professional development budget",
    "Annual team retreats and company events",
    "Modern office space in Kigali with free meals",
  ],
  companyInfo: {
    name: "TechCorp Rwanda",
    size: "50-100 employees",
    industry: "Technology",
    founded: "2018",
    description:
      "TechCorp Rwanda is a leading technology company focused on building innovative solutions for the African market. We're passionate about using technology to solve real-world problems and create opportunities for growth.",
  },
  featured: true,
}

export default function JobDetailsPage({ params }: { params: { id: string } }) {
  const [isApplying, setIsApplying] = useState(false)
  const [coverLetter, setCoverLetter] = useState("")
  const [selectedResume, setSelectedResume] = useState("")

  // Mock resumes - will be replaced with API calls
  const mockResumes = [
    { id: "1", name: "John_Doe_Resume_2025.pdf", uploadedAt: "2 days ago" },
    { id: "2", name: "John_Doe_Technical_Resume.pdf", uploadedAt: "1 week ago" },
  ]

  const handleApply = () => {
    // Handle job application logic here
    console.log("Applying with:", { selectedResume, coverLetter })
    setIsApplying(false)
    // Show success message
  }

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
        <div className="mb-6">
          <Link href="/jobs" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to jobs
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Job Header */}
            <Card>
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h1 className="text-3xl font-bold">{mockJob.title}</h1>
                        {mockJob.featured && <Badge variant="secondary">Featured</Badge>}
                      </div>
                      <div className="flex items-center gap-4 text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Building className="h-4 w-4" />
                          {mockJob.company}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {mockJob.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {mockJob.postedAt}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <Badge variant="outline" className="text-sm">
                      {mockJob.type}
                    </Badge>
                    {mockJob.remote && (
                      <Badge variant="outline" className="text-sm text-green-600 border-green-600">
                        Remote
                      </Badge>
                    )}
                    <div className="flex items-center gap-1 text-lg font-semibold text-primary">
                      <DollarSign className="h-5 w-5" />
                      {mockJob.salary}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {mockJob.skills.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Job Description */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Job Description</h2>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="prose prose-sm max-w-none">
                  <p className="text-muted-foreground leading-relaxed">{mockJob.description}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Key Responsibilities</h3>
                  <ul className="space-y-2">
                    {mockJob.responsibilities.map((responsibility, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        {responsibility}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Requirements</h3>
                  <ul className="space-y-2">
                    {mockJob.requirements.map((requirement, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        {requirement}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Benefits & Perks</h3>
                  <ul className="space-y-2">
                    {mockJob.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Company Info */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">About {mockJob.companyInfo.name}</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Company Size</div>
                    <div className="font-medium">{mockJob.companyInfo.size}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Industry</div>
                    <div className="font-medium">{mockJob.companyInfo.industry}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Founded</div>
                    <div className="font-medium">{mockJob.companyInfo.founded}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Location</div>
                    <div className="font-medium">Kigali, Rwanda</div>
                  </div>
                </div>
                <Separator />
                <p className="text-sm text-muted-foreground leading-relaxed">{mockJob.companyInfo.description}</p>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Apply Card */}
            <Card className="sticky top-24">
              <CardContent className="p-6 space-y-4">
                <Dialog open={isApplying} onOpenChange={setIsApplying}>
                  <DialogTrigger asChild>
                    <Button size="lg" className="w-full">
                      Apply Now
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Apply for {mockJob.title}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Select Resume</label>
                        <Select value={selectedResume} onValueChange={setSelectedResume}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a resume" />
                          </SelectTrigger>
                          <SelectContent>
                            {mockResumes.map((resume) => (
                              <SelectItem key={resume.id} value={resume.id}>
                                {resume.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button variant="ghost" size="sm" className="mt-2">
                          <Upload className="h-4 w-4 mr-2" />
                          Upload new resume
                        </Button>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Cover Letter (Optional)</label>
                        <Textarea
                          placeholder="Tell the employer why you're interested in this role..."
                          value={coverLetter}
                          onChange={(e) => setCoverLetter(e.target.value)}
                          rows={4}
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button onClick={handleApply} disabled={!selectedResume} className="flex-1">
                          Submit Application
                        </Button>
                        <Button variant="outline" onClick={() => setIsApplying(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <div className="text-center text-sm text-muted-foreground">
                  <div className="flex items-center justify-center gap-4">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {mockJob.applicants} applicants
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {mockJob.expiresAt} left
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Job Stats */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Job Details</h3>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Job Type</span>
                  <span className="font-medium">{mockJob.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location</span>
                  <span className="font-medium">{mockJob.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Remote Work</span>
                  <span className="font-medium">{mockJob.remote ? "Yes" : "No"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Posted</span>
                  <span className="font-medium">{mockJob.postedAt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expires</span>
                  <span className="font-medium">{mockJob.expiresAt}</span>
                </div>
              </CardContent>
            </Card>

            {/* Similar Jobs */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Similar Jobs</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { title: "Frontend Developer", company: "StartupCo", salary: "$45,000 - $60,000" },
                  { title: "Full Stack Engineer", company: "DevStudio", salary: "$55,000 - $75,000" },
                  { title: "React Developer", company: "TechFlow", salary: "$50,000 - $65,000" },
                ].map((job, index) => (
                  <div key={index} className="space-y-1">
                    <h4 className="font-medium text-sm hover:text-primary cursor-pointer">{job.title}</h4>
                    <div className="text-xs text-muted-foreground">
                      {job.company} • {job.salary}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
